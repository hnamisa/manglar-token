const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const reportPath = path.join(__dirname, "..", "mrv", "output", "mrv_report.json");

function loadReport() {
  if (!fs.existsSync(reportPath)) {
    throw new Error("Missing MRV report. Run `python mrv/mrv_pipeline.py` first.");
  }
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

function fakeTx(label, payload) {
  const hash = crypto
    .createHash("sha256")
    .update(`${label}:${JSON.stringify(payload)}`)
    .digest("hex")
    .slice(0, 24);
  return `0x${hash}`;
}

function main() {
  const report = loadReport();
  const project = {
    id: 1,
    name: "Manglar Azul Tumbes",
    steward: "Comunidad costera + operador MRV",
    methodology: "Blue carbon MRV: satellite, drone, field plots, buffer reserve"
  };
  const batch = {
    id: 1,
    vintage: report.vintage,
    amount: report.issueable_tco2e,
    mrvHash: report.mrv_hash
  };
  const retirement = {
    batchId: batch.id,
    amount: 25,
    beneficiary: "Empresa demo - neutralizacion de evento",
    certificateHash: fakeTx("certificate", { batch, amount: 25 })
  };

  console.log("=== Manglar Azul MRV + Tokenization Demo ===");
  console.log(`1. Register project -> tx ${fakeTx("registerProject", project)}`);
  console.log(`   ${project.name} | ${project.methodology}`);
  console.log(`2. Anchor MRV report -> ${report.mrv_hash}`);
  console.log(`   Gross delta: ${report.gross_delta_tco2e} tCO2e`);
  console.log(`   Issueable after leakage, uncertainty and buffer: ${report.issueable_tco2e} tCO2e`);
  console.log(`3. Issue carbon credit batch -> tx ${fakeTx("issueBatch", batch)}`);
  console.log(`   Token ID #${batch.id} | ${batch.amount} MACC | vintage ${batch.vintage}`);
  console.log(`4. Retire 25 tCO2e -> tx ${fakeTx("retire", retirement)}`);
  console.log(`   Certificate hash: ${retirement.certificateHash}`);
  console.log("5. Public audit path:");
  console.log("   MRV CSV -> mrv_report.json -> bytes32 hash -> issued batch -> retirement receipt");
}

main();
