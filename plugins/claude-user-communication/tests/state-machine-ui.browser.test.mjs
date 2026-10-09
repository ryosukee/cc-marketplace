import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { fixture, source } from './state-machine-fixture.mjs';
import { assemblePage } from '../skills/html-communication/scripts/lib/assemble.mjs';
let playwright;
try { playwright=await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || 'playwright'); }
catch(error) { if(error.code!=='ERR_MODULE_NOT_FOUND')throw error; }
const skip=!playwright&&'Playwright 未導入';
async function setup(t,src=source,options={}) {
 const f=fixture(t,src);assert.equal(assemblePage(f.json).ok,true);const browser=await playwright.chromium.launch();t.after(()=>browser.close());
 const context=await browser.newContext(options),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(f.out).href);return {browser,context,page,errors,out:f.out};
}
const button=(page,id)=>page.locator(`[data-transition="${id}"]`);
const state=async(page,id)=>assert.equal(await page.locator('[data-state-machine]').getAttribute('data-current-state'),id);
test('branches, retries, start selection, reset, terminal states, and continuous messages', {skip},async t=>{
 const {page,errors}=await setup(t,source,{viewport:{width:1440,height:1000}});await state(page,'reserved');
 assert.equal(await button(page,'failed-send-rejected').getAttribute('aria-disabled'),'true');
 await button(page,'reserved-send-rejected').focus();await page.keyboard.press('Enter');await state(page,'failed');
 await button(page,'failed-send-rejected').focus();await page.keyboard.press('Space');await state(page,'failed');
 assert.equal(await page.locator('[data-kind="action"]').count(),2);assert.equal(await page.locator('[data-message]').count(),4);
 assert.deepEqual(await page.locator('[data-message] .rsv-message-description').allTextContents(),['予約管理から通知サービスへ：通知送信要求','通知サービスから予約管理へ：拒否応答','予約管理から通知サービスへ：通知送信要求','通知サービスから予約管理へ：拒否応答']);
 assert.equal(await page.locator('[data-message] .rsv-message-text[aria-hidden="true"]').count(),4);
 await button(page,'failed-send-accepted').click();await state(page,'notified');
 assert.match(await page.locator('[data-sequence-count]').textContent(),/実行 3 回 · 通信 6 件/);
 assert.equal(await page.locator('[data-transition][aria-disabled="false"]').count(),0);
 assert.equal(await page.locator('[data-start-label]').textContent(),'予約済み');
 await page.locator('[data-node-state="failed"]').click();await state(page,'failed');
 assert.equal(await page.locator('[data-state-machine]').getAttribute('data-initial-state'),'reserved');
 assert.equal(await page.locator('[data-start-label]').textContent(),'通知失敗');assert.equal(await page.locator('[data-kind="action"]').count(),0);
 await button(page,'failed-cancel-local').click();await state(page,'cancelled');assert.equal(await page.locator('[data-message]').count(),0);
 await page.locator('[data-reset-initial]').click();await state(page,'reserved');assert.equal(await page.locator('[data-kind="action"]').count(),0);
 await button(page,'reserved-cancel-local').click();await state(page,'cancelled');assert.match(await page.locator('[data-kind="action"]').textContent(),/対外通信なし/);
 assert.deepEqual(errors,[]);
});
test('layout, themes and narrow widths retain approved geometry without page overflow', {skip},async t=>{
 const {page,errors}=await setup(t);
 for(const width of [320,390,1280,2100])for(const colorScheme of ['light','dark']){
  await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme});
  for(const layout of ['horizontal','vertical']){
   await page.locator(`[data-layout-option="${layout}"]`).click();assert.equal(await page.locator('[data-state-machine]').getAttribute('data-layout'),layout);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   const map=await page.locator('.rsv-map').boundingBox();assert.equal(map.width,640);assert.equal(map.height,660);
  }
 }
 assert.deepEqual(errors,[]);
});
test('no JS and printing expose full graph and static communication; reduced motion disables flashes', {skip},async t=>{
 const {page,browser,out}=await setup(t,source,{reducedMotion:'reduce'});
 await button(page,'reserved-send-rejected').click();assert.equal(await page.locator('.rsv-flash').count(),0);
 await page.emulateMedia({media:'print'});assert.equal(await page.locator('.rsv-toolbar').isVisible(),false);assert.equal(await page.locator('.rsv-static').isVisible(),true);
 assert.equal(await page.locator('[data-kind="action"]').count(),1);
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});const plain=await context.newPage();await plain.goto(pathToFileURL(out).href);
 assert.equal(await plain.locator('.rsv-toolbar').isVisible(),false);assert.equal(await plain.locator('.rsv-static').isVisible(),true);assert.equal(await plain.locator('[data-node-state]').count(),4);
 assert.match(await plain.locator('.rsv-static').textContent(),/受理応答/);assert.equal(await plain.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
});
test('form answer serialization excludes diagram history and isolated machines do not interfere', {skip},async t=>{
 const src=structuredClone(source);src.type='form';delete src.summary;
 src.sections[0].kind='question';src.sections[0].question={label:'採用',text:'この構成を採用するか。',options:[{label:'採用する'},{label:'見直す'}]};
 const other=structuredClone(src.sections[0].blocks[0]);other.stateMachine.id='another';src.sections[0].blocks.push(other);
 const {page,errors}=await setup(t,src,{viewport:{width:1440,height:1000}});const first=page.locator('[data-state-machine]').first(),second=page.locator('[data-state-machine]').nth(1);
 await first.locator('[data-transition="reserved-send-rejected"]').click();assert.equal(await second.getAttribute('data-current-state'),'reserved');
 await page.locator('input[type="radio"]').first().check();
 assert.match(await page.locator('#preview').inputValue(),/採用する/);assert.doesNotMatch(await page.locator('#preview').inputValue(),/通知失敗|通信|send|reservation/);
 assert.deepEqual(errors,[]);
});
test('non-reservation machine supports three participants, ordinary transitions and local messages', {skip},async t=>{
 const src=structuredClone(source),m=src.sections[0].blocks[0].stateMachine;
 m.id='workflow';m.initial='waiting';m.title='作業';m.nodes=[{id:'waiting',label:'待機',description:'開始を待つ',x:20,y:20,width:184,height:86},{id:'running',label:'稼働',description:'処理する',x:20,y:250,width:184,height:86}];
 m.participants=[{id:'client',label:'クライアント'},{id:'server',label:'サーバー'},{id:'store',label:'保存先'}];
 m.transitions=[{id:'start',from:'waiting',to:'running',event:'開始',result:'開始する',x:20,y:150,width:140,height:38,messages:[{from:'client',to:'server',label:'要求'},{from:'server',to:'store',label:'保存'},{from:'store',to:'store',label:'記録'}]},{id:'stop',from:'running',to:'waiting',event:'停止',result:'停止する',x:220,y:150,width:140,height:38,messages:[],local:'内部処理'}];m.paths=[{d:'M110 106V250',transitions:['start'],arrow:true}];m.decorations=[];
 const {page,errors}=await setup(t,src);await button(page,'start').click();await state(page,'running');assert.equal(await page.locator('.rsv-actors span').count(),3);assert.equal(await page.locator('[data-message]').count(),3);assert.deepEqual(await page.locator('.rsv-message-description').allTextContents(),['クライアントからサーバーへ：要求','サーバーから保存先へ：保存','保存先から保存先へ：記録']);
 await button(page,'stop').click();await state(page,'waiting');assert.match(await page.locator('[data-sequence-count]').textContent(),/実行 2 回 · 通信 3 件/);assert.deepEqual(errors,[]);
});
