import {mountWolfgang} from './wolfgang.js';
import {wolfgangBridge} from './wolfgang-bridge.js';
import {mountConversation} from './wolfgang-conversation.js';
mountWolfgang();
mountConversation();
const content=document.querySelector('#context-content'), conclusion=document.querySelector('#context-conclusion');
for(const button of document.querySelectorAll('[data-context]'))button.addEventListener('click',()=>{
const personal=button.dataset.context==='personal';
for(const b of document.querySelectorAll('[data-context]'))b.setAttribute('aria-pressed',String(b===button));
content.innerHTML=personal?'<div class="evidence-row"><span>12 OCT · EMAIL</span><div><strong>Your solicitor’s original instructions</strong>Payment details would be confirmed through the office number you already hold.</div></div><div class="evidence-row"><span>18 OCT · PDF</span><div><strong>The agreed account ends 1096.</strong>The completion statement records the same £47,850 balance.</div></div><div class="evidence-row"><span>TODAY · EMAIL</span><div><strong>The request now names account 4821.</strong>No independent confirmation of that change is recorded.</div></div>':'<div class="checks-alone"><strong>The sender and purchase details look familiar.</strong><br>The amount matches your completion statement. There is no obvious spelling mistake or unusual demand.<br><br>That still does not establish that the payment is authorised.</div>';
conclusion.textContent=personal?'The amount fits. The account has changed. Check the change independently.':'A convincing message is only part of the picture.';
wolfgangBridge.user(personal?'evidence-selected':'case-selected');
});
