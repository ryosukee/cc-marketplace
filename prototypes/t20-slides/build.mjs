import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const deps = process.env.T20_DEPS || '/tmp/html-communication-research/slides-deps/node_modules';
const out = process.env.T20_OUT || '/tmp/html-communication-research/slides-demos';
for (const [name,version] of [['@marp-team/marp-cli','4.5.1'],['reveal.js','6.0.2']]) {
  const installed = JSON.parse(fs.readFileSync(path.join(deps,name,'package.json'),'utf8')).version;
  if (installed !== version) throw new Error(`${name}: expected ${version}, got ${installed}`);
}
fs.mkdirSync(out, { recursive: true });
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const escape = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const content = JSON.parse(read('content.json'));
const lines = (text) => escape(text).replaceAll('\n','<br>');
const detail = content.slides[1].detail;
const detailText = detail.paragraphs.map((p) => `<p>${escape(p)}</p>`).join('') + `<pre>${escape(detail.code)}</pre>`;
const footer = (i) => `<div class="slide-footer"><span>説明を短く、根拠は詳しく</span><span>0${i + 1} / 04</span></div>`;
function slideBody(slide, i, engine) {
  const title = `<p class="eyebrow">${escape(slide.eyebrow)}</p><${i === 0 ? 'h1' : 'h2'}>${lines(slide.title)}</${i === 0 ? 'h1' : 'h2'}>`;
  const lead = `<p class="lead">${escape(slide.lead)}</p>`;
  let body;
  if (i === 0) body = title + lead + `<div class="points">${slide.points.map(([n,t,p]) => `<div class="point"><span>${n}</span><b>${escape(t)}</b><p>${escape(p)}</p></div>`).join('')}</div>`;
  if (i === 1) {
    const sample = engine === 'marp' ? `<details class="inline-detail"><summary>${escape(detail.title)}</summary>${detailText}</details><p class="note">HTMLの details による本文内開閉。標準Marpの独立overlayではない。</p>` : `<button type="button" class="detail-open">${escape(detail.title)}</button><p class="note">比較用に追加した dialog。スライドエンジンの標準機能ではない。</p>`;
    body = title + `<div class="two-columns"><div>${lead}${sample}</div><div class="flow"><div><b>概要</b><p>判断するための短い説明</p></div><div><b>詳細</b><p>必要な根拠と実装の内訳</p></div><div><b>出典</b><p>全文とリンクを確かめる</p></div></div></div>`;
  }
  if (i === 2) body = title + lead + `<table class="comparison"><tbody>${slide.rows.map(([a,b,c]) => `<tr><th scope="row">${escape(a)}</th><td>${escape(b)}</td><td>${escape(c)}</td></tr>`).join('')}</tbody></table><p class="fragment-note${engine === 'reveal' ? ' fragment' : ''}">${escape(slide.fragment)}</p><pre class="small-code" data-id="state-code"><code>${escape(slide.code)}</code></pre>`;
  if (i === 3) body = title + lead + `<pre class="code-large" data-id="state-code"><code>${escape(slide.code)}</code></pre><p class="note">${escape(slide.note)}</p>`;
  return body + footer(i);
}
const theme = read('theme.css');
const wrapper = read('wrapper.css');
const chrome = (engine, note) => `<div class="prototype-chrome"><span class="engine-note">${engine} · ${note}</span><a href="./ccm-f115.html">比較フォームへ戻る</a></div>`;
const dialog = `<dialog id="detail-dialog" aria-labelledby="detail-title"><h2 id="detail-title">詳細と根拠</h2>${detailText}<button type="button" id="detail-close">閉じる</button></dialog><section class="detail-print"><h2>詳細と根拠（全文）</h2>${detailText}</section>`;
const scriptsafe = (text) => text.replace(/<\/script/gi, '<\\/script');
const license = (name) => {
  const p = path.join(deps, name, 'LICENSE');
  return fs.existsSync(p) ? fs.readFileSync(p,'utf8').replaceAll('-->','-- >') : `${name}: MIT license (see installed package)`;
};
const licensePackages = ['@marp-team/marp-cli','@marp-team/marp-core','@marp-team/marpit','reveal.js'];
fs.writeFileSync(path.join(root,'LICENSE'), licensePackages.map(name => `${name}\n${license(name)}`).join('\n\n') +
  '\n\nMarp CLI Bespoke bundle licenses\n' + fs.readFileSync(path.join(deps,'@marp-team/marp-cli/lib/bespoke.js.LICENSE.txt'),'utf8'));
