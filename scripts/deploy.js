const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

function loadMrvReport() {
  const reportPath = path.join(__dirname, "..", "mrv", "output", "mrv_report.json");
  if (!fs.existsSync(reportPath)) {
    throw new Error("Run `python mrv/mrv_pipeline.py` before deployment to generate mrv_report.json");
  }
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

async function main() {
  const [deployer, buyer] = await ethers.getSigners();
  const report = loadMrvReport();

  const steward = process.env.PROJECT_STEWARD && process.env.PROJECT_STEWARD !== "0x0000000000000000000000000000000000000000"
    ? process.env.PROJECT_STEWARD
    : deployer.address;
  const initialBuyer = process.env.INITIAL_BUYER && process.env.INITIAL_BUYER !== "0x0000000000000000000000000000000000000000"
    ? process.env.INITIAL_BUYER
    : buyer?.address || deployer.address;

  const ManglarCarbonCredit = await ethers.getContractFactory("ManglarCarbonCredit");
  const credits = await ManglarCarbonCredit.deploy(deployer.address);
  await credits.waitForDeployment();

  const address = await credits.getAddress();
  console.log(`ManglarCarbonCredit deployed to: ${address}`);

  await (await credits.setOracle(deployer.address, true)).wait();
  await (await credits.setCertifier(deployer.address, true)).wait();

  await (await credits.registerProject(
    "Manglar Azul Tumbes",
    "Humedales y manglares de Tumbes, Peru",
    steward,
    "Blue carbon MRV: remote sensing + field plots + buffer reserve",
    "ipfs://manglar-azul/project-metadata.json"
  )).wait();

  const tx = await credits.issueBatch(
    1,
    initialBuyer,
    report.issueable_tco2e,
    report.vintage,
    report.mrv_hash,
    "ipfs://manglar-azul/mrv-report-2025.json",
    "0x"
  );
  await tx.wait();

  console.log(`Project registered: 1`);
  console.log(`Batch issued: 1`);
  console.log(`Initial buyer: ${initialBuyer}`);
  console.log(`Issued tonnes CO2e: ${report.issueable_tco2e}`);
  console.log(`MRV hash: ${report.mrv_hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
