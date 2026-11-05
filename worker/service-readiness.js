// A read-only configuration projection. No provider requests, token reads,
// account identifiers or secret values belong in this response.
import {analysisSettings} from './model-provider.js';
import {connectionSettings} from './connections.js';
import {MESSAGE_CHANNELS,nativeMessagingReady,messageChannelEnabled} from './messaging-config.js';
const providers=new Set(['meta','baseten','fireworks','modal','custom']);
const issues=new Set(['unsupported_provider','api_key','model','api_format','api_url','allowed_api_origins','max_input_bytes','max_output_tokens','json_mode']);
export function serviceReadiness(env,origin){
 const analysis=analysisSettings(env),listed=new Set(String(env.CONTACT_CHANNELS||'').split(',').map(item=>item.trim()));
 return {
  storagePresent:Boolean(env.DB),
  analysis:{settingsPresent:analysis.configured,provider:providers.has(analysis.provider)?analysis.provider:null,issues:analysis.configurationErrors.filter(issue=>issues.has(issue)).slice(0,10)},
  mailboxes:['gmail','outlook'].map(provider=>{const prefix=provider==='gmail'?'GMAIL':'OUTLOOK';return {provider,settingsPresent:connectionSettings({...env,[prefix+'_CONNECT_ENABLED']:'true'},provider,origin).configured,enabled:env[prefix+'_CONNECT_ENABLED']==='true'};}),
  channels:MESSAGE_CHANNELS.map(channel=>({channel,settingsPresent:nativeMessagingReady(channel==='x'?{...env,X_CONNECT_ENABLED:'true'}:env,channel),enabled:env['WOLFGANG_'+channel.toUpperCase()+'_ENABLED']==='true',included:listed.has(channel),runtimeEnabled:messageChannelEnabled(env,channel),...(['email','x','whatsapp','messenger'].includes(channel)?{receivingEnabled:env[channel.toUpperCase()+'_RECEIVING_ENABLED']==='true'}:{})})),
  transportTestConfigured:env.GUARDIAN_TRANSPORT_TEST_ENABLED==='true'&&typeof env.GUARDIAN_TRANSPORT_TEST_OWNER_ID==='string'&&/^([A-Za-z0-9_-]+|people:[A-Za-z0-9_-]+)$/.test(env.GUARDIAN_TRANSPORT_TEST_OWNER_ID)&&env.GUARDIAN_TRANSPORT_TEST_OWNER_ID.length<=200,
  liveValidation:'not_measured',asOf:new Date().toISOString(),readOnly:true
 };
}
