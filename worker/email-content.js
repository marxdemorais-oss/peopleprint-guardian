import {htmlText,htmlLinkEvidence} from '../web/assets/import-records.js';
// Inert projection shared with EML imports. The transport bounds the payload;
// readable messages are not silently truncated. No resources are loaded.
export function emailHtmlText(html){return typeof html==='string'?htmlText(html):'';}
export function emailReadableContent(email){
 const plain=typeof email.text==='string'?email.text.replace(/\0/g,'').trim():'';
 const htmlOnly=!plain,projection=emailHtmlText(email.html),links=plain?htmlLinkEvidence(projection,{maxLinks:Infinity}):'';
 const body=plain?(plain+(links?'\n\nLinks in the HTML version (unverified):\n'+links:'')):projection;
 const unreadImages=htmlOnly&&typeof email.html==='string'&&/<img\b/i.test(email.html);
 const subject=typeof email.subject==='string'?email.subject.replace(/[\x00-\x1f\x7f]+/g,' ').trim().slice(0,160):'';
 const link=body.match(/^WG-[A-F0-9]{32}$/)||subject.match(/^WG-[A-F0-9]{32}$/);
 if(link)return {text:link[0],subject,htmlOnly,unreadImages,truncated:false};
 if(/^(?:stop|unsubscribe)$/i.test(body.trim()))return {text:body.trim(),subject,htmlOnly,unreadImages,truncated:false};
 const text=body?(subject?'Subject: '+subject+'\n\n':'')+body:'';
 return {text,subject,htmlOnly,unreadImages,truncated:false};
}
