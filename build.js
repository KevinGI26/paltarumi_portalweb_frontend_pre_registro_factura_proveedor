// Empaqueta webapp/ en dist/paltarumiportalwebregistroprefactura.zip (manifest.json en la raíz del zip)
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const dist = path.join(__dirname, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const out = fs.createWriteStream(path.join(dist, "paltarumiportalwebregistroprefactura.zip"));
const zip = archiver("zip", { zlib: { level: 9 } });
out.on("close", () => console.log("zip listo:", zip.pointer(), "bytes"));
zip.on("error", (e) => { throw e; });
zip.pipe(out);
zip.directory(path.join(__dirname, "webapp"), false);
zip.finalize();
