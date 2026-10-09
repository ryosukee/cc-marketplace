// Assemble this trial with an isolated copy of the installed runtime.
// Usage: node build.mjs /absolute/src/page.json [--force]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pathToFileURL} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const original = '/Users/ryosuke/.codex/plugins/cache/cc-tools/claude-user-communication/0.60.0';
const scratch = '/tmp/html-communication-research/t23-v13-layout-runtime';
fs.cpSync(original, scratch, {recursive:true});
const template = path.join(scratch,'skills/html-communication/templates/page.html');
let html = fs.readFileSync(template,'utf8');
const a = html.indexOf('  var pane = document.getElementById(\'fn-pane\');');
const b = html.indexOf('  var branches = ',a);
if(a<0 || b<0) throw Error('footnote handler boundary missing');
html = html.slice(0,a) + html.slice(b);
html = html.replace("var mq3 = window.matchMedia('(min-width: 1340px)');", "var mq3 = window.matchMedia('(min-width: 1024px)');");
html = html.replace("var pane = document.getElementById('q-pane');", "var pane = document.getElementById('question-list') || document.getElementById('q-pane');");
html = html.replace('</style>',fs.readFileSync(path.join(here,'layout.css'),'utf8')+'\n</style>');
html = html.replace('</body>', '<script data-scope="layout-trial">\n'+fs.readFileSync(path.join(here,'layout.js'),'utf8')+'\n</script>\n</body>');
fs.writeFileSync(template,html);
const {assemblePage} = await import(pathToFileURL(path.join(scratch,'skills/html-communication/scripts/lib/assemble.mjs')));
const r=assemblePage(process.argv[2],{force:process.argv.includes('--force')});
console.log(JSON.stringify(r));if(!r.ok)process.exit(1);
