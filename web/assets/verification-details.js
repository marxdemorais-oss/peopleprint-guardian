import {renderOfficialGuidance} from './official-guidance.js';

export function renderVerificationDetails(root,result,{now=Date.now()}={}){
 const verification=result?.identityVerification,reputation=result?.linkReputation;
 // New checks keep the two provider observations separate. Older saved cases
 // still contain a single observation and must retain their original finding.
 const reports=Array.isArray(reputation?.checks)
  ?reputation.checks.filter(report=>report&&typeof report==='object'&&!Array.isArray(report)).slice(0,2)
  :reputation?[reputation]:[];
 const research=result?.publicResearch;
 if(!verification&&!reputation&&!result?.officialGuidance&&!research)return;
 for(const report of reports.filter(report=>report.provider==='Google Web Risk'&&report.status==='flagged')){
  const notice=document.createElement('p');notice.className='wk-risk-notice';
  const expired=!(Date.parse(report.expiresAt)>now);
  notice.textContent=(expired?'Historical Google Web Risk result: the lookup has expired. Recheck for a current result. ':'Google Web Risk reported a potential threat. ')+(report.advisory||'');root.append(notice);
 }
 const details=document.createElement('details');details.className='wk-verification';
 const summary=document.createElement('summary');summary.textContent='See what I checked';details.append(summary);
 const paragraph=(parent,value,tag='p')=>{const node=document.createElement(tag);node.textContent=value;parent.append(node);return node;};
 if(verification){
  const rows=Array.isArray(verification.rows)?verification.rows.slice(0,45):[];
  if(rows.length){
   const list=document.createElement('dl');list.className='wk-verification-list';
   for(const row of rows){
    const item=document.createElement('div');item.className='wk-verification-row';
    paragraph(item,row.label||'Detail checked','dt');const description=paragraph(item,row.detail||'Unverified','dd');
    // Only app-owned reference links become clickable. Received email addresses,
    // URLs, telephone numbers and model-supplied destinations stay inert text.
    const source=row.caseSource;
    if(source){const link=document.createElement('a');link.href=source.url;link.textContent=source.name;link.target='_blank';link.rel='noopener noreferrer';description.append(link);}
    if(row.kind==='directory'&&source?.websiteUrl&&source.websiteUrl!==source.url){
     const site=document.createElement('a');site.href=source.websiteUrl;site.textContent='Open the listed website';site.target='_blank';site.rel='noopener noreferrer';description.append(site);
    }
    if(row.directoryCheckedOn&&/^\d{4}-\d{2}-\d{2}$/.test(row.directoryCheckedOn)&&Number.isFinite(Date.parse(row.directoryCheckedOn)))paragraph(description,'Directory reference reviewed '+new Date(row.directoryCheckedOn).toLocaleDateString('en-GB',{dateStyle:'medium',timeZone:'UTC'}),'small');
    if(row.checkedAt&&Number.isFinite(Date.parse(row.checkedAt)))paragraph(description,'Reference checked '+new Date(row.checkedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'})+' UTC','small');
    list.append(item);
   }
   details.append(list);
  }else paragraph(details,'The wording was assessed. No contact details could be independently compared.');
  paragraph(details,verification.scope||'Unconfirmed details remain unverified.','small');
 }
 if(research?.caseSource){
  const name=research.caseSource.name;
  paragraph(details,name+' · published guidance','h3');
  const url=research.caseSource.url;
  if(research.status==='published'&&url&&typeof research.quote==='string'&&Number.isFinite(Date.parse(research.checkedAt))){
   paragraph(details,research.quote,'blockquote');
   const link=document.createElement('a');link.href=url;link.textContent='Read the official source';link.target='_blank';link.rel='noopener noreferrer';details.append(link);
   paragraph(details,'Checked '+new Date(research.checkedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'})+' UTC. The guidance describes the organisation’s practice. Who sent this message remains unverified.','small');
  }else paragraph(details,'I couldn’t confirm this practice from an official source.');
 }
 renderOfficialGuidance(details,result.officialGuidance);
 if(reputation){
  const block=document.createElement('section');block.className='wk-verification-reputation';
  paragraph(block,'Link reputation','h3');
  for(const report of reports){
   const finding=document.createElement('section');finding.className='wk-verification-provider';
   paragraph(finding,report.provider||'Reputation provider','h4');
   const expired=report.provider==='Google Web Risk'&&['flagged','no_flags'].includes(report.status)&&!(Date.parse(report.expiresAt)>now);
   if(expired)paragraph(finding,'This saved lookup has expired. It is historical evidence, not a current link warning or clearance. Run the check again for a fresh lookup.');
   paragraph(finding,(expired?'At the time of this check: ':'')+(report.note||'Not checked.'));
   if(report.advisory&&!report.note?.includes(report.advisory))paragraph(finding,report.advisory,'small');
   if(Number.isFinite(Date.parse(report.checkedAt)))paragraph(finding,'Lookup '+new Date(report.checkedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'})+' UTC','small');
   if(Number.isFinite(Date.parse(report.reportedAt)))paragraph(finding,'Report analysed '+new Date(report.reportedAt).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'})+' UTC','small');
   block.append(finding);
  }
  if(!reports.length)paragraph(block,'No provider finding was saved. The link remains unverified.');
  details.append(block);
 }else if(verification?.rows?.some(row=>row.kind==='website'))paragraph(details,'Live link reputation was not checked. A matching domain is not a safety verdict.');
 root.append(details);
}
