import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,mkdir,readFile,readdir,symlink,writeFile,access,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {approvedSource,selectEntries,collectSnapshot,preparePublicFiles,scanPublicFiles,writePublicExport} from '../scripts/prepare-submission.mjs';

const files=(name,contents)=>new Map([[name,Buffer.from(contents)]]);
const project=path.resolve(import.meta.dirname,'..');
test('public scope excludes account implementations, runtime data, metadata and historical scratch tools',()=>{
 for(const name of ['worker/identity-verification.js','worker/reputation-readiness.js'])assert.equal(approvedSource(name),true,name);
 for(const name of ['worker/server.js','worker/transport-test.js','worker/xchat-transport.js','worker/people-auth.js','worker/merge-logins.js','worker/official-guidance.js','worker/message-first-look.js','worker/url-signals.js','worker/wolfgang-guide.js','worker/wolfgang-style.js','worker/admin-service.js','worker/mailbox-connection.js','scripts/prepare-submission.mjs','scripts/pack-thigh-contact-colliders.mjs','scripts/evaluate-context.mjs','evaluation/context-cases.js','evaluation/message-cases.js','scripts/evaluate-message-first.mjs','evaluation/runner.js','worker/url-reputation.js','worker/watch-service.js','worker/watch-evidence.js','worker/watch-mail.js','web/assets/evidence-english.gz','web/assets/evidence-ocr.wasm.gz','web/assets/evidence-notices.txt','docs/licenses/evidence-apache.LICENSE','tests/fixtures/evidence/invoice.docx','web/data-deletion.html','web/assets/wolfgang.glb','tests/submission.test.js','tests/fixtures/pdf/locked.pdf','model/reconstruction/thigh-contact-colliders.json','drizzle/meta/_journal.json'])assert.equal(approvedSource(name),true,name);
 for(const name of ['worker/index.js','worker/private-account-service.js','worker/.env','worker/.env.local','web/assets/.dev.vars','web/assets/customer-data.json','tests/customer.sqlite','tests/fixtures/pdf/statement.pdf','tests/fixtures/evidence/private.docx','web/assets/arbitrary.gz','model/reconstruction/__pycache__/review.pyc','.openai/hosting.json','model/reconstruction/export-right-fold-candidate.mjs','../worker/server.js','web/assets/../../private.js','web\\assets\\private.js'])assert.equal(approvedSource(name),false,name);
});

test('production directory rows, curation sources and staff-only tests cannot be copied into a public snapshot',()=>{
 for(const name of ['web/assets/uk-council-sources.js','web/assets/uk-supplier-sources.js','web/assets/uk-everyday-sources.js','web/assets/uk-health-sources.js','web/assets/uk-original-publishers.js','web/assets/organisation-directory.js','web/assets/uk-future-roster.js','worker/admin-uk-directory.js','web/uk-directory.html','scripts/refresh-uk-health.py','scripts/refresh-uk-councils.py','scripts/review-uk-everyday-feed.mjs','scripts/review-uk-supplier-feeds.mjs','tests/admin-uk-directory.test.js','tests/uk-council-directory.test.js','tests/uk-public-research.test.js'])assert.equal(approvedSource(name),false,name);
 assert.throws(()=>scanPublicFiles(files('web/assets/uk-council-sources.js','private directory fixture')),/private directory module/);
});

test('Git symlinks and submodule entries cannot enter the approved source tree',()=>{
 const object='a'.repeat(40),entry=(mode,type,name)=>Buffer.from(`${mode} ${type} ${object}\t${name}\0`);
 assert.throws(()=>selectEntries(entry('120000','blob','web/assets/wolfgang.glb')),/Unsafe source entry/);
 assert.throws(()=>selectEntries(entry('160000','commit','worker/server.js')),/Unsafe source entry/);
 assert.equal(selectEntries(entry('100644','blob','worker/server.js')).length,1);
});

test('credential scanning covers raw binary bytes and reports no credential values',()=>{
 const secret='re_'+'A'.repeat(30),privateMarker='CREATE TABLE '+'admin_users';
 for(const payload of [secret,Buffer.concat([Buffer.from([0]),Buffer.from(secret)]),privateMarker,'const GUARDIAN_IDENTITY_SECRET = "'+'0123456789abcdef'.repeat(4)+'";']){
  assert.throws(()=>scanPublicFiles(files('worker/server.js',payload)),error=>{assert.match(error.message,/needs review/);assert.ok(!error.message.includes(secret));return true;});
 }
});

test('only exact reviewed test fixtures bypass scanning and credential-like test additions still fail',()=>{
 const url='https://user:'+'pass@api.fireworks.ai/v1';
 assert.doesNotThrow(()=>scanPublicFiles(files('tests/model-provider.test.js',url)));
 assert.throws(()=>scanPublicFiles(files('tests/model-provider.test.js',url+' '+url)),/credential URL/);
 assert.throws(()=>scanPublicFiles(files('tests/other.test.js',url)),/credential URL/);
 const assignment='WOLFGANG_API_KEY:'+'\'server-only-test-key\'';
 assert.doesNotThrow(()=>scanPublicFiles(files('tests/wolfgang-conversation.test.js',assignment)));
 assert.throws(()=>scanPublicFiles(files('worker/server.js',assignment)),/credential literal/);
});

