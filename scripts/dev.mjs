import http from 'node:http';
import worker from '../worker/index.js';
import {localDatabase} from './local-db.mjs';
const portArg=process.argv.indexOf('--port');
const port=Number(portArg>=0?process.argv[portArg+1]:process.env.PORT||3000);
const DB=localDatabase();
http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://'+req.headers.host);
  // Clearly scoped local QA identity. This route and cookie do not exist in production.
  if(url.pathname==='/__qa/start'){const next=url.searchParams.get('to')||'/welcome';res.writeHead(302,{'Location':['/welcome','/workspace','/connections','/account'].includes(next)?next:'/welcome','Set-Cookie':'guardian_local_qa=1; Path=/; HttpOnly; SameSite=Lax'});res.end();return;}
  if(url.pathname==='/__qa/mobile'){const allowed=['/workspace','/welcome','/connections','/account','/signup','/login'];const target=url.searchParams.get('view');const src=allowed.includes(target)?target:'/';res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><html><head><title>390px responsive preview</title></head><body style="margin:0;background:#e7ebe9;display:flex;justify-content:center"><iframe title="Mobile Guardian" src="'+src+'" style="width:390px;height:844px;border:0;margin:20px;background:white"></iframe></body></html>');return;}
  const headers=new Headers(req.headers);headers.delete('oai-authenticated-user-id');headers.delete('oai-authenticated-user-email');headers.delete('oai-authenticated-user-full-name');
  if((req.headers.cookie||'').split(';').some(c=>c.trim()==='guardian_local_qa=1')){headers.set('oai-authenticated-user-id','local-qa-only');headers.set('oai-authenticated-user-email','preview@example.test');headers.set('oai-authenticated-user-full-name','Alex');}
  const chunks=[];let size=0;for await(const part of req){size+=part.length;if(size>300000){res.writeHead(413);res.end();return;}chunks.push(part);}const body=Buffer.concat(chunks);
  const request=new Request(url,{method:req.method,headers,...(body.length?{body}:{} )});
  const env={DB,...Object.fromEntries(Object.entries(process.env).filter(([key])=>/^(PEOPLE_ORGANISED_AUTH_ORIGIN$|GUARDIAN_|WOLFGANG_|GMAIL_|OUTLOOK_|MAILBOX_|CONNECTION_|CONTACT_|META_|MESSAGING_|WHATSAPP_|MESSENGER_|INSTAGRAM_|TWILIO_|RESEND_|WOLFGANG_CONTACT_|MODEL_API_KEY$)/.test(key)))};
  const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
}catch(error){console.error('Local preview:',error.message);res.writeHead(500);res.end('Development server error');}}).listen(port,'0.0.0.0',()=>console.log('Guardian development server ready on port '+port));
