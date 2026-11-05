import test from 'node:test';
import assert from 'node:assert/strict';
import {serviceReadiness} from '../worker/service-readiness.js';
import {handleAdminRequest} from '../worker/admin-service.js';
const origin='https://guardian.test',token='test-admin-'.repeat(4);
test('intake-only reception and operator test availability do not claim AI replies are enabled',()=>{
 const view=serviceReadiness({EMAIL_RECEIVING_ENABLED:'true',X_RECEIVING_ENABLED:'true',WHATSAPP_RECEIVING_ENABLED:'true',MESSENGER_RECEIVING_ENABLED:'true',GUARDIAN_TRANSPORT_TEST_ENABLED:'true',GUARDIAN_TRANSPORT_TEST_OWNER_ID:'fixture_owner'},origin);
 for(const channel of ['email','x','whatsapp','messenger']){const row=view.channels.find(item=>item.channel===channel);assert.equal(row.receivingEnabled,true);assert.equal(row.runtimeEnabled,false);}
 assert.equal(view.transportTestConfigured,true);assert(!JSON.stringify(view).includes('fixture_owner'));
 assert.equal(serviceReadiness({GUARDIAN_TRANSPORT_TEST_OWNER_ID:'bad owner'},origin).transportTestConfigured,false);
});
test('readiness is staff-authenticated and read-only, including when storage is missing',async()=>{
 const env={GUARDIAN_ADMIN_TOKEN:token},url=origin+'/api/internal/admin/readiness';
 assert.equal((await handleAdminRequest(new Request(url),env)).status,403);
 const headers={authorization:'Bearer '+token,'x-guardian-operator':'staff_1'};
 assert.equal((await handleAdminRequest(new Request(url,{method:'POST',headers}),env)).status,405);
 const response=await handleAdminRequest(new Request(url,{headers}),env),view=await response.json();assert.equal(response.status,200);assert.equal(view.storagePresent,false);assert.equal(view.liveValidation,'not_measured');assert.equal(view.readOnly,true);assert.match(response.headers.get('cache-control'),/no-store/);
});
test('present settings and runtime flags remain separate and no network or private records are read',()=>{
 const secret='SYNTHETIC_PRIVATE',env={DB:{prepare(){throw Error('Must not query customer data');}},CONTACT_GATEWAY_SECRET:secret.repeat(3),GUARDIAN_PROVIDER:'fireworks',GUARDIAN_API_KEY:secret,GUARDIAN_MODEL:'test-model',RESEND_API_KEY:secret,RESEND_WEBHOOK_SECRET:secret,WOLFGANG_EMAIL:'wolfgang@example.test',WOLFGANG_EMAIL_FROM:'Wolfgang <wolfgang@example.test>',WOLFGANG_EMAIL_RECEIVING_ADDRESS:'receiving@example.test',WOLFGANG_EMAIL_ENABLED:'false',CONTACT_CHANNELS:'email',GMAIL_CLIENT_ID:secret,GMAIL_CLIENT_SECRET:secret,GMAIL_REDIRECT_URI:origin+'/api/connections/gmail/callback',CONNECTION_ENCRYPTION_KEY:Buffer.alloc(32,4).toString('base64')};
 const view=serviceReadiness(env,origin);assert.equal(view.analysis.settingsPresent,true);assert.equal(view.analysis.provider,'fireworks');assert.deepEqual(view.analysis.issues,[]);assert.equal(view.mailboxes[0].settingsPresent,true);assert.equal(view.mailboxes[0].enabled,false);
 const email=view.channels.find(row=>row.channel==='email');assert.equal(email.settingsPresent,true);assert.equal(email.enabled,false);assert.equal(email.included,true);assert.equal(email.runtimeEnabled,false);assert.equal(view.liveValidation,'not_measured');
 const text=JSON.stringify(view);for(const value of [secret,'receiving@example.test','wolfgang@example.test','test-model'])assert(!text.includes(value));
 assert.equal(serviceReadiness({...env,WOLFGANG_EMAIL_ENABLED:'true'},origin).channels.find(row=>row.channel==='email').runtimeEnabled,true);
});
test('missing inference, invalid origins and an incomplete X route never appear fully configured',()=>{
 const env={DB:{},CONNECTION_ENCRYPTION_KEY:Buffer.alloc(32,4).toString('base64'),GMAIL_CLIENT_ID:'test-client',GMAIL_CLIENT_SECRET:'test-secret',GMAIL_CONNECT_ENABLED:'true',GMAIL_REDIRECT_URI:'https://other.test/api/connections/gmail/callback',WOLFGANG_X_ENABLED:'true',CONTACT_CHANNELS:'x'};
 const view=serviceReadiness(env,origin);assert.equal(view.analysis.settingsPresent,false);assert(view.analysis.issues.includes('api_key'));assert(view.analysis.issues.includes('model'));assert.equal(view.mailboxes[0].enabled,true);assert.equal(view.mailboxes[0].settingsPresent,false);assert.equal(view.channels.find(row=>row.channel==='x').runtimeEnabled,false);
 const invalid=serviceReadiness({...env,GUARDIAN_PROVIDER:'PRIVATE_VALUE'},origin);assert.equal(invalid.analysis.provider,null);assert(!JSON.stringify(invalid).includes('PRIVATE_VALUE'));
});
