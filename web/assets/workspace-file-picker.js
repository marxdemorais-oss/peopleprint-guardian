// Review happens in this tab. Only the checked records are passed to the draft.
export function createFilePicker({document,attach}) {
 const byId=id=>document.getElementById(id);
 const dialog=byId('file-review');
 const search=byId('file-review-search');
 const list=byId('file-review-list');
 const submit=byId('file-review-add');
 const selected=new Set();
 const pageSize=15;
 let records=[],capacity=0,page=0,matches=[],trigger;
 function render() {
  list.replaceChildren();
  const first=page*pageSize;
  for(const index of matches.slice(first,first+pageSize)){
   const record=records[index];
   const row=document.createElement('article');
   const label=document.createElement('label'),box=document.createElement('input');
   const name=document.createElement('strong'),sample=document.createElement('p');
   name.textContent=record.source;
   box.type='checkbox';
   box.checked=selected.has(index);
   box.disabled=!box.checked&&selected.size>=capacity;
   box.onchange=()=>{
    if(box.checked&&selected.size<capacity)selected.add(index);
    else selected.delete(index);
    updateSelection();
   };
   box.dataset.index=String(index);
   label.append(box,name);
   sample.textContent=record.text.length>170?record.text.slice(0,167)+'…':record.text;
   row.append(label,sample);
   if(record.text.length>170){
    const detail=document.createElement('details'),summary=document.createElement('summary'),full=document.createElement('p');
    summary.textContent='Read full record';full.textContent=record.text;
    detail.append(summary,full);row.append(detail);
   }
   list.append(row);
  }
  byId('file-review-page').textContent=matches.length?`${first+1}–${Math.min(first+pageSize,matches.length)} of ${matches.length}`:'No matching records';
  byId('file-review-prev').disabled=page===0;
  byId('file-review-next').disabled=first+pageSize>=matches.length;
  updateSelection();
 }
 function updateSelection(){
  for(const row of list.children){
   const box=row.querySelector('input');
   box.disabled=!selected.has(Number(box.dataset.index))&&selected.size>=capacity;
  }
  byId('file-review-count').textContent=`${selected.size} selected · up to ${capacity} for this check`;
  submit.disabled=!selected.size;
 }
 function filter(){
  const term=search.value.trim().toLowerCase();page=0;matches=[];
  records.forEach((item,index)=>{
   if(!term||item.source.toLowerCase().includes(term)||item.text.toLowerCase().includes(term))matches.push(index);
  });
  render();
 }
 function clear(){
  records=[];matches=[];selected.clear();list.replaceChildren();
  search.value='';byId('file-review-notices').textContent='';byId('file-review-error').textContent='';
 }
 function close(){dialog.close();clear();trigger?.focus();}
 dialog.addEventListener('close',clear);
 byId('file-review-close').onclick=close;
 search.oninput=filter;
 byId('file-review-prev').onclick=()=>{if(page){page--;render();}};
 byId('file-review-next').onclick=()=>{if((page+1)*pageSize<matches.length){page++;render();}};
 submit.onclick=()=>{
  if(!selected.size)return;
  try{attach(records.filter((_item,index)=>selected.has(index)));close();}
  catch(error){byId('file-review-error').textContent=error.message;}
 };
 return {
  get active(){return Boolean(records.length);},
  open(candidates,notices,remaining,button,{preselectSingle=true}={}){
   clear();records=candidates;capacity=remaining;trigger=button;
   if(preselectSingle&&records.length===1)selected.add(0);
   byId('file-review-notices').textContent=notices.join('\n');
   filter();dialog.showModal();
  }
 };
}
