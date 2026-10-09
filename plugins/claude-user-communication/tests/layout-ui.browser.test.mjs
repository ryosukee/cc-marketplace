import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { assemblePage } from '../skills/html-communication/scripts/lib/assemble.mjs';
let playwright;
try { playwright = await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || 'playwright'); }
catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
const skip = !playwright && 'Playwright 未導入。HTML_COMMUNICATION_PLAYWRIGHT_MODULE で導入先を指定する';

test('2paneの設問グループと回答操作は幅変更で入力を保ち、左右を独立して読める', {skip}, async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'html-layout-ui-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));fs.mkdirSync(path.join(dir,'src'));
  const sections=Array.from({length:14},(_,i)=>({kind:'question',heading:`工程 ${i+1} を進めるか`,group:i%2===0?'work':undefined,
    blocks:['工程の判断材料。 '.repeat(80)],question:{label:`工程 ${i+1}`,text:'作業を選ぶ。',options:[{label:'進める'},{label:'見直す'}]}}));
  const src={format:1,file:'test-f022',type:'form',project:'test',title:'設問と本文の配置',context:['配置と入力を確かめる。'],groups:[{id:'work',name:'作業'}],sections};
  const file=path.join(dir,'src',src.file+'.json');fs.writeFileSync(file,JSON.stringify(src));
  const assembled=assemblePage(file);assert.equal(assembled.ok,true,JSON.stringify(assembled.findings));
  const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(dir,src.file+'.html')))});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const browser=await playwright.chromium.launch();t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:1024,height:800}});page.setDefaultTimeout(5000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/${src.file}.html`);
  assert.equal(await page.locator('#question-list .qgrp').isVisible(),true,'1024pxでもグループが隠れない');
  await page.locator('.qd[data-for="q1"]').evaluate(el=>el.open=true);
  await page.locator('#q1 input[value="進める"]').check();
  assert.equal(await page.locator('#bar').evaluate(el=>el.parentNode.id),'q-pane');
  const barBefore=await page.locator('#bar').boundingBox();
  await page.locator('#question-list').evaluate(el=>el.scrollTop=el.scrollHeight);
  const barAfter=await page.locator('#bar').boundingBox();assert.equal(barAfter.y,barBefore.y,'設問だけのscrollで回答操作は動かない');
  const bodyTop=await page.locator('#bd').evaluate(el=>el.getBoundingClientRect().top);
  assert.ok(bodyTop>=0,'設問一覧のscrollで本文は動かない');
  await page.setViewportSize({width:390,height:800});
  assert.equal(await page.locator('#q1').evaluate(el=>Boolean(el.closest('.rng'))),true);
  assert.equal(await page.locator('#q1 input[value="進める"]').isChecked(),true);
  assert.equal(await page.locator('#bar').evaluate(el=>el.parentNode.id),'');
  await page.setViewportSize({width:1440,height:800});
  assert.equal(await page.locator('#q1').evaluate(el=>Boolean(el.closest('#question-list'))),true);
  assert.equal(await page.locator('#q1 input[value="進める"]').isChecked(),true);
  await page.locator('#answer-menu-toggle').click();
  assert.equal(await page.locator('#answer-menu').evaluate(el=>el.parentNode===document.body),true,'補助メニューは設問のscroll領域から独立する');
  const menu=await page.locator('#answer-menu').boundingBox();assert.ok(menu.x>=0&&menu.y>=0&&menu.x+menu.width<=1440);
  await page.locator('#free').fill('幅を変えても残す補足');
  await page.keyboard.press('Escape');
  await page.reload();
  await page.locator('#answer-menu-toggle').click();
  assert.equal(await page.locator('#free').inputValue(),'幅を変えても残す補足');
  assert.equal(await page.locator('#q1 input[value="進める"]').isChecked(),true);
  await page.keyboard.press('Escape');
  for (const width of [1440,390]) {
    await page.setViewportSize({width,height:800});
    await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.qd').evaluateAll(els=>els.every(el=>el.closest('.rng')&&el.getClientRects().length&&el.open)),true,'印刷は設問を本文の判断材料の直後に表示する');
    assert.equal(await page.locator('.qd input').evaluateAll(els=>els.every(el=>el.getClientRects().length)),true,'印刷は設問summaryだけでなく回答内容も表示する');
    assert.equal(await page.locator('#q1 input[value="進める"]').isChecked(),true);
    await page.emulateMedia({media:'screen'});
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    assert.equal(await page.locator('#q1').evaluate(el=>Boolean(el.closest('#question-list'))),width>=1024,'印刷後は通常の配置へ戻る');
    assert.equal(await page.locator('#q1 input[value="進める"]').isChecked(),true);
  }
  await page.setViewportSize({width:1440,height:800});
  await page.emulateMedia({media:'print'});
  await page.waitForFunction(()=>document.querySelector('#q1').closest('.rng'));
  assert.equal(await page.locator('.qd').evaluateAll(els=>els.every(el=>el.getClientRects().length)),true,'印刷mediaの切替だけでも本文へ戻る');
  await page.emulateMedia({media:'screen'});
  await page.waitForFunction(()=>document.querySelector('#q1').closest('#question-list'));
  assert.deepEqual(errors,[]);
});
