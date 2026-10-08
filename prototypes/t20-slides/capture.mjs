import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.HTML_COMMUNICATION_PLAYWRIGHT_MODULE || '/Users/ryosuke/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs');
const out = process.env.T20_OUT || '/tmp/html-communication-research/slides-demos';
const results = [];
const browser = await chromium.launch();
try {
  for (const engine of ['native','marp','reveal']) {
    for (const width of [1440,390]) for (const colorScheme of ['light','dark']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, reducedMotion: 'no-preference' });
      const page = await context.newPage();
      page.setDefaultTimeout(5000);
      const errors = [], requests = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('request', (r) => { if (!r.url().startsWith('file:')) requests.push(r.url()); });
      await page.goto(pathToFileURL(path.join(out,engine + '.html')).href);
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(out,`${engine}-${width}-${colorScheme}-initial.png`) });
      const base = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth,
        h1: document.querySelector('.canvas h1').getBoundingClientRect().width,
        scale: document.querySelector('.canvas').getBoundingClientRect().width / 1280,
        font: getComputedStyle(document.querySelector('.canvas .lead')).fontSize,
        reflow: document.documentElement.classList.contains('reading-mode'),
        color: getComputedStyle(document.querySelector('.canvas')).backgroundColor }));
      assert.equal(base.scrollWidth <= width, true, `${engine} ${width}: document横overflow`);
      const slide2 = page.locator('section.canvas').nth(1);
      if (width > 700) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(900);
      } else if (engine === 'marp') {
        await page.locator('[data-bespoke-marp-osc="next"]').click();
        await page.waitForTimeout(900);
      } else {
        await slide2.scrollIntoViewIfNeeded();
      }
      if (engine === 'native' && width > 700) assert.equal(await slide2.evaluate((el) => el.classList.contains('active')), true);
      if (engine === 'marp') assert.equal(await slide2.evaluate((el) => el.closest('svg').classList.contains('bespoke-marp-active')), true);
      if (engine === 'reveal' && width > 700) assert.equal(await page.evaluate(() => Reveal.getIndices().h), 1);
      await page.screenshot({ path: path.join(out,`${engine}-${width}-${colorScheme}-slide2.png`) });
      if (width === 1440 && colorScheme === 'light') {
        if (engine === 'marp') {
          const summary = slide2.locator('summary');
          await summary.focus(); await page.keyboard.press('Enter');
          const opened = await slide2.locator('details').evaluate((el) => el.open);
          assert.equal(opened,true,'標準HTML detailsがMarp foreignObject内でEnter開閉できる');
          await page.screenshot({ path: path.join(out,'marp-inline-detail-open.png') });
          results.push({ engine, feature: 'details Enter', open: opened,
            geometry: await slide2.evaluate((el) => ({clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,noteBottom:el.querySelector('.note').getBoundingClientRect().bottom,footerTop:el.querySelector('.slide-footer').getBoundingClientRect().top})) });
          await page.keyboard.press('Enter');
          assert.equal(await slide2.locator('details').evaluate((el) => el.open),false);
          await page.keyboard.press('Space'); await page.waitForTimeout(900);
          const space = await page.evaluate(() => ({open:document.querySelector('details').open,
            slide:[...document.querySelectorAll('svg[data-marpit-svg]')].findIndex(el=>el.classList.contains('bespoke-marp-active')) + 1,
            focus:document.activeElement.tagName}));
          assert.deepEqual(space,{open:false,slide:3,focus:'BODY'});
          results.push({engine,feature:'pure summary Space conflict',observed:space});
        } else {
          const opener = slide2.locator('.detail-open');
          await opener.focus(); await page.keyboard.press('Enter');
          assert.equal(await page.locator('#detail-dialog').evaluate((el) => el.open),true);
          assert.equal(await page.locator('#detail-close').evaluate((el) => el === document.activeElement),true);
          await page.screenshot({path:path.join(out,`${engine}-detail-open.png`)});
          await page.keyboard.press('Escape');
          await page.waitForFunction(() => document.activeElement.matches('.detail-open'));
          assert.equal(await page.locator('#detail-dialog').evaluate((el) => el.open),false);
          results.push({engine,feature:'custom dialog keyboard',openAndFocusReturn:true});
        }
        if (engine === 'reveal') {
          await page.mouse.move(0,0); await page.locator('body').click({position:{x:5,y:500}});
          await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900);
          assert.equal(await page.evaluate(()=>Reveal.getIndices().h),2);
          await page.screenshot({path:path.join(out,'reveal-fragment-before.png')});
          assert.equal(await page.locator('.fragment').evaluate((el)=>el.classList.contains('visible')),false);
          await page.keyboard.press('ArrowRight');
          assert.equal(await page.locator('.fragment').evaluate((el)=>el.classList.contains('visible')),true);
          await page.waitForTimeout(900);
          const fragmentStyle = await page.locator('.fragment').evaluate((el) => {
            const style = getComputedStyle(el);
            const ancestors = [];
            for (let parent = el.parentElement; parent; parent = parent.parentElement) {
              const computed = getComputedStyle(parent);
              ancestors.push({ tag: parent.tagName, opacity: computed.opacity, filter: computed.filter });
            }
            return { opacity: style.opacity, color: style.color, filter: style.filter,
              expectedColor: getComputedStyle(el.closest('.canvas').querySelector('.eyebrow')).color, ancestors };
          });
          assert.equal(fragmentStyle.opacity,'1','fragment transition完了');
          assert.equal(fragmentStyle.color,fragmentStyle.expectedColor,'fragmentはテーマの強調色で表示');
          assert.equal(fragmentStyle.filter,'none');
          assert.equal(fragmentStyle.ancestors.every(el => el.opacity === '1' && el.filter === 'none'),true);
          await page.screenshot({path:path.join(out,'reveal-fragment-after.png')});
          await page.evaluate(()=>{window.autoAnimateEvents=[];Reveal.on('autoanimate',e=>window.autoAnimateEvents.push({from:e.fromSlide.dataset.slide,to:e.toSlide.dataset.slide}));});
          await page.screenshot({path:path.join(out,'reveal-autoanimate-before.png')});
          await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
          const motion = await page.evaluate(()=>({events:window.autoAnimateEvents,state:document.querySelector('section.present').dataset.autoAnimate,
            targets:document.querySelectorAll('[data-auto-animate-target]').length,
            codeTarget:document.querySelector('section.present [data-id="state-code"]').hasAttribute('data-auto-animate-target')}));
          assert.ok(motion.events.length > 0 && motion.codeTarget,'純正auto-animateがcode領域を実際に対象にする');
          await page.screenshot({path:path.join(out,'reveal-autoanimate-mid.png')});
          await page.waitForTimeout(1100);
          await page.screenshot({path:path.join(out,'reveal-autoanimate-after.png')});
          results.push({engine,feature:'pure fragment / auto-animate',fragment:true,fragmentStyle,motion});
        }
      }
      assert.deepEqual(errors,[]); assert.deepEqual(requests,[]);
      results.push({engine,width,colorScheme,...base,externalRequests:requests.length,errors});
      await context.close();
    }
    for (const javaScriptEnabled of [false,true]) {
      const context = await browser.newContext({viewport:{width:1440,height:900},javaScriptEnabled,offline:true});
      const page = await context.newPage(); const requests=[];
      page.on('request',r=>{if(!r.url().startsWith('file:'))requests.push(r.url());});
      await page.goto(pathToFileURL(path.join(out,engine + '.html')).href);
      if (!javaScriptEnabled) {
        for(let i=0;i<4;i++) assert.equal(await page.locator('section.canvas').nth(i).isVisible(),true,`${engine} JS-off slide ${i}`);
        assert.equal(await page.locator('.detail-print').isVisible(),true,`${engine} JS-off全文`);
        if(engine==='marp'){await page.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('details').evaluate(e=>e.open),true);}
      }
      await page.emulateMedia({media:'print'});
      for(let i=0;i<4;i++) assert.equal(await page.locator('section.canvas').nth(i).isVisible(),true,`${engine} print slide ${i}`);
      assert.equal(await page.locator('.detail-print').isVisible(),true,`${engine} print全文`);
      assert.deepEqual(requests,[]);
      if(javaScriptEnabled) await page.screenshot({path:path.join(out,`${engine}-print.png`),fullPage:true});
      results.push({engine,javaScriptEnabled,offline:true,printAllFour:true,detailFullText:true,externalRequests:requests.length});
      await context.close();
    }
  }
} finally { await browser.close(); }
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(results,null,2)+'\n');
fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'verification.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({checks:results.length,out,success:true}));
