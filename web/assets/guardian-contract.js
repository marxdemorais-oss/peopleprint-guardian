import {validateDirectorCommand} from './wolfgang-director.js';
// Shared browser/server contract. Account identity is always supplied by the server.
export const CONTRACT_VERSION='guardian.investigation.v1';
export const REACTIONS=['attending','asking','explaining','caution','reassuring'];
export function validateInvestigation(input){
  if(!input||input.schema!==CONTRACT_VERSION||typeof input.message!=='string')throw new Error('Provide a message to check.');
  if(!['email','message','social','website','phone','payment','other'].includes(input.channel))throw new Error('Choose a supported source.');
  if(!Array.isArray(input.evidence)||input.evidence.length>12)throw new Error('Use up to twelve selected records.');
  const seen=new Set();const evidence=input.evidence.map(e=>{if(!e||typeof e.id!=='string'||!/^ev-[a-z0-9-]{1,60}$/.test(e.id)||seen.has(e.id)||typeof e.text!=='string'||e.text.length>20000||typeof e.source!=='string'||e.source.length>160)throw new Error('A record has an invalid format.');seen.add(e.id);return {id:e.id,source:e.source,text:e.text,provenance:'user_supplied',confirmed:false};});
  if(!input.message.trim()&&!evidence.some(e=>e.text.trim()))throw new Error('Add a message or a readable record to begin.');
  return {schema:CONTRACT_VERSION,message:input.message.trim(),channel:input.channel,evidence,preferences:{detail:input.preferences?.detail==='expanded'?'expanded':'brief',tone:input.preferences?.tone==='warm'?'warm':'direct'},scope:'selected_records'};
}
export function validateAssessment(result,evidence){
  const ids=new Set(evidence.map(e=>e.id));
  if(!result||!['caution','consistent','unresolved'].includes(result.status)||!['headline','explanation','nextStep'].every(k=>typeof result[k]==='string'&&result[k].length>0&&result[k].length<4000))throw new Error('Incomplete assessment.');
  if(!Array.isArray(result.evidenceIds)||result.evidenceIds.length>12||result.evidenceIds.some(id=>!ids.has(id)))throw new Error('Assessment cites an unavailable source.');
  if(!Array.isArray(result.questions)||result.questions.length>3||result.questions.some(q=>typeof q!=='string'||q.length>500))throw new Error('Invalid follow-up questions.');
  const motion=result.motion===undefined?null:validateDirectorCommand(result.motion,{caution:result.status==='caution'});
  return {status:result.status,headline:result.headline,explanation:result.explanation,nextStep:result.nextStep,evidenceIds:result.evidenceIds,questions:result.questions,reaction:REACTIONS.includes(result.reaction)?result.reaction:'explaining',...(motion?{motion}:{})};
}