test('a changed PDF cannot enter the public package using a reviewed fixture name',()=>{
 assert.throws(()=>scanPublicFiles(files('tests/fixtures/pdf/sample.pdf','%PDF-unreviewed')),/unreviewed PDF fixture/);
 assert.throws(()=>scanPublicFiles(files('web/assets/evidence-english.gz','unreviewed')),/unreviewed evidence binary/);
});

test('token-count bounds are configuration while nonempty credential placeholders are refused',()=>{
 assert.doesNotThrow(()=>scanPublicFiles(files('.env.example','GUARDIAN_MAX_OUTPUT_TOKENS=1800\nGUARDIAN_IDENTITY_SECRET=\n')));
 assert.throws(()=>scanPublicFiles(files('.env.example','GUARDIAN_IDENTITY_SECRET=unexpected\n')),/non-empty sensitive placeholder/);
});

test('unsafe exports are rejected before an output directory is written',async t=>{
 const temporary=await mkdtemp(path.join(os.tmpdir(),'guardian-export-test-'));t.after(()=>rm(temporary,{recursive:true,force:true}));
 const source=path.join(temporary,'source'),dest=path.join(temporary,'public');await mkdir(source);
 await assert.rejects(writePublicExport(dest,files('worker/server.js','re_'+'A'.repeat(30)),{sourceRoot:source}),/needs review/);
 await assert.rejects(access(dest));
 await assert.rejects(writePublicExport(dest,files('../escape.js','safe'),{sourceRoot:source}),/Unsafe output filename/);
 await assert.rejects(access(dest));
 const alias=path.join(temporary,'alias');await symlink(source,alias,'dir');
 await assert.rejects(writePublicExport(path.join(alias,'nested'),files('safe.js','safe'),{sourceRoot:source}),/outside the repository/);
 await assert.rejects(writePublicExport(alias,files('safe.js','safe'),{sourceRoot:source}),/regular output directory/);
});

test('public export writes only provided approved content and refuses an occupied destination',async t=>{
 const temporary=await mkdtemp(path.join(os.tmpdir(),'guardian-export-test-'));t.after(()=>rm(temporary,{recursive:true,force:true}));
 const source=path.join(temporary,'source'),dest=path.join(temporary,'public');await mkdir(source);
 await writeFile(path.join(source,'untracked-file'),'must not copy');
 await writePublicExport(dest,files('worker/server.js','export default {};'),{sourceRoot:source});
 assert.deepEqual(await readdir(dest),['worker']);assert.equal(await readFile(path.join(dest,'worker/server.js'),'utf8'),'export default {};');
 await assert.rejects(writePublicExport(dest,files('worker/server.js','changed'),{sourceRoot:source}),/must be empty/);
});

test('snapshot bytes come from HEAD and the public package has standalone build scripts', {skip:!existsSync(path.join(project,'.git'))},()=>{
 const snapshot=collectSnapshot(project),expected=execFileSync('git',['show',snapshot.commit+':worker/server.js'],{cwd:project});
 assert.deepEqual(snapshot.files.get('worker/server.js'),expected);
 assert.equal(snapshot.files.has('worker/index.js'),false);assert.equal(snapshot.files.has('.openai/hosting.json'),false);
 const output=preparePublicFiles(snapshot),pkg=JSON.parse(output.get('package.json'));
 assert.equal(output.has('scripts/refresh-uk-councils.py'),false);
 assert.match(output.get('web/assets/uk-supplier-sources.js').toString(),/Northline Water/);
 assert.doesNotMatch(output.get('web/assets/uk-health-sources.js').toString(),/nhs\.uk|NHS Foundation Trust/);
 assert.match(output.get('README.md').toString(),/production UK directory.*omitted/);
 assert.equal(pkg.scripts.build,'node scripts/build-model.mjs && node scripts/embed-ui.mjs');
 for(const [name,source] of output){
  if(!name.startsWith('worker/')||!name.endsWith('.js'))continue;
  for(const match of source.toString().matchAll(/(?:from\s*|import\s*\(\s*)['"](\.\.?\/[^'"]+\.js)['"]/g)){
   const target=path.posix.join(path.posix.dirname(name),match[1]);
   assert.ok(output.has(target),name+' needs '+target+' in the standalone export');
  }
 }
 assert.equal(output.has('scripts/prepare-submission.mjs'),true);assert.equal(output.has('scripts/pack-thigh-contact-colliders.mjs'),true);
 assert.match(output.get('README.md').toString(),new RegExp(snapshot.commit));
});
