// Only a live, verified login can reopen the encrypted, short-lived transcript.
const slot='guardian-chat-tab-v1',ttl=30*60*1000;
const bytes=hex=>Uint8Array.from(hex.match(/../g),v=>parseInt(v,16));
const hex=buffer=>Array.from(new Uint8Array(buffer),v=>v.toString(16).padStart(2,'0')).join('');
function clearTranscript(){try{sessionStorage.removeItem(slot);}catch{}}
export function clearTabChat(){clearTranscript();clearHandoff();}
export async function openTabChat(scope){
 if(!/^[0-9a-f]{64}$/.test(scope||'')){clearTranscript();return null;}
 const tag=scope.slice(0,32);
 try{
  const key=await crypto.subtle.importKey('raw',bytes(scope.slice(32)),'AES-GCM',false,['encrypt','decrypt']);
  const encoded=sessionStorage.getItem(slot);
  let history=[];
  if(encoded){
   try{
    const data=JSON.parse(encoded);
    if(data.tag===tag && data.expires>Date.now()){
     const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(data.iv)},key,bytes(data.ciphertext));
     const saved=JSON.parse(new TextDecoder().decode(plain));
     // Trust the encrypted expiry so changes to storage cannot extend the retention period.
     if(saved.expires===data.expires && saved.expires>Date.now())history=saved.history;
    }
   }catch{}
   if(!history.length)clearTranscript();
  }
  return {tag,history,async save(items){
   try{
    const iv=crypto.getRandomValues(new Uint8Array(12)),expires=Date.now()+ttl;
    const data=new TextEncoder().encode(JSON.stringify({expires,history:items.slice(-10)}));
    const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,data);
    sessionStorage.setItem(slot,JSON.stringify({tag,expires,iv:hex(iv),ciphertext:hex(ciphertext)}));
   }catch{}
  }};
 }catch{return null;}
}

// One deliberate handoff, within this tab. The ciphertext stays in sessionStorage;
// its independent key travels only in the URL fragment. Neither reaches the server.
const transferSlot='guardian-verify-handoff-v1', transferTTL=10*60*1000;
export function clearHandoff(){try{sessionStorage.removeItem(transferSlot);}catch{}}
export async function prepareHandoff(items,draft=''){
 const keyBytes=crypto.getRandomValues(new Uint8Array(32)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['encrypt']);
 const history=items.slice(-10).filter(turn=>['user','assistant'].includes(turn.role)&&typeof turn.content==='string').map(turn=>({role:turn.role,content:turn.content.slice(0,4000)}));
 const expires=Date.now()+transferTTL;
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify({history,draft:draft.slice(0,16000),expires})));
 sessionStorage.setItem(transferSlot,JSON.stringify({expires,iv:hex(iv),ciphertext:hex(ciphertext)}));
 return '#continue='+hex(keyBytes);
}
export async function takeHandoff(fragment){
 const match=/^#continue=([a-f0-9]{64})$/.exec(fragment||'');if(!match)return null;
 try{
  const raw=sessionStorage.getItem(transferSlot);if(!raw)return null;
  const data=JSON.parse(raw);
  if(data.expires<=Date.now()){clearHandoff();return null;}
  const key=await crypto.subtle.importKey('raw',bytes(match[1]),'AES-GCM',false,['decrypt']);
  const plain=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(data.iv)},key,bytes(data.ciphertext))));
  if(!Number.isSafeInteger(plain.expires)||plain.expires!==data.expires||plain.expires<=Date.now())return null;
  clearHandoff();return plain;
 }catch{return null;}
}
