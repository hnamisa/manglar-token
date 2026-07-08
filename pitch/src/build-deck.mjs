import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.resolve(__dirname, "..", "output");
const ASSETS = path.join(ROOT, "assets", "images");
const MRV_REPORT = path.join(ROOT, "mrv", "output", "mrv_report.json");

const W = 1280;
const H = 720;
const C = {
  canvas: "#F4F0E6",
  paper: "#FFFDF7",
  ink: "#102F2B",
  muted: "#55716A",
  teal: "#007F7A",
  tealDark: "#063D3A",
  green: "#1D6B3A",
  gold: "#F2B94B",
  pale: "#D7E8DD",
  mist: "#E9F2EC",
  dark: "#0A2522",
  blue: "#0B4258",
  white: "#FFFFFF"
};

const FONT = {
  title: "Aptos Display",
  body: "Aptos",
  mono: "Aptos Mono"
};

async function readImageBlob(imagePath) {
  const bytes = await fs.readFile(imagePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function writeBlob(outputPath, blob) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, Buffer.from(await blob.arrayBuffer()));
}

async function cleanOutput() {
  await fs.mkdir(OUT, { recursive: true });
  const entries = await fs.readdir(OUT);
  await Promise.all(entries.map(async (entry) => {
    if (/^slide-\d{2}\.(png|layout\.json)$/.test(entry) || ["deck-montage.webp", "output.pptx"].includes(entry)) {
      await fs.unlink(path.join(OUT, entry));
    }
  }));
}

function rect(slide, { x, y, w, h, fill = C.paper, line = "none", radius, name, shadow }) {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: line === "none" ? { style: "solid", fill: "none", width: 0 } : line,
    borderRadius: radius,
    shadow
  });
}

function circle(slide, { x, y, size, fill, line = "none", name }) {
  return slide.shapes.add({
    geometry: "ellipse",
    name,
    position: { left: x, top: y, width: size, height: size },
    fill,
    line: line === "none" ? { style: "solid", fill: "none", width: 0 } : line
  });
}

function line(slide, { x, y, w, weight = 3, fill = C.gold, name }) {
  return slide.shapes.add({
    geometry: "rect",
    name,
    position: { left: x, top: y, width: w, height: weight },
    fill,
    line: { style: "solid", fill: "none", width: 0 }
  });
}

function text(slide, value, { x, y, w, h, size = 26, color = C.ink, bold = false, face = FONT.body, align = "left", valign = "top", name }) {
  const box = rect(slide, { x, y, w, h, fill: "none", line: "none", name });
  box.text = value;
  box.text.fontSize = size;
  box.text.color = color;
  box.text.bold = bold;
  box.text.typeface = face;
  box.text.alignment = align;
  box.text.verticalAlignment = valign;
  box.text.insets = { left: 0, right: 0, top: 0, bottom: 0 };
  return box;
}

async function image(slide, fileName, { x, y, w, h, fit = "cover", alt, radius, name }) {
  const img = slide.images.add({
    blob: await readImageBlob(path.join(ASSETS, fileName)),
    contentType: "image/png",
    alt,
    fit,
    name,
    geometry: radius ? "roundRect" : "rect",
    borderRadius: radius
  });
  img.position = { left: x, top: y, width: w, height: h };
  return img;
}

function footer(slide, number, dark = false) {
  const color = dark ? "#B8D3CB" : C.muted;
  text(slide, "Manglar Azul MRV", { x: 64, y: 674, w: 260, h: 20, size: 12, color, bold: true, name: `footer-${number}` });
  text(slide, String(number).padStart(2, "0"), { x: 1184, y: 672, w: 40, h: 24, size: 13, color, bold: true, align: "right", name: `page-${number}` });
}

function title(slide, value, subtitle, number, dark = false, width = 820) {
  const ink = dark ? C.white : C.ink;
  const muted = dark ? "#CFE5DF" : C.muted;
  text(slide, value, { x: 64, y: 48, w: width, h: 118, size: 44, color: ink, bold: true, face: FONT.title, name: `title-${number}` });
  if (subtitle) {
    text(slide, subtitle, { x: 66, y: 166, w: Math.min(width, 780), h: 58, size: 19, color: muted, name: `subtitle-${number}` });
  }
}

