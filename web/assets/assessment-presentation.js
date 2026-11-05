// Presentation of the existing assessment contract, never a risk probability.
const presentations=Object.freeze({
  caution:Object.freeze({tone:'caution',symbol:'!',label:'Warning signs',action:'Pause and verify',meaning:'An inconsistency or warning pattern needs checking before you act.'}),
  unresolved:Object.freeze({tone:'unresolved',symbol:'?',label:'Needs a check',action:'Confirm the missing detail',meaning:'The available information does not support a conclusion yet.'}),
  consistent:Object.freeze({tone:'consistent',symbol:'✓',label:'Fits the available records',action:'Keep to the confirmed details',meaning:'Consistency with the supplied information is not proof of identity or a safety guarantee.'}),
  unassessed:Object.freeze({tone:'unassessed',symbol:'○',label:'Not assessed',action:'No judgement yet',meaning:'A saved message has not necessarily been assessed.'})
});
export function assessmentPresentation(status){
  return Object.hasOwn(presentations,status)?presentations[status]:presentations.unassessed;
}
