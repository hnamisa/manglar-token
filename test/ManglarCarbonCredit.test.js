const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ManglarCarbonCredit", function () {
  async function deployFixture() {
    const [owner, oracle, certifier, buyer, recipient] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("ManglarCarbonCredit");
    const credits = await Contract.deploy(owner.address);
    await credits.waitForDeployment();

    await credits.setOracle(oracle.address, true);
    await credits.setCertifier(certifier.address, true);

    await credits.registerProject(
      "Manglar Azul Tumbes",
      "Tumbes, Peru",
      owner.address,
      "Blue carbon MRV",
      "ipfs://project"
    );

    return { credits, owner, oracle, certifier, buyer, recipient };
  }

  it("registers a project with defined ownership", async function () {
    const { credits, owner } = await deployFixture();
    const project = await credits.projects(1);

    expect(await credits.owner()).to.equal(owner.address);
    expect(project.name).to.equal("Manglar Azul Tumbes");
    expect(project.active).to.equal(true);
  });

  it("issues an MRV-backed credit batch", async function () {
    const { credits, certifier, buyer } = await deployFixture();
    const mrvHash = ethers.id("mrv-report-2025");

    await expect(
      credits.connect(certifier).issueBatch(
        1,
        buyer.address,
        1250,
        "2025",
        mrvHash,
        "ipfs://mrv-report",
        "0x"
      )
    ).to.emit(credits, "BatchIssued");

    expect(await credits.balanceOf(buyer.address, 1)).to.equal(1250n);
    expect((await credits.projects(1)).totalIssued).to.equal(1250n);
    expect((await credits.batches(1)).mrvHash).to.equal(mrvHash);
  });

  it("transfers and retires credits without double counting", async function () {
    const { credits, certifier, buyer, recipient } = await deployFixture();
    const mrvHash = ethers.id("mrv-report-2025");

    await credits.connect(certifier).issueBatch(1, buyer.address, 100, "2025", mrvHash, "ipfs://mrv", "0x");
    await credits.connect(buyer).transfer(recipient.address, 1, 40);
    await credits.connect(recipient).retire(
      1,
      25,
      recipient.address,
      "Neutralizacion de evento academico",
      ethers.id("retirement-certificate")
    );

    expect(await credits.balanceOf(buyer.address, 1)).to.equal(60n);
    expect(await credits.balanceOf(recipient.address, 1)).to.equal(15n);
    expect(await credits.retiredByBatch(1)).to.equal(25n);
    expect(await credits.availableToRetire(1)).to.equal(75n);
    expect((await credits.projects(1)).totalRetired).to.equal(25n);
  });

  it("blocks issuance by accounts without verifier role", async function () {
    const { credits, buyer } = await deployFixture();

    await expect(
      credits.connect(buyer).issueBatch(1, buyer.address, 1, "2025", ethers.id("bad"), "ipfs://bad", "0x")
    ).to.be.revertedWith("ONLY_VERIFIER");
  });
});