function metric(slide, label, value, unit, x, y, dark = false) {
  text(slide, label.toUpperCase(), { x, y, w: 250, h: 22, size: 13, color: C.gold, bold: true, name: `${label}-label` });
  text(slide, value, { x, y: y + 24, w: 240, h: 78, size: 64, color: dark ? C.white : C.green, bold: true, face: FONT.title, name: `${label}-value` });
  text(slide, unit, { x: x + 6, y: y + 100, w: 240, h: 28, size: 22, color: dark ? "#CFE5DF" : C.muted, name: `${label}-unit` });
}

function pill(slide, label, x, y, w, fill = C.teal, color = C.white) {
  rect(slide, { x, y, w, h: 36, fill, line: "none", radius: "rounded-full" });
  text(slide, label, { x: x + 18, y: y + 8, w: w - 36, h: 18, size: 14, color, bold: true, align: "center" });
}

function insightCard(slide, heading, body, x, y, w, h, accent = C.teal) {
  rect(slide, { x, y, w, h, fill: C.paper, line: { style: "solid", fill: "#CADBD4", width: 1 }, radius: "rounded-xl", shadow: "shadow-sm" });
  line(slide, { x: x + 24, y: y + 24, w: 60, weight: 5, fill: accent });
  text(slide, heading, { x: x + 24, y: y + 52, w: w - 48, h: 38, size: 25, color: C.ink, bold: true });
  text(slide, body, { x: x + 24, y: y + 96, w: w - 48, h: h - 112, size: 18, color: C.muted });
}

function flowStep(slide, num, heading, body, x, y, active = false) {
  rect(slide, {
    x,
    y,
    w: 238,
    h: 156,
    fill: active ? C.green : C.paper,
    line: { style: "solid", fill: active ? C.green : "#C5D9D2", width: 2 },
    radius: "rounded-xl",
    shadow: "shadow-sm"
  });
  text(slide, num, { x: x + 22, y: y + 18, w: 44, h: 30, size: 22, color: active ? C.gold : C.teal, bold: true, face: FONT.mono });
  text(slide, heading, { x: x + 22, y: y + 60, w: 188, h: 32, size: 25, color: active ? C.white : C.ink, bold: true });
  text(slide, body, { x: x + 22, y: y + 100, w: 188, h: 42, size: 15, color: active ? "#DDEFE8" : C.muted });
}

