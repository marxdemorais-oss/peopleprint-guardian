import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {verifyGoogleReceipt} from '../worker/gmail-receipt.js';
import {attachMailOrigins,attachVerifiedMailReceipts} from '../worker/live-warnings.js';
import {verifyIdentityEvidence} from '../worker/identity-verification.js';

const keys=generateKeyPairSync('rsa',{modulusLength:2048});
const p=keys.publicKey.export({type:'spki',format:'der'}).toString('base64');
const domain='acme.example';
const from='Acme <staff@acme.example>';
const signer=s=>sign('sha256',Buffer.from(s,'latin1'),keys.privateKey).toString('base64');
const selector='arc-20240605';
const fetchKey=async(url,opts)=>{
 assert.equal(url,'https://dns.google/resolve?type=TXT&name='+selector+'._domainkey.google.com');
 assert.equal(opts.redirect,'manual');assert.equal(opts.headers.Authorization,undefined);
 return Response.json({Status:0,Answer:[{name:selector+'._domainkey.google.com.',TTL:60,type:16,data:'"v=DKIM1; k=rsa; p='+p.slice(0,150)+'" "'+p.slice(150)+'"'}]});
};
function envelope(status='pass',overrides={}){
 const body='Invoice attached.\r\n',bh=createHash('sha256').update(body).digest('base64');
 const aar='i=1; mx.google.com; dkim=pass header.i=@acme.example; dmarc='+status+' (p=REJECT sp=REJECT dis=NONE) header.from='+(overrides.domain||domain);
 const am='i=1; a=rsa-sha256; c=relaxed/relaxed; d=google.com; s='+selector+'; h=subject:from; bh='+bh+'; b=';
 const ms=am+signer('subject:Invoice\r\nfrom:'+from+'\r\narc-message-signature:'+am);
 const se='i=1; a=rsa-sha256; cv=none; d=google.com; s='+selector+'; b=';
 const seal=se+signer('arc-authentication-results:'+aar+'\r\narc-message-signature:'+ms+'\r\narc-seal:'+se);
 return ['ARC-Seal: '+seal,'ARC-Message-Signature: '+ms,'ARC-Authentication-Results: '+aar,'From: '+from,'Subject: Invoice','',body].join('\r\n');
}
test('first-hop Google ARC signatures bind the exact DMARC finding, signed From, headers and body',async()=>{
 for(const status of ['pass','fail'])assert.deepEqual(await verifyGoogleReceipt(envelope(status),from,fetchKey),{domain,status});
 assert.deepEqual(await verifyGoogleReceipt(envelope().replace('attached.\r\n','attached. \t\r\n\r\n'),from,fetchKey),{domain,status:'pass'});
});
test('tampering, header duplicates, other signers and unsigned declarations fail closed',async()=>{
 const raw=envelope();
 for(const msg of [
  raw.replace('dmarc=pass','dmarc=fail'),raw.replace('Subject: Invoice','Subject: Pay instead'),
  raw.replace('Invoice attached.','Pay me.'),raw.replace('Subject: Invoice','From: x@other.example\r\nSubject: Invoice'),
  raw.replace('c=relaxed/relaxed;', 'c=relaxed/relaxed; l=10;'),raw.replace('cv=none','cv=pass'),
  raw.replace('d=google.com','d=other.example'),raw.replace('mx.google.com','similar.google.example'),
  raw.replace('i=1; mx.google.com;', 'i=1; mx.google.com; dmarc=pass header.from=other.example;'),
  'Authentication-Results: mx.google.com; dmarc=pass header.from=acme.example\r\nFrom: '+from+'\r\n\r\nBody',
  envelope('pass',{domain:'other.example'})
 ])assert.equal(await verifyGoogleReceipt(msg,from,fetchKey),null);
 assert.equal(await verifyGoogleReceipt(raw,'Acme <elsewhere@acme.example>',fetchKey),null);
 assert.equal(await verifyGoogleReceipt(raw,from,async()=>new Response('failed',{status:503})),null);
});
test('an owner-bound individual receipt survives mixing with other records, but cannot attach to a different owner, text or claimed domain',async()=>{
 const env={GUARDIAN_IDENTITY_SECRET:crypto.randomUUID()},owner='original';
 const record={id:'ev-mail-a',source:'Gmail · invoice',text:'From: '+from},second={id:'ev-other',source:'Customer record',text:'From: '+from};
 const packet={...record,mailAuthentication:{domain,status:'pass'}};
 const request=new Request('https://guardian.example/api/connections/gmail/search');
 const signed=await (await attachMailOrigins(Response.json({records:[packet]}),request,env,owner)).json();
 const proof=signed.records[0].originProof,proofs={[record.id]:proof};
 const records=[{...record},second];await attachVerifiedMailReceipts(env,owner,records,proofs);
 assert.deepEqual(records[0].gmailReceipt,{domain,status:'pass'});assert.equal(second.gmailReceipt,undefined);
 for(const [who,rec,pf] of [['other',record,proof],[owner,{...record,text:'edited'},proof],[owner,record,{...proof,auth:{domain:'other.example',status:'pass'}}]]){
  await assert.rejects(()=>attachVerifiedMailReceipts(env,who,[{...rec}],{[rec.id]:pf}));
 }
 const preserved=[{...record}];await attachVerifiedMailReceipts(env,owner,preserved,null,records);assert.deepEqual(preserved[0].gmailReceipt,records[0].gmailReceipt);
 const changed=[{...record,source:'other'}];await attachVerifiedMailReceipts(env,owner,changed,null,records);assert.equal(changed[0].gmailReceipt,undefined);
 const report=await verifyIdentityEvidence('From: '+from,records,{gmailReceipts:new Map([[record.id,{domain,status:'pass'}]])});
 assert.deepEqual(report.rows.filter(r=>r.kind==='authentication'&&r.status==='domain_only').map(r=>r.evidenceId),[record.id]);
 assert.ok(report.rows.some(r=>r.kind==='authentication'&&r.status==='unverified'&&!r.evidenceId));
});

