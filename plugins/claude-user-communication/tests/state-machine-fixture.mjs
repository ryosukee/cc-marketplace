import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
export const source = JSON.parse(fs.readFileSync(new URL('../docs/features/demo-r003.json', import.meta.url),'utf8'));
export function fixture(t, src=source) {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'html-state-machine-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 fs.mkdirSync(path.join(dir,'src'));const json=path.join(dir,'src',src.file+'.json');fs.writeFileSync(json,JSON.stringify(src));return {dir,json,out:path.join(dir,src.file+'.html')};
}