const head = (engine, extra = '') => `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="generator" content="CCM-T20 discarded prototype: ${engine}"><title>${escape(content.title)} / ${engine}</title>${extra}<style>${theme}\n${wrapper}</style></head><body>`;
const end = '</body></html>';
const native = head('native HTML/CSS/JS') + chrome('Native HTML', '前後移動・dialog は比較用の追加コード') + '<p class="reading-hint">390pxでは縮小せず縦に読む。これは試作の追加CSS。</p><main class="native-deck">' + content.slides.map((s,i) => `<section class="canvas" data-slide="${i}">${slideBody(s,i,'native')}</section>`).join('') + '</main><nav class="native-controls" aria-label="スライド"><button id="native-prev">← 前へ</button><span id="native-page" role="status"></span><button id="native-next">次へ →</button></nav>' + dialog + `<script>${scriptsafe(read('native.js'))}</script><script>${scriptsafe(read('detail.js'))}</script>` + end;
fs.writeFileSync(path.join(out,'native.html'),native);
const revealRoot = path.join(deps,'reveal.js');
const revealCSS = fs.readFileSync(path.join(revealRoot,'dist/reveal.css'),'utf8');
const revealJS = fs.readFileSync(path.join(revealRoot,'dist/reveal.js'),'utf8');
const reveal = head('Reveal.js 6.0.2', `<style>${revealCSS}</style>`) + `<!-- reveal.js 6.0.2 LICENSE\n${license('reveal.js')}\n-->` + chrome('Reveal.js 6.0.2','前後移動・fragment・auto-animate は純正 / dialog は追加') + '<p class="reading-hint">390pxではエンジンを起動せず縦に読む。これは試作の追加CSS。</p><div class="reveal"><div class="slides">' + content.slides.map((s,i) => `<section class="canvas" data-slide="${i}"${i === 2 || i === 3 ? ' data-auto-animate' : ''}>${slideBody(s,i,'reveal')}</section>`).join('') + '</div></div>' + dialog + `<script>${scriptsafe(revealJS)}</script><script>${scriptsafe(read('reveal-init.js'))}</script><script>${scriptsafe(read('detail.js'))}</script>` + end;
fs.writeFileSync(path.join(out,'reveal.html'),reveal);
const markdown = '---\nmarp: true\ntheme: t20\nsize: 16:9\ntitle: ' + content.title + '\nlang: ja\n---\n\n' + content.slides.map((s,i) => '<!-- _class: canvas -->\n\n' + slideBody(s,i,'marp')).join('\n\n---\n\n') + '\n';
fs.writeFileSync(path.join(root,'slides.md'),markdown);
const cli = path.join(deps,'@marp-team/marp-cli/marp-cli.js');
for (const template of ['bespoke','bare']) {
  const rawPath = path.join(out,`marp-${template}.raw.html`);
  const result = spawnSync(process.execPath,[cli,path.join(root,'slides.md'),'--html','--theme',path.join(root,'theme.css'),'--template',template,'--output',rawPath],{encoding:'utf8'});
  if (result.status !== 0) throw new Error(result.stdout + result.stderr);
  let html = fs.readFileSync(rawPath,'utf8');
  html = html.replace('</head>', `<meta name="color-scheme" content="light dark"><meta name="generator" content="CCM-T20 discarded prototype: Marp CLI 4.5.1 / ${template}"><style>${theme}\n${wrapper}</style>${template === 'bespoke' ? '<script>document.documentElement.classList.add("js-enabled");</script>' : ''}</head>`);
  html = html.replace('<body>', '<body>' + chrome('Marp CLI 4.5.1', `${template} の純正表示 / theme・比較chrome・全文fallback は追加`) + `<!-- Marp CLI LICENSE\n${license('@marp-team/marp-cli')}\nMarp Core LICENSE\n${license('@marp-team/marp-core')}\nMarpit LICENSE\n${license('@marp-team/marpit')}\nBespoke bundle licenses\n${fs.readFileSync(path.join(deps,'@marp-team/marp-cli/lib/bespoke.js.LICENSE.txt'),'utf8').replaceAll('-->','-- >')}\n-->`);
  // detailsを閉じたまま印刷しても全文が残る。これは純正Marpではなく生成wrapperの追加。
  html = html.replace('</body>', `<section class="detail-print"><h2>詳細と根拠（全文）</h2>${detailText}</section></body>`);
  fs.writeFileSync(path.join(out,template === 'bespoke' ? 'marp.html' : 'marp-reading.html'),html);
}
if (process.argv.includes('--publish-reserved')) {
  const dest = '/Users/ryosuke/.local/share/claude-html-communication';
  const artifacts = [];
  for (const [from,to] of [['native.html','ccm-r017.html'],['marp.html','ccm-r018.html'],['reveal.html','ccm-r019.html']]) {
    const file = path.join(dest,to);
    if (!fs.existsSync(file)) throw new Error(`reserved file missing: ${file}`);
    if (fs.statSync(file).mode & 0o200) fs.writeFileSync(file,fs.readFileSync(path.join(out,from)));
    else { fs.chmodSync(file,0o644); fs.writeFileSync(file,fs.readFileSync(path.join(out,from))); }
    fs.chmodSync(file,0o444);
    const bytes = fs.readFileSync(file);
    artifacts.push({ path:file, bytes:bytes.length, sha256:createHash('sha256').update(bytes).digest('hex') });
  }
  fs.writeFileSync(path.join(root,'published-artifacts.json'),JSON.stringify(artifacts,null,2)+'\n');
}
console.log(JSON.stringify({out,files:['native.html','marp.html','reveal.html','marp-reading.html'],versions:{marp:'4.5.1',reveal:'6.0.2'}}));