test('a signed-in Gmail lookup verifies the original bytes and returns a dossier even if the optional raw lookup fails',async()=>{
 const {encryptConnectionValue,searchConnectedMail}=await import('../worker/connections.js');
 const owner='owner',env={GMAIL_CONNECT_ENABLED:'true',CONNECTION_ENCRYPTION_KEY:Buffer.alloc(32,21).toString('base64')};
 const encrypted_token=await encryptConnectionValue({scope:'https://www.googleapis.com/auth/gmail.readonly',access_token:'access',refresh_token:'refresh',expires_at:Date.now()+3600000},env,owner,'gmail');
 env.DB={prepare:query=>({bind:()=>({first:async()=>query.includes('SELECT 1')?{active:1}:{encrypted_token,status:'connected'}})})};
 const raw=envelope(),payload={mimeType:'text/plain',headers:[
  {name:'Subject',value:'Invoice'},{name:'From',value:from},
  {name:'ARC-Authentication-Results',value:'i=1; mx.google.com; dmarc=pass header.from=acme.example'}
 ],body:{data:Buffer.from('Invoice attached.').toString('base64url')}};
 for(const readable of [true,false]){
  const requests=[];
  const fetcher=async(url,init)=>{
   requests.push(url);
   if(url.startsWith('https://dns.google/'))return fetchKey(url,init);
   assert.equal(new URL(url).hostname,'gmail.googleapis.com');assert.equal(init.headers.Authorization,'Bearer access');
   if(url.includes('?q='))return Response.json({messages:[{id:'one'}]});
   if(url.endsWith('format=full'))return Response.json({id:'one',sizeEstimate:raw.length,payload});
   assert.ok(url.endsWith('format=raw'));
   return readable?Response.json({id:'one',raw:Buffer.from(raw,'latin1').toString('base64url')}):new Response('unavailable',{status:404});
  };
  const {records}=await searchConnectedMail(env,owner,'gmail','invoice',{fetcher});
  assert.equal(records.length,1);assert.ok(records[0].text.includes('Invoice attached.'));
  assert.deepEqual(records[0].mailAuthentication,readable?{domain,status:'pass'}:undefined);
  assert.equal(requests.length,readable?4:3);
 }
});

test('a failed receiving-domain check blocks reassurance only for the incident email and preserves stronger safety advice',async()=>{
 const {groundAssessment}=await import('../worker/message-first-look.js');
 const rec={id:'ev-mail-selected',source:'Gmail · Invoice',text:'From: '+from+'\nInvoice attached.'};
 const options={gmailReceipts:new Map([[rec.id,{domain,status:'fail'}]])};
 const good={status:'consistent',headline:'The records agree.',explanation:'This looks familiar.',nextStep:'Check the invoice.',evidenceIds:[rec.id],questions:[],reaction:'reassuring'};
 const current=await verifyIdentityEvidence('Check this email',[rec],options);
 const historical=await verifyIdentityEvidence('My supplier sent another invoice. This is the previous email.',[rec],options);
 const failure=groundAssessment(good,[],null,current);assert.equal(failure.status,'caution');assert.match(failure.explanation,/could not authenticate/);
 assert.deepEqual(groundAssessment(good,[],null,historical),good);
 const recovery={recovery:true,clue:'Already paid',action:'Call your bank.'};
 assert.equal(groundAssessment(good,[recovery],null,current).nextStep,recovery.action);
 const code={topic:'verificationCode',clue:'Someone asked for a code.',action:'Keep that code private.'};
 assert.equal(groundAssessment(good,[code],null,current).nextStep,code.action);
});
