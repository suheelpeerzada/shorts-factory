// node render.mjs <outdir> "<frames>"   frames: "0-1222" or "5,40,100"; RESUME=1 skips existing files
import { chromium } from "playwright";
import http from "http"; import fs from "fs"; import path from "path";
const [outDir, spec] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const frames = [];
for (const part of spec.split(",")) { const [a, b] = part.split("-").map(Number); for (let f = a; f <= (isNaN(b) ? a : b); f++) frames.push(f); }
const root = path.resolve("web");
const srv = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split("?")[0]));
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": f.endsWith(".js") ? "text/javascript" : "text/html" }); fs.createReadStream(f).pipe(r);
}).listen(0);
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on("pageerror", (e) => { console.log("[err]", e.message); });
p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[page]", m.text().slice(0, 300)); });
await p.goto(`http://localhost:${srv.address().port}/index.html`);
await p.waitForFunction("window.ready === true", null, { timeout: 120000 });
const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const file = path.join(outDir, `f${String(f).padStart(4, "0")}.jpg`);
  if (process.env.RESUME && fs.existsSync(file)) continue;
  const data = await p.evaluate((f) => { window.renderFrame(f); return document.getElementById("c").toDataURL("image/jpeg", 0.95); }, f);
  fs.writeFileSync(file + ".tmp", Buffer.from(data.split(",")[1], "base64")); fs.renameSync(file + ".tmp", file);
  n++; if (n % 10 === 0 || n === frames.length) console.log(`frame ${f} done ${n}/${frames.length} ${((Date.now() - t0) / n / 1000).toFixed(2)}s/f`);
}
await b.close(); srv.close();
