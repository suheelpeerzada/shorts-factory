// Screenshot a test page's #c canvas: node shot.mjs page.html out.png
import { chromium } from "playwright";
import http from "http"; import fs from "fs"; import path from "path";
const root = path.resolve("web");
const srv = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split("?")[0]));
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": f.endsWith(".js") || f.endsWith(".mjs") ? "text/javascript" : f.endsWith(".html") ? "text/html" : "application/octet-stream" });
  fs.createReadStream(f).pipe(r);
}).listen(0);
const port = srv.address().port;
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage();
p.on("console", (m) => console.log("[page]", m.text())); p.on("pageerror", (e) => console.log("[err]", e.message));
await p.goto(`http://localhost:${port}/${process.argv[2]}`);
await p.waitForFunction("window.done === true", null, { timeout: 60000 });
const data = await p.evaluate(() => document.getElementById("c").toDataURL("image/png"));
fs.writeFileSync(process.argv[3], Buffer.from(data.split(",")[1], "base64"));
await b.close(); srv.close();
