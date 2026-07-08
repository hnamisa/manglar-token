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
  ink: "#12312C",
  muted: "#55716A",
  teal: "#007F7A",
  green: "#1D6B3A",
  gold: "#F2B94B",
  pale: "#D7E8DD",
  dark: "#0A2522",
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

function rect(slide, { x, y, w, h, fill = C.paper, line = "none", radius, name }) {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    name,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: line === "none" ? { style: "solid", fill: "none", width: 0 } : line,
    borderRadius: radius
  });
}

function line(slide, { x, y, w, weight = 3, fill = C.gold }) {
  return slide.shapes.add({
    geometry: "rect",
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

function footer(slide, number) {
  text(slide, "Manglar Azul MRV", { x: 64, y: 674, w: 260, h: 20, size: 12, color: C.muted, bold: true, name: `footer-${number}` });
  text(slide, String(number).padStart(2, "0"), { x: 1184, y: 672, w: 40, h: 24, size: 13, color: C.muted, bold: true, align: "right", name: `page-${number}` });
}

function addTitle(slide, title, subtitle, number) {
  text(slide, title, { x: 64, y: 54, w: 780, h: 84, size: 42, color: C.ink, bold: true, face: FONT.title, name: `slide-title-${number}` });
  if (subtitle) {
    text(slide, subtitle, { x: 64, y: 138, w: 760, h: 54, size: 19, color: C.muted, name: `slide-subtitle-${number}` });
  }
}

function addFlowNode(slide, idx, title, body, x, y, active = false) {
  rect(slide, { x, y, w: 218, h: 132, fill: active ? C.green : C.paper, line: { style: "solid", fill: active ? C.green : C.pale, width: 2 }, radius: "rounded-xl" });
  text(slide, String(idx), { x: x + 18, y: y + 18, w: 36, h: 30, size: 20, color: active ? C.gold : C.teal, bold: true, name: `flow-${idx}-num` });
  text(slide, title, { x: x + 18, y: y + 52, w: 174, h: 34, size: 21, color: active ? C.white : C.ink, bold: true, name: `flow-${idx}-title` });
  text(slide, body, { x: x + 18, y: y + 88, w: 176, h: 34, size: 13, color: active ? "#DCEDE7" : C.muted, name: `flow-${idx}-body` });
}

async function build() {
  await fs.mkdir(OUT, { recursive: true });
  const report = JSON.parse(await fs.readFile(MRV_REPORT, "utf8"));
  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  // Slide 1: cover
  {
    const slide = deck.slides.add();
    slide.background.fill = C.dark;
    await image(slide, "manglar-aerial.png", { x: 0, y: 0, w: W, h: H, alt: "Aerial mangrove estuary", name: "cover-image" });
    rect(slide, { x: 0, y: 0, w: 600, h: H, fill: "#0A2522CC", line: "none" });
    text(slide, "Hackathon Carbon Tokenization", { x: 64, y: 72, w: 420, h: 28, size: 15, color: C.gold, bold: true, name: "cover-eyebrow" });
    text(slide, "Manglar\nAzul MRV", { x: 60, y: 155, w: 480, h: 210, size: 78, color: C.white, bold: true, face: FONT.title, name: "cover-title" });
    line(slide, { x: 64, y: 395, w: 180, weight: 5, fill: C.gold });
    text(slide, "Tokenizacion EVM de carbono azul con evidencia MRV auditable y retiro publico.", { x: 64, y: 430, w: 430, h: 96, size: 25, color: "#E4F0EC", name: "cover-promise" });
    text(slide, "Hiro Namisato Maetahara · John Nuñez Perez", { x: 64, y: 632, w: 480, h: 24, size: 15, color: "#BED6CF", name: "cover-team" });
  }

  // Slide 2: problem
  {
    const slide = deck.slides.add();
    slide.background.fill = C.canvas;
    addTitle(slide, "El problema no es emitir; es confiar", "Los creditos naturales necesitan una ruta verificable desde datos MRV hasta retiro final.", 2);
    text(slide, "3", { x: 80, y: 238, w: 180, h: 150, size: 152, color: C.green, bold: true, face: FONT.title, name: "problem-number" });
    text(slide, "fricciones que bajan la integridad del mercado", { x: 246, y: 270, w: 360, h: 96, size: 34, color: C.ink, bold: true, face: FONT.title, name: "problem-claim" });
    const items = [
      ["MRV fragmentado", "Reportes y evidencia quedan fuera de la ruta de compra."],
      ["Doble conteo", "Un mismo credito puede reclamarse mas de una vez si no se retira."],
      ["Baja confianza", "Compradores no ven trazabilidad de lote, vintage y certificado."]
    ];
    items.forEach(([head, body], i) => {
      const y = 236 + i * 112;
      line(slide, { x: 720, y: y + 10, w: 62, weight: 5, fill: i === 1 ? C.gold : C.teal });
      text(slide, head, { x: 812, y, w: 340, h: 34, size: 27, color: C.ink, bold: true, name: `problem-head-${i}` });
      text(slide, body, { x: 812, y: y + 40, w: 350, h: 42, size: 18, color: C.muted, name: `problem-body-${i}` });
    });
    footer(slide, 2);
  }

  // Slide 3: solution flow
  {
    const slide = deck.slides.add();
    slide.background.fill = C.paper;
    addTitle(slide, "Solucion: una ruta auditable", "Cada credito nace de un hash MRV, se emite por lote y termina en un recibo de retiro.", 3);
    const y = 306;
    addFlowNode(slide, 1, "MRV", "Satelite, drone, sensores y parcelas", 82, y);
    addFlowNode(slide, 2, "Hash", "Reporte reproducible con SHA-256", 370, y);
    addFlowNode(slide, 3, "Lote MACC", "1 token = 1 tCO2e por vintage", 658, y, true);
    addFlowNode(slide, 4, "Retiro", "Recibo publico con certificateHash", 946, y);
    [316, 604, 892].forEach((x) => {
      line(slide, { x, y: y + 64, w: 38, weight: 4, fill: C.gold });
    });
    text(slide, "La evidencia pesada queda off-chain; el contrato guarda la prueba minima para auditar integridad.", { x: 180, y: 524, w: 920, h: 46, size: 25, color: C.ink, bold: true, align: "center", name: "solution-bottom-claim" });
    footer(slide, 3);
  }

  // Slide 4: MRV metrics
  {
    const slide = deck.slides.add();
    slide.background.fill = C.dark;
    await image(slide, "mrv-field.png", { x: 566, y: 0, w: 714, h: H, alt: "MRV with drone and sensor", name: "mrv-image" });
    rect(slide, { x: 0, y: 0, w: 650, h: H, fill: "#0A2522EE", line: "none" });
    text(slide, "MRV a creditos", { x: 64, y: 62, w: 480, h: 64, size: 47, color: C.white, bold: true, face: FONT.title, name: "mrv-title" });
    text(slide, "Dataset ilustrativo: 4 zonas de manglar, descuentos por fuga, incertidumbre y buffer de permanencia.", { x: 64, y: 142, w: 468, h: 64, size: 20, color: "#CFE5DF", name: "mrv-subtitle" });
    const metrics = [
      ["Delta bruto", "3,660", "tCO2e"],
      ["Delta neto", "3,580", "tCO2e"],
      ["Emitible", "2,731", "MACC"]
    ];
    metrics.forEach(([label, value, unit], i) => {
      const y = 260 + i * 105;
      text(slide, label, { x: 64, y, w: 160, h: 26, size: 15, color: C.gold, bold: true, name: `mrv-label-${i}` });
      text(slide, value, { x: 64, y: y + 26, w: 190, h: 58, size: 52, color: C.white, bold: true, face: FONT.title, name: `mrv-value-${i}` });
      text(slide, unit, { x: 270, y: y + 44, w: 120, h: 28, size: 20, color: "#CFE5DF", name: `mrv-unit-${i}` });
    });
    text(slide, `MRV hash: ${report.mrv_hash.slice(0, 18)}...${report.mrv_hash.slice(-8)}`, { x: 64, y: 602, w: 520, h: 28, size: 15, color: "#CFE5DF", face: FONT.mono, name: "mrv-hash" });
    footer(slide, 4);
  }

  // Slide 5: chart by zone
  {
    const slide = deck.slides.add();
    slide.background.fill = C.canvas;
    addTitle(slide, "De stock a lote emitible", "El pipeline conserva la trazabilidad por zona antes de agregar el lote 2025.", 5);
    slide.charts.add("bar", {
      position: { left: 92, top: 222, width: 760, height: 356 },
      categories: report.observations.map((row) => row.zone),
      series: [{ name: "MACC emitibles", values: report.observations.map((row) => row.issueable_tco2e), fill: C.teal }],
      hasLegend: false,
      dataLabels: { showValue: true, position: "outEnd" },
      yAxis: { majorGridlines: { style: "solid", fill: "#C9D8D2", width: 1 } }
    });
    text(slide, "2,731", { x: 936, y: 232, w: 220, h: 90, size: 78, color: C.green, bold: true, face: FONT.title, name: "chart-total" });
    text(slide, "creditos MACC emitibles tras descuentos MRV", { x: 940, y: 324, w: 226, h: 68, size: 24, color: C.ink, bold: true, name: "chart-total-label" });
    line(slide, { x: 940, y: 424, w: 190, weight: 5, fill: C.gold });
    text(slide, "Regla clave: no se tokeniza el stock total; se tokeniza el incremento neto verificable, con reserva de riesgo.", { x: 940, y: 454, w: 250, h: 98, size: 19, color: C.muted, name: "chart-rule" });
    footer(slide, 5);
  }

  // Slide 6: smart contract
  {
    const slide = deck.slides.add();
    slide.background.fill = C.paper;
    addTitle(slide, "Contrato EVM: simple, auditable, extensible", "Un lote une proyecto, vintage, toneladas, hash MRV y URI de evidencia.", 6);
    rect(slide, { x: 74, y: 226, w: 480, h: 334, fill: C.dark, line: "none", radius: "rounded-xl" });
    const code = [
      "registerProject(...)",
      "issueBatch(projectId, to, amount, mrvHash)",
      "transfer(to, batchId, amount)",
      "retire(batchId, amount, beneficiary)",
      "availableToRetire(batchId)"
    ].join("\n");
    text(slide, code, { x: 110, y: 270, w: 408, h: 222, size: 24, color: "#DDF5ED", face: FONT.mono, name: "contract-functions" });
    const roles = [
      ["Owner", "administra proyectos y roles"],
      ["Oracle MRV", "actualiza hashes de evidencia"],
      ["Certifier", "emite lotes validados"],
      ["Buyer", "retira creditos y recibe recibo"]
    ];
    roles.forEach(([role, desc], i) => {
      const y = 232 + i * 82;
      text(slide, role, { x: 646, y, w: 210, h: 30, size: 25, color: C.ink, bold: true, name: `role-${i}` });
      text(slide, desc, { x: 646, y: y + 34, w: 420, h: 28, size: 18, color: C.muted, name: `role-desc-${i}` });
      line(slide, { x: 606, y: y + 7, w: 22, weight: 22, fill: i === 2 ? C.gold : C.teal });
    });
    footer(slide, 6);
  }

  // Slide 7: demo
  {
    const slide = deck.slides.add();
    slide.background.fill = C.canvas;
    await image(slide, "retirement-demo.png", { x: 626, y: 0, w: 654, h: H, alt: "Retirement demo with QR", name: "retirement-image" });
    rect(slide, { x: 0, y: 0, w: 690, h: H, fill: "#F4F0E6EE", line: "none" });
    text(slide, "Demo funcional", { x: 64, y: 60, w: 500, h: 70, size: 52, color: C.ink, bold: true, face: FONT.title, name: "demo-title" });
    text(slide, "El usuario ve el mismo recorrido que queda en eventos del contrato.", { x: 64, y: 136, w: 470, h: 52, size: 22, color: C.muted, name: "demo-subtitle" });
    const steps = [
      ["01", "Registrar proyecto", "nombre, ubicacion, steward y metadata"],
      ["02", "Emitir lote MRV", "2,731 MACC con hash de evidencia"],
      ["03", "Retirar credito", "recibo publico con certificateHash"]
    ];
    steps.forEach(([num, head, body], i) => {
      const y = 250 + i * 110;
      text(slide, num, { x: 64, y, w: 58, h: 38, size: 28, color: C.teal, bold: true, face: FONT.mono, name: `demo-step-${i}` });
      text(slide, head, { x: 140, y, w: 330, h: 34, size: 27, color: C.ink, bold: true, name: `demo-head-${i}` });
      text(slide, body, { x: 140, y: y + 38, w: 360, h: 30, size: 18, color: C.muted, name: `demo-body-${i}` });
    });
    text(slide, "Local: demo/index.html", { x: 64, y: 610, w: 360, h: 28, size: 18, color: C.green, bold: true, face: FONT.mono, name: "demo-local" });
    footer(slide, 7);
  }

  // Slide 8: roadmap
  {
    const slide = deck.slides.add();
    slide.background.fill = C.dark;
    text(slide, "Roadmap", { x: 64, y: 60, w: 440, h: 72, size: 56, color: C.white, bold: true, face: FONT.title, name: "roadmap-title" });
    text(slide, "De prototipo de curso a piloto verificable de carbono azul.", { x: 64, y: 136, w: 560, h: 42, size: 22, color: "#CFE5DF", name: "roadmap-subtitle" });
    const road = [
      ["1", "Verificador", "metodologia acreditada"],
      ["2", "IPFS", "evidencia firmada"],
      ["3", "LACNet", "despliegue testnet"],
      ["4", "Wallet UI", "compra y retiro"],
      ["5", "Piloto", "sitio de manglar"]
    ];
    road.forEach(([num, head, body], i) => {
      const x = 86 + i * 230;
      rect(slide, { x, y: 316, w: 68, h: 68, fill: i === 0 ? C.gold : C.teal, line: "none", radius: "rounded-full" });
      text(slide, num, { x, y: 330, w: 68, h: 34, size: 30, color: i === 0 ? C.ink : C.white, bold: true, align: "center", name: `road-num-${i}` });
      text(slide, head, { x: x - 22, y: 420, w: 132, h: 34, size: 25, color: C.white, bold: true, align: "center", name: `road-head-${i}` });
      text(slide, body, { x: x - 40, y: 460, w: 170, h: 38, size: 16, color: "#CFE5DF", align: "center", name: `road-body-${i}` });
      if (i < road.length - 1) {
        line(slide, { x: x + 88, y: 350, w: 120, weight: 4, fill: C.gold });
      }
    });
    text(slide, "Entregable listo: codigo abierto, submission, pitch, demo local y guia de despliegue.", { x: 156, y: 580, w: 970, h: 42, size: 27, color: C.white, bold: true, align: "center", name: "roadmap-close" });
    text(slide, "Hiro Namisato Maetahara · John Nuñez Perez", { x: 362, y: 644, w: 556, h: 24, size: 16, color: C.gold, bold: true, align: "center", name: "roadmap-team" });
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