async function build() {
  await cleanOutput();
  const report = JSON.parse(await fs.readFile(MRV_REPORT, "utf8"));
  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  // 1. Cover
  {
    const slide = deck.slides.add();
    slide.background.fill = C.dark;
    await image(slide, "manglar-aerial.png", { x: 0, y: 0, w: W, h: H, alt: "Vista aerea de un ecosistema de manglar", name: "cover-image" });
    rect(slide, { x: 0, y: 0, w: 640, h: H, fill: "#0A2522DD", line: "none" });
    pill(slide, "Hackathon Carbon Tokenization", 64, 72, 260, C.gold, C.ink);
    text(slide, "Manglar\nAzul MRV", { x: 62, y: 168, w: 520, h: 214, size: 82, color: C.white, bold: true, face: FONT.title, name: "cover-title" });
    line(slide, { x: 66, y: 418, w: 180, weight: 6, fill: C.gold });
    text(slide, "Carbono azul tokenizado con evidencia MRV verificable y retiro publico.", { x: 66, y: 452, w: 448, h: 98, size: 27, color: "#E4F0EC", name: "cover-promise" });
    text(slide, "1 MACC = 1 tCO2e verificada", { x: 66, y: 574, w: 360, h: 32, size: 21, color: C.gold, bold: true, name: "cover-unit" });
    text(slide, "Hiro Namisato Maetahara · John Nuñez Perez", { x: 66, y: 632, w: 500, h: 24, size: 15, color: "#BED6CF", name: "cover-team" });
  }

  // 2. Problem
  {
    const slide = deck.slides.add();
    slide.background.fill = C.canvas;
    title(slide, "Un credito sin trazabilidad no genera confianza", "El mercado necesita demostrar de donde viene cada tonelada, quien la emite y cuando queda retirada.", 2);
    text(slide, "3", { x: 78, y: 252, w: 178, h: 150, size: 154, color: C.green, bold: true, face: FONT.title });
    text(slide, "riesgos que frenan proyectos naturales", { x: 248, y: 286, w: 354, h: 92, size: 35, color: C.ink, bold: true, face: FONT.title });
    insightCard(slide, "MRV fragmentado", "La evidencia vive en reportes, hojas de calculo o archivos externos sin vinculo verificable al token.", 692, 214, 412, 120, C.teal);
    insightCard(slide, "Doble conteo", "Si el retiro no es publico, una misma tonelada puede venderse, reportarse o reclamarse mas de una vez.", 692, 354, 412, 120, C.gold);
    insightCard(slide, "Comprador inseguro", "Empresas e instituciones necesitan auditar lote, vintage, evidencia y certificado sin depender de promesas.", 692, 494, 412, 120, C.green);
    footer(slide, 2);
  }

  // 3. Opportunity
  {
    const slide = deck.slides.add();
    slide.background.fill = C.dark;
    rect(slide, { x: 0, y: 0, w: W, h: H, fill: "#0A2522", line: "none" });
    circle(slide, { x: 866, y: 24, size: 350, fill: "#0B425888", name: "opportunity-orb-a" });
    circle(slide, { x: 810, y: 328, size: 286, fill: "#1D6B3A66", name: "opportunity-orb-b" });
    title(slide, "Tumbes puede probar un patron repetible", "Los manglares unen alto valor climatico, biodiversidad y comunidades costeras; la pieza faltante es una capa de confianza.", 3, true, 780);
    const items = [
      ["Carbono azul", "Ecosistemas costeros con captura y almacenamiento relevantes."],
      ["MRV accesible", "Satelite, drone, sensores y parcelas pueden alimentar una evidencia comun."],
      ["Mercado regional", "El mismo contrato puede emitir lotes para otros manglares y humedales."]
    ];
    items.forEach(([head, body], i) => {
      const x = 84 + i * 370;
      rect(slide, { x, y: 340, w: 310, h: 178, fill: "#FFFDF710", line: { style: "solid", fill: "#B8D3CB55", width: 1 }, radius: "rounded-xl" });
      text(slide, `0${i + 1}`, { x: x + 28, y: 366, w: 58, h: 30, size: 23, color: C.gold, bold: true, face: FONT.mono });
      text(slide, head, { x: x + 28, y: 416, w: 248, h: 36, size: 28, color: C.white, bold: true });
      text(slide, body, { x: x + 28, y: 462, w: 250, h: 52, size: 17, color: "#CFE5DF" });
    });
    footer(slide, 3, true);
  }

  // 4. Solution
  {
    const slide = deck.slides.add();
    slide.background.fill = C.paper;
    title(slide, "Manglar Azul conecta medicion, token y retiro", "El contrato no reemplaza al verificador; conserva una ruta publica para auditar cada lote.", 4);
    const y = 308;
    flowStep(slide, "01", "MRV", "datos de campo, drone y satelite", 70, y);
    flowStep(slide, "02", "Hash", "reporte reproducible con SHA-256", 362, y);
    flowStep(slide, "03", "MACC", "lote EVM por vintage y proyecto", 654, y, true);
    flowStep(slide, "04", "Retiro", "evento publico y certificado", 946, y);
    [324, 616, 908].forEach((x) => {
      line(slide, { x, y: y + 78, w: 44, weight: 5, fill: C.gold });
    });
    text(slide, "Resultado: el comprador puede seguir una tonelada desde evidencia MRV hasta retiro final.", { x: 180, y: 546, w: 920, h: 40, size: 28, color: C.ink, bold: true, align: "center" });
    footer(slide, 4);
  }

  // 5. MRV evidence
  {
    const slide = deck.slides.add();
    slide.background.fill = C.dark;
    await image(slide, "mrv-field.png", { x: 560, y: 0, w: 720, h: H, alt: "Monitoreo MRV con sensores y drone", name: "mrv-image" });
    rect(slide, { x: 0, y: 0, w: 672, h: H, fill: "#0A2522F0", line: "none" });
    title(slide, "La evidencia MRV produce 2,731 MACC emitibles", "El pipeline aplica fuga, incertidumbre y buffer de permanencia antes de emitir creditos.", 5, true, 560);
    metric(slide, "Delta bruto", "3,660", "tCO2e", 68, 276, true);
    metric(slide, "Delta neto", "3,580", "tCO2e", 316, 276, true);
    metric(slide, "Emitible", "2,731", "MACC", 68, 448, true);
    text(slide, `MRV hash: ${report.mrv_hash.slice(0, 20)}...${report.mrv_hash.slice(-10)}`, { x: 68, y: 614, w: 560, h: 26, size: 14, color: "#CFE5DF", face: FONT.mono });
    footer(slide, 5, true);
  }

  // 6. Zone-level traceability
  {
    const slide = deck.slides.add();
    slide.background.fill = C.canvas;
    title(slide, "El lote final conserva trazabilidad por zona", "Antes de agregar los 2,731 MACC, cada observacion mantiene area, delta, descuento y URI de evidencia.", 6);
    slide.charts.add("bar", {
      position: { left: 86, top: 236, width: 760, height: 330 },
      categories: report.observations.map((row) => row.zone),
      series: [{ name: "MACC emitibles", values: report.observations.map((row) => row.issueable_tco2e), fill: C.teal }],
      hasLegend: false,
      dataLabels: { showValue: true, position: "outEnd" },
      yAxis: { majorGridlines: { style: "solid", fill: "#C9D8D2", width: 1 } }
    });
    rect(slide, { x: 926, y: 246, w: 236, h: 266, fill: C.paper, line: { style: "solid", fill: "#C5D9D2", width: 1 }, radius: "rounded-xl", shadow: "shadow-sm" });
    text(slide, "Regla de integridad", { x: 956, y: 280, w: 176, h: 30, size: 23, color: C.ink, bold: true });
    line(slide, { x: 956, y: 326, w: 104, weight: 5, fill: C.gold });
    text(slide, "No se tokeniza el stock total. Se tokeniza el incremento neto verificable con reserva de riesgo.", { x: 956, y: 358, w: 170, h: 118, size: 18, color: C.muted });
    footer(slide, 6);
  }

  // 7. Architecture
  {
    const slide = deck.slides.add();
    slide.background.fill = C.paper;
    title(slide, "La arquitectura separa evidencia pesada y prueba publica", "Los datos completos quedan off-chain; el hash, lote y retiro viven en una capa EVM auditable.", 7);
    const nodes = [
      ["Datos MRV", "CSV, sensores, drone, parcelas", 92, 300],
      ["Reporte", "JSON + hash SHA-256", 356, 300],
      ["Contrato", "Solidity + Hardhat + LACNet", 620, 300],
      ["Retiro", "evento + certificateHash", 884, 300]
    ];
    nodes.forEach(([head, body, x, y], i) => {
      rect(slide, { x, y, w: 210, h: 140, fill: i === 2 ? C.green : C.mist, line: { style: "solid", fill: i === 2 ? C.green : "#C5D9D2", width: 2 }, radius: "rounded-xl" });
      text(slide, head, { x: x + 22, y: y + 30, w: 166, h: 32, size: 24, color: i === 2 ? C.white : C.ink, bold: true, align: "center" });
      text(slide, body, { x: x + 22, y: y + 74, w: 166, h: 44, size: 15, color: i === 2 ? "#DDEFE8" : C.muted, align: "center" });
      if (i < nodes.length - 1) {
        line(slide, { x: x + 220, y: y + 68, w: 44, weight: 5, fill: C.gold });
      }
    });
    text(slide, "Esta separacion mantiene bajos los costos y permite auditoria sin publicar todo el expediente en cadena.", { x: 178, y: 524, w: 924, h: 42, size: 28, color: C.ink, bold: true, align: "center" });
    footer(slide, 7);
  }

  // 8. Contract and demo
  {
    const slide = deck.slides.add();
    slide.background.fill = C.dark;
    await image(slide, "retirement-demo.png", { x: 640, y: 0, w: 640, h: H, alt: "Demo de retiro y certificado", name: "demo-image" });
    rect(slide, { x: 0, y: 0, w: 710, h: H, fill: "#0A2522F2", line: "none" });
    title(slide, "El demo prueba el ciclo completo", "Registrar proyecto, emitir lote MRV y retirar creditos produce una historia auditable de extremo a extremo.", 8, true, 560);
    const steps = [
      ["registerProject", "crea el proyecto Manglar Azul Tumbes"],
      ["issueBatch", "emite 2,731 MACC con hash MRV"],
      ["retire", "reduce oferta y publica certificateHash"]
    ];
    steps.forEach(([head, body], i) => {
      const y = 290 + i * 96;
      text(slide, `0${i + 1}`, { x: 76, y, w: 52, h: 28, size: 22, color: C.gold, bold: true, face: FONT.mono });
      text(slide, head, { x: 148, y: y - 2, w: 280, h: 32, size: 26, color: C.white, bold: true, face: FONT.mono });
      text(slide, body, { x: 148, y: y + 36, w: 390, h: 28, size: 18, color: "#CFE5DF" });
    });
    text(slide, "Pruebas Hardhat: 4 passing", { x: 76, y: 602, w: 306, h: 28, size: 20, color: C.gold, bold: true });
    footer(slide, 8, true);
  }

  // 9. Impact and scale
  {
    const slide = deck.slides.add();
    slide.background.fill = C.canvas;
    title(slide, "El impacto escala porque el patron se repite", "Un contrato multi-proyecto y multi-vintage permite crecer sin mezclar evidencias ni lotes.", 9);
    const cards = [
      ["Mercado confiable", "Retiros publicos reducen doble conteo y greenwashing.", C.teal],
      ["Comunidades visibles", "La evidencia puede conectar beneficios climaticos y gestion local.", C.green],
      ["Expansion regional", "El modelo sirve para manglares y humedales costeros en Latinoamerica.", C.gold]
    ];
    cards.forEach(([head, body, accent], i) => {
      insightCard(slide, head, body, 92 + i * 370, 270, 304, 196, accent);
    });
    text(slide, "La promesa no es crear un token mas: es hacer verificable el camino de cada tonelada.", { x: 172, y: 546, w: 936, h: 40, size: 28, color: C.ink, bold: true, align: "center" });
    footer(slide, 9);
  }

  // 10. Roadmap and ask
  {
    const slide = deck.slides.add();
    slide.background.fill = C.dark;
    title(slide, "El siguiente paso es un piloto verificable en LACNet", "El prototipo ya incluye codigo abierto, MRV reproducible, pruebas, demo local y PDFs de entrega.", 10, true, 770);
    const road = [
      ["01", "LACNet testnet", "desplegar contrato y guardar tx hashes"],
      ["02", "Evidencia IPFS", "publicar MRV y metadata con CID"],
      ["03", "Verificador", "firmas y metodologia acreditada"],
      ["04", "Wallet UI", "retiro desde interfaz conectada"],
      ["05", "Piloto", "sitio de manglar y comprador institucional"]
    ];
    road.forEach(([num, head, body], i) => {
      const x = 72 + i * 232;
      circle(slide, { x, y: 314, size: 72, fill: i === 0 ? C.gold : C.teal });
      text(slide, num, { x, y: 334, w: 72, h: 30, size: 24, color: i === 0 ? C.ink : C.white, bold: true, align: "center", face: FONT.mono });
      text(slide, head, { x: x - 34, y: 424, w: 140, h: 34, size: 23, color: C.white, bold: true, align: "center" });
      text(slide, body, { x: x - 52, y: 466, w: 176, h: 52, size: 15, color: "#CFE5DF", align: "center" });
      if (i < road.length - 1) {
        line(slide, { x: x + 86, y: 348, w: 120, weight: 4, fill: C.gold });
      }
    });
    rect(slide, { x: 214, y: 578, w: 852, h: 58, fill: "#FFFDF714", line: { style: "solid", fill: "#B8D3CB55", width: 1 }, radius: "rounded-full" });
    text(slide, "Repositorio publico: github.com/hnamisa/manglar-token", { x: 254, y: 596, w: 772, h: 26, size: 22, color: C.gold, bold: true, align: "center", face: FONT.mono });
    footer(slide, 10, true);
  }

  for (const [index, slide] of deck.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    await writeBlob(path.join(OUT, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(OUT, `${stem}.layout.json`), await layout.text(), "utf8");
  }

  await writeBlob(path.join(OUT, "deck-montage.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(path.join(OUT, "output.pptx"));

  console.log(JSON.stringify({ slides: deck.slides.items.length, output: path.join(OUT, "output.pptx") }, null, 2));
}

build().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exitCode = 1;
});
