const titles={scope_started:'Follow-up relationship check',scope_decided:'Follow-up relationship result',access_checked:'Access and selected evidence',context_retrieved:'Earlier context',references_started:'Reference checks started',references_returned:'Reference findings',public_research_started:'Public research started',public_research_returned:'Public research findings',model_requested:'AI assessment requested',model_returned:'AI response received',assessment_validated:'Evidence and result checked',saved:'Result saved',error:'Assessment interrupted'};
export function renderInspection(root,status,data,{expanded=false}={}){
 const opened=new Set([...root.querySelectorAll('li')].filter(li=>li.querySelector('details')?.open).map(li=>li.dataset.event));
 root.replaceChildren();
 status.textContent=data.integrity==='failed'?'The recorded steps could not be verified. Do not rely on this log.':data.events?.length?'Recorded server actions · '+(data.integrity==='verified'?'signatures verified':'signature verification unavailable'):'No recorded actions for this check yet. Checks made before this feature was added have no retrospective log.';
 for(const event of data.events||[]){
  const li=document.createElement('li'),title=document.createElement('strong'),time=document.createElement('time'),summary=document.createElement('p');
  li.dataset.event=event.attemptId+':'+event.sequence;
  title.textContent=titles[event.kind]||event.kind;time.dateTime=event.recordedAt;time.textContent=new Date(event.recordedAt).toLocaleTimeString('en-GB');summary.textContent=event.detail.summary||'';li.append(title,time,summary);
  if(expanded){const details=document.createElement('details'),label=document.createElement('summary'),pre=document.createElement('pre');label.textContent=event.kind==='model_requested'?'Model and data supplied':'Recorded details';pre.textContent=JSON.stringify(event.detail,null,2);details.open=opened.has(li.dataset.event);details.append(label,pre);li.append(details);}
  root.append(li);
 }
}
export function watchInspection(checkId,root,status,{live=false,expanded=false,onChange=()=>{}}={}){
 let disposed=false,events=null,lastSnapshot='';
 const url='/api/checks/'+encodeURIComponent(checkId);
 const show=data=>{const snapshot=JSON.stringify(data);if(!disposed&&snapshot!==lastSnapshot){lastSnapshot=snapshot;renderInspection(root,status,data,{expanded});onChange(data);}};
 fetch(url+'/inspection',{cache:'no-store',credentials:'same-origin'}).then(async r=>{if(!r.ok)throw Error();show(await r.json());}).catch(()=>{if(!disposed)status.textContent='The activity log could not be loaded. The assessment and its sources remain available.';});
 if(live&&globalThis.EventSource){events=new EventSource(url+'/events');events.addEventListener('snapshot',e=>{try{show(JSON.parse(e.data));}catch{status.textContent='An activity update could not be read.';}});events.onerror=()=>{if(!disposed&&!lastSnapshot)status.textContent='Connecting to the activity log…';};}
 return ()=>{disposed=true;events?.close();};
}
