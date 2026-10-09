import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { assemblePage } from '../skills/html-communication/scripts/lib/assemble.mjs';
import { loadSource } from '../skills/html-communication/scripts/lib/page-source.mjs';
import { fixture, source } from './state-machine-fixture.mjs';
test('declarative demo assembles without per-page scripts, with accessible static fallback',t=>{
 const {json,out}=fixture(t);const r=assemblePage(json);assert.equal(r.ok,true,JSON.stringify(r.findings));const html=fs.readFileSync(out,'utf8');
 assert.match(html,/data-scope="state-machine"/);assert.match(html,/状態遷移と通信の一覧/);assert.match(html,/予約済み → 通知失敗/);assert.match(html,/初期状態 \(= 予約済み\) に戻す/);
 assert.match(html,/data-transitions="failed-send-rejected"/);assert.match(html,/data-node-state="reserved" data-current="true"/);
 const plain=structuredClone(source);plain.sections[0].blocks=['説明だけ。'];const other=fixture(t,plain);assert.equal(assemblePage(other.json).ok,true);assert.doesNotMatch(fs.readFileSync(other.out,'utf8'),/data-scope="state-machine"/);
});
test('validation rejects dangling states, actors, paths, duplicate ids and unsafe geometry',t=>{
 for(const change of [m=>m.initial='missing',m=>m.transitions[0].to='missing',m=>m.transitions[0].messages[0].from='missing',m=>m.paths[0].transitions=['missing'],m=>m.nodes[1].id=m.nodes[0].id,m=>m.paths[0].d='M0 0" onclick="x',m=>m.nodes[0].width=5000,m=>m.transitions[0].script='alert(1)']){
  const src=structuredClone(source);change(src.sections[0].blocks[0].stateMachine);const {json}=fixture(t,src);assert.ok(loadSource(json).findings.length);
 }
});
test('multiple diagrams use unique SVG identifiers and escape all source text',t=>{
 const src=structuredClone(source),m=src.sections[0].blocks[0].stateMachine;m.title='</script><script>alert(1)</script>';m.nodes[0].label='<img src=x onerror=alert(1)>';
 const second=structuredClone(m);second.id='other';src.sections[0].blocks.push({stateMachine:second});const {json,out}=fixture(t,src);assert.equal(assemblePage(json).ok,true);const html=fs.readFileSync(out,'utf8');
 assert.match(html,/id="state-machine-other-arrow"/);assert.doesNotMatch(html,/<script>alert\(1\)/);assert.doesNotMatch(html,/<img src=x/);
 src.sections[0].blocks[1].stateMachine.id=m.id;const bad=fixture(t,src);assert.ok(loadSource(bad.json).findings.some(f=>f.message.includes('重複')));
});

test('malformed JSON and invalid embedded source are reported by source and HTML checks',t=>{
 const {json,out}=fixture(t);assert.equal(assemblePage(json).ok,true);
 const checker=new URL('../skills/html-communication/scripts/check-page.mjs',import.meta.url).pathname;
 const good=spawnSync(process.execPath,[checker,out],{encoding:'utf8'});assert.equal(good.status,0,good.stdout);
 fs.chmodSync(out,0o644);fs.writeFileSync(out,fs.readFileSync(out,'utf8').replace(/(<script type="application\/json" data-state-machine-source>)[\s\S]*?(<\/script>)/,'$1{invalid$2'));
 const bad=spawnSync(process.execPath,[checker,out],{encoding:'utf8'});assert.equal(bad.status,1);assert.ok(JSON.parse(bad.stdout).results[0].findings.some(f=>f.check==='state-machine-source'));
 fs.writeFileSync(json,'{invalid');assert.ok(loadSource(json).findings.some(f=>f.message.includes('JSON')));
});

test('generated root, marker and description ids cannot collide across diagrams',t=>{
 for(const suffix of ['arrow','desc'])for(const reversed of [false,true]){
  const src=structuredClone(source),first=src.sections[0].blocks[0].stateMachine;first.id='sample';
  const second=structuredClone(first);second.id='sample-'+suffix;
  src.sections[0].blocks=[{stateMachine:first},{stateMachine:second}];if(reversed)src.sections[0].blocks.reverse();
  const {json}=fixture(t,src);assert.ok(loadSource(json).findings.some(f=>f.message.includes('重複')));assert.equal(assemblePage(json).ok,false);
 }
});
