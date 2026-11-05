// Long-lived tabs should reread the server balance at renewal. A month can
// exceed the browser's maximum timeout, so wait in chunks without polling.
export function allowanceRenewal(refresh,clock=globalThis){
  let timer;
  return resetsAt=>{
    if(timer!==undefined)clock.clearTimeout(timer);
    timer=undefined;
    const due=Date.parse(resetsAt);
    if(!Number.isFinite(due)||due<=clock.Date.now())return;
    function tick(){
      const delay=due-clock.Date.now();
      if(delay<=0){timer=undefined;refresh();}
      else timer=clock.setTimeout(tick,Math.min(delay,2147483647));
    }
    tick();
  };
}
