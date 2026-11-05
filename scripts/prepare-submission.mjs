// Public exports contain reviewed files from one committed Git tree, never the
// working directory or another repository. No runtime configuration is read.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,writeFile,readdir,lstat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {fixtureModules,directoryDemoTest} from './submission-directory-fixtures.mjs';
import {fileURLToPath} from 'node:url';

const root=path.resolve(import.meta.dirname,'..');
const scripts=new Set(['build-model.mjs','embed-ui.mjs','pack-model-asset.mjs','dev.mjs','local-db.mjs','pack-thigh-contact-colliders.mjs','prepare-submission.mjs','evaluate-context.mjs','evaluate-message-first.mjs']);
scripts.add('submission-directory-fixtures.mjs');
const workers=new Set(['admin-service.js','embedded-model.js','case-reasoning.js','case-scope.js','connection-return.js','connections.js','contact-ingress.js','context-memory.js','email-content.js','guardian-service.js','guest-settings.js','guest-access.js','legacy-analysis.js','live-warnings.js','watch-service.js','watch-mail.js','watch-evidence.js','watch-trigger.js','message-activity.js','message-first-look.js','merge-logins.js','mailbox-connection.js','mailbox-discovery.js','messaging-config.js','messaging-providers.js','messaging-service.js','model-provider.js','official-guidance.js','operator-auth.js','people-auth.js','product-service.js','provider-http.js','public-usage.js','reputation-readiness.js','server.js','service-readiness.js','trial-service.js','user-allowance.js','url-signals.js','url-reputation.js','transport-test.js','wolfgang-conversation.js','wolfgang-directory.js','wolfgang-guide.js','wolfgang-style.js','wolfgang-product-followup.js','wolfgang-reply-quality.js','x-connection.js','x-customer-link.js','x-messaging.js','x-webhook-setup.js','xchat-transport.js']);
const modelInputs=new Set(['expressive-poses.json','greeting-pose.json','source-motion-clips.json','thigh-contact-colliders.json']);
// Contact-claim verification is Guardian analysis code, not the private account service.
workers.add('identity-verification.js');
workers.add('jury-access.js');
workers.add('check-inspector.js');
workers.add('sender-comparison.js');
workers.add('gmail-receipt.js');
workers.add('organisation-reference.js');
workers.add('public-claim-research.js');
workers.add('public-knowledge.js');
workers.add('public-guidance-discovery.js');
workers.add('virustotal-community-usage.js');
// PDFs can contain compressed or encrypted content. Only the reviewed synthetic bytes may ship.
const pdfFixtures=new Map([
 ['tests/fixtures/pdf/sample.pdf','f94b998794dcfeed780abbad8b1f037d8588da761cef15e314b0df544d2a3d5a'],
 ['tests/fixtures/pdf/scan.pdf','58fba7491dc46bf5a2211310b6ed02b8c3f128bb0eb32a4c97157c00c2e76a7a'],
 ['tests/fixtures/pdf/locked.pdf','a14242362d40c41dd42f2784ea9fee77417e6c5cda8fdd4bccaa9c1540ceaaf0']
]);
// Exact, reviewed source fixtures and compressed OCR assets only.
const evidenceBinaries=new Map([
 ['tests/fixtures/evidence/invoice-scan.pdf','ed44cc54adac38a1df04b17f5f70453917d33ad3a0881877d421e3f2eaa09fe9'],
 ['tests/fixtures/evidence/invoice.docx','21bd889faadcd232638f284959f3aac44e4501764580afa9b5ac0eb5dfbaa41a'],
 ['tests/fixtures/evidence/invoice.png','da394cbd7709f8c17adeb7ef47082b4b2c51af18f5cc86bbcfb508f146037eed'],
 ['tests/fixtures/evidence/unsafe.docx','94f9f44c99279b884d33fc3abc550c0d2e86d244c250a38cf39958b68d01f3e2'],
 ['web/assets/evidence-english.gz','1345dd5385e26b647b01c43d9e746fb0d4313d1e08d95e8ece38a5e6f3e79d21'],
 ['web/assets/evidence-ocr.wasm.gz','b3b14df64026d8be536661d20efba7b5bc01ee98219d8b43a3af50587fb9af40']
]);
const blockedParts=new Set(['.git','.openai','.local','.wrangler','.sites-runtime','node_modules','__pycache__','.next','dist','outputs','.tripo']);
const assetExtensions=new Set(['.html','.js','.css','.svg','.png','.webp','.jpg','.jpeg','.ico','.glb','.woff','.woff2']);
const git=(source,args,input)=>execFileSync('git',args,{cwd:source,input,maxBuffer:128*1024*1024,stdio:['pipe','pipe','pipe']});
const sensitiveName=name=>/(?:^|_)(?:SECRET|PASSWORD|TOKEN|API_KEY|PRIVATE_KEY|ENCRYPTION_KEY)(?:$|_)/i.test(name);
const secretPatterns=[
 ['private key',/-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/],
 ['GitHub token',/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/],
 ['AWS access key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
 ['provider key',/\b(?:sk_(?:live|test)_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|re_[A-Za-z0-9_-]{20,}|whsec_[A-Za-z0-9+/=]{20,}|AIza[A-Za-z0-9_-]{35}|GOCSPX-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|EAA[A-Za-z0-9]{40,})\b/],
 ['literal bearer credential',/\bBearer\s+[A-Za-z0-9._~+/-]{24,}/i],
 ['credential URL',/https?:\/\/[^\s/'"<>:]+:[^\s/'"<>@]+@/],
 ['private account implementation',/(?:CREATE\s+TABLE\s+[`"\[]?(?:admin_users|admin_sessions|canonical_accounts)|function\s+handleGuardianIdentity\w*\b|['"]po_admin_session['"])/i]
];
// Exact existing negative-test fixtures. Additional occurrences remain scanned.
const fixtureUrls=new Map([
 ['tests/google-web-risk.test.js',['https://user:'+'pass@example.com/']],
 ['tests/url-reputation.test.js',['https://user:'+'secret@example.com/login']],
 ['tests/model-provider.test.js',['https://user:'+'pass@api.fireworks.ai/v1']],
 ['tests/url-signals.test.js',['https://paypal.com:'+'secret@acme.test/a/private?code=1234']],
 ['tests/people-auth.test.js',['http://user:'+'pass@other.example/path']],
 ['tests/wolfgang-conversation.test.js',['https://user:'+'pass@provider.example/v1/responses','https://user:'+'pass@voice.example/speech']]
]);
const credentialFixtures=new Map([['tests/wolfgang-conversation.test.js',new Set(['server-only-test-key'])]]);

function privateDirectoryMaterial(name){
 const [folder]=name.split('/'),base=path.posix.basename(name);
 if(folder==='web')return base.startsWith('uk-')&&base!=='uk-directory.js';
 if(folder==='scripts')return /^(?:test_refresh_uk_|refresh-uk-|review-uk-)/.test(base);
 return folder==='tests'&&(/^(?:uk-|admin-uk-directory)/.test(base)||base==='public-knowledge.test.js');
}

export function approvedSource(name){
 if(typeof name!=='string'||!name||name.includes('\\')||name.includes('\0')||name.startsWith('/')||name.split('/').some(part=>!part||part==='.'||part==='..'||blockedParts.has(part)))return false;
 if(['package.json','pnpm-lock.yaml','pnpm-workspace.yaml','.env.example','db/schema.ts'].includes(name))return true;
 if(pdfFixtures.has(name)||evidenceBinaries.has(name)||['docs/EVIDENCE_IMPORT.md','docs/LINK_REPUTATION.md','web/assets/evidence-notices.txt','docs/licenses/evidence-apache.LICENSE','docs/licenses/evidence-sax.LICENSE','docs/licenses/english-data-copyright.txt'].includes(name))return true;
 const parts=name.split('/'),base=parts.at(-1);
 if(fixtureModules.has(name))return false;
 if(privateDirectoryMaterial(name))return false;
 if(base.startsWith('.')||/\.(?:sqlite3?|db|log|pem|key|pfx|pyc|zip|tar|gz)$/i.test(base))return false;
 if(parts[0]==='web'&&parts.length<=3)return (parts.length===2&&name.endsWith('.html'))||(parts[1]==='assets'&&assetExtensions.has(path.posix.extname(base)));
 if(parts[0]==='worker'&&parts.length===2)return workers.has(base);
 if(parts[0]==='scripts'&&parts.length===2)return scripts.has(base);
 if(parts[0]==='evaluation'&&parts.length===2)return ['context-cases.js','message-cases.js','runner.js'].includes(base);
 if(parts[0]==='tests'&&parts.length===2)return base.endsWith('.test.js')||base==='png-alpha.js';
 if(parts[0]==='model')return (parts.length===2&&base.endsWith('.js'))||(parts.length===3&&parts[1]==='reconstruction'&&modelInputs.has(base));
 return parts[0]==='drizzle'&&((parts.length===2&&/^\d{4}_[a-z0-9_]+\.sql$/.test(base))||(parts.length===3&&parts[1]==='meta'&&base==='_journal.json'));
}

export function parseTree(data){
 return data.toString('utf8').split('\0').filter(Boolean).map(record=>{
  const match=/^(\d{6}) (blob|tree|commit) ([a-f0-9]{40,64})\t(.+)$/.exec(record);
  if(!match)throw new Error('Invalid Git tree entry.');
  const [,mode,type,object,name]=match;return {mode,type,object,name};
 });
}

export function selectEntries(data){
 const entries=parseTree(data).filter(entry=>approvedSource(entry.name));
 for(const entry of entries)if(entry.type!=='blob'||!['100644','100755'].includes(entry.mode))throw new Error('Unsafe source entry: '+entry.name);
 return entries;
}

export function collectSnapshot(source=root){
 const commit=git(source,['rev-parse','--verify','HEAD^{commit}']).toString().trim();
 const entries=selectEntries(git(source,['ls-tree','-rz','--full-tree',commit]));
 const packed=git(source,['cat-file','--batch'],entries.map(entry=>entry.object+'\n').join(''));
 const files=new Map();let offset=0;
 for(const entry of entries){
  const end=packed.indexOf(10,offset),header=packed.subarray(offset,end).toString(),match=/^([a-f0-9]{40,64}) blob (\d+)$/.exec(header);
  if(end<0||!match||match[1]!==entry.object)throw new Error('Invalid committed source object.');
  const size=Number(match[2]),start=end+1;offset=start+size+1;
  if(offset>packed.length||packed[offset-1]!==10)throw new Error('Truncated committed source object.');
  files.set(entry.name,Buffer.from(packed.subarray(start,start+size)));
 }
 return {commit,files};
}

export function scanPublicFiles(files){
 const issues=[];
 for(const [name,data] of files){
  if(fixtureModules.has(name)){
   if(Buffer.from(data).toString()!==fixtureModules.get(name))issues.push(name+': private directory module');
  }else if(privateDirectoryMaterial(name))issues.push(name+': private directory material');
  if(evidenceBinaries.has(name)&&createHash('sha256').update(data).digest('hex')!==evidenceBinaries.get(name))issues.push(name+': unreviewed evidence binary');
  if(pdfFixtures.has(name)&&createHash('sha256').update(data).digest('hex')!==pdfFixtures.get(name))issues.push(name+': unreviewed PDF fixture');
  // Scan binary bytes too: a NUL does not make an embedded secret acceptable.
  let text=Buffer.from(data).toString('utf8');
  for(const fixture of fixtureUrls.get(name)||[])text=text.replace(fixture,'https://invalid-credential-fixture.example.test');
  for(const [label,pattern] of secretPatterns)if(pattern.test(text))issues.push(name+': potential '+label);
  for(const match of text.matchAll(/\b([A-Za-z][A-Za-z0-9_]*(?:SECRET|TOKEN|API_KEY|PASSWORD|PRIVATE_KEY|ENCRYPTION_KEY)|(?:access|refresh)_token)\b['"]?\s*[:=]\s*['"]([^'"\r\n]{20,})['"]/gi)){
   if(sensitiveName(match[1])&&!credentialFixtures.get(name)?.has(match[2]))issues.push(name+': non-placeholder credential literal');
  }
  if(name==='.env.example')for(const line of text.split(/\r?\n/)){
   if(/^\s*(?:#|$)/.test(line)||!line.includes('='))continue;
   const split=line.indexOf('='),key=line.slice(0,split).trim(),value=line.slice(split+1).trim();
   if(value&&sensitiveName(key))issues.push(name+': non-empty sensitive placeholder '+key);
  }
 }
 if(issues.length)throw new Error('Public export needs review; values omitted:\n'+[...new Set(issues)].join('\n'));
}

export function preparePublicFiles(snapshot){
 const files=new Map(snapshot.files);
 for(const [name,fixture] of fixtureModules)files.set(name,Buffer.from(fixture));
 files.set('tests/standalone-directory.test.js',Buffer.from(directoryDemoTest));
 for(const name of ['package.json','pnpm-lock.yaml','pnpm-workspace.yaml','.env.example','web/assets/wolfgang.glb','worker/server.js',...['build-model.mjs','embed-ui.mjs','dev.mjs','local-db.mjs','prepare-submission.mjs'].map(name=>'scripts/'+name)])if(!files.has(name))throw new Error('Required committed public source is missing: '+name);
 const pkg=JSON.parse(files.get('package.json').toString());
 pkg.scripts={build:'node scripts/build-model.mjs && node scripts/embed-ui.mjs',test:'node --test',dev:'node scripts/dev.mjs','evaluate:context':'node scripts/evaluate-context.mjs'};
 files.set('package.json',Buffer.from(JSON.stringify(pkg,null,2)+'\n'));
 files.set('.gitignore',Buffer.from('node_modules/\n.env\n.env.*\n!.env.example\n.dev.vars*\n.local/\nworker/index.js\ndist/\n'));
 files.set('README.md',Buffer.from(`# Peopleprint Guardian\n\nGuardian is the customer-facing application. Canonical accounts, email verification, session validation and the operator dashboard are separately hosted private People Organised services. Only Guardian integration clients are included here; see SERVICE_BOUNDARY.md.\n\n## Run locally\n\nUse Node 22.13 or later. Run pnpm install --frozen-lockfile, pnpm build, then pnpm dev. Run pnpm test after building. The local preview has an explicitly local QA identity and does not create a production People Organised account. Open /tour to compare a fictional invoice with its earlier agreement. The first reading works immediately and the live guided choices use the configured Meta connection. A signed-in check can research a public organisation’s stated practice, then verify the passage on its official site. Tests use synthetic fixtures and mocked providers, not production data or credentials.\n\n## UK directory in the standalone package\n\nThe production UK directory, stored policy passages, staff administration and directory refresh scripts are omitted. The household directory contains only fictional Northline Water. Several public reference examples used by the tour and mocked tests are included separately. Production catalogue-specific tests are replaced by a standalone fixture test.\n\n## Source and model inputs\n\nThis package exports approved blobs from Guardian commit ${snapshot.commit}; it contains no Git history. The shipped wolfgang.glb, controller source and required authored pose/collider data are included. Building bundles the controller around that authoritative asset; it does not regenerate the original 3D model. Historical generation tools, paid source GLBs and raw motion captures are outside this application-source package.\n\nA working live deployment needs independently configured identity-service access, an inference provider and any enabled account/messaging integrations. Tests do not establish live provider accuracy. Confirm the external-service scope satisfies the final hackathon rules; this package does not claim organiser approval.\n`));
 files.set('SERVICE_BOUNDARY.md',Buffer.from('# Private service boundary\n\nPeople Organised owns canonical accounts, email codes, code attempt limits, session issuance/revocation and operator permissions in a separately deployed private repository. Guardian stores service preferences and checks keyed by a canonical subject, not a second login account.\n\nworker/people-auth.js is only a server-side integration client. worker/admin-service.js is a bounded, credential-protected data API consumed by the separate private operator service; it contains no operator screens or canonical account implementation. Both bridge credentials come from runtime configuration.\n\nNever add private account/admin implementation, production data or runtime secrets to this package or its Git history. Judges need separately provisioned service access or synthetic fixtures, never production administrator credentials.\n'));
 scanPublicFiles(files);return files;
}

export async function writePublicExport(destination,files,{sourceRoot=root}={}){
 scanPublicFiles(files);
 const source=await realpath(sourceRoot),dest=path.resolve(destination);
 let existing;try{existing=await lstat(dest);}catch(error){if(error.code!=='ENOENT')throw error;}
 if(existing?.isSymbolicLink()||existing&&!existing.isDirectory())throw new Error('Choose an empty regular output directory.');
 const parent=await realpath(path.dirname(dest)),resolved=path.join(parent,path.basename(dest));
 if(resolved===source||resolved.startsWith(source+path.sep))throw new Error('Choose an output directory outside the repository.');
 if(existing&&(await readdir(dest)).length)throw new Error('The output directory must be empty.');
 for(const name of files.keys())if(name.startsWith('/')||name.includes('\\')||name.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error('Unsafe output filename.');
 await mkdir(dest,{recursive:false}).catch(error=>{if(error.code!=='EEXIST')throw error;});
 for(const [name,data] of files){const target=path.join(dest,name);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,data,{flag:'wx'});}
}

export async function exportSubmission(destination,{sourceRoot=root}={}){
 if(!destination)throw new Error('Choose an empty output directory outside the repository.');
 if(git(sourceRoot,['status','--porcelain','--untracked-files=all']).length)throw new Error('Source must be committed and clean before export.');
 const snapshot=collectSnapshot(sourceRoot),files=preparePublicFiles(snapshot);
 await writePublicExport(destination,files,{sourceRoot});
 return {directory:path.resolve(destination),commit:snapshot.commit,files:files.size,privateAccountCodeIncluded:false,gitHistoryIncluded:false};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(JSON.stringify(await exportSubmission(process.argv[2])));}catch(error){console.error(error.message);process.exitCode=1;}
}
