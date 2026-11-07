#!/bin/bash
# usage: qa.sh <video>
V=$1; cd $(dirname "$0")
sed "s#VIDEO#$PROJ#g" qa_entry.js > e_$V.js
ln -sf $(dirname "$0")/node_modules $PROJ/node_modules 2>/dev/null
npx -y esbuild@0.24.0 e_$V.js --bundle --outfile=b_$V.js --jsx=automatic --loader:.js=jsx --alias:remotion=./stubs.js --alias:@remotion/three=./stubs.js --alias:@react-three/fiber=./stubs.js --alias:postprocessing=./stubs.js --alias:react=./react --log-level=error || exit 1
node -e "
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.setContent('<html><body></body></html>'); await p.addScriptTag({path:'b_$V.js'});
const q=await p.evaluate(()=>window.QA); console.log(q.log.join('\n')); if(q.errs.length) console.log('ERRORS:\n'+q.errs.join('\n')); await b.close();})()"
rm -f $PROJ/node_modules
