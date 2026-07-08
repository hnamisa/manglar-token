# FINAL SUBMISSION FORM - MANGLAR AZUL MRV

Hackathon Carbon Tokenization - Final Submission

## 1. PROJECT NAME

**Manglar Azul MRV: Blue-Carbon Credit Tokenization Platform on LACNet**

Manglar Azul MRV is an EVM-compatible platform for issuing and retiring tokenized blue-carbon credits backed by auditable MRV evidence from mangrove conservation and restoration projects.

## 2. TEAM MEMBERS AND ROLES

**Team: Manglar Azul**

- **Hiro Namisato Maetahara**
  - Role: Blockchain Lead and Smart Contract Developer.
  - Responsibilities: Solidity contract architecture, EVM compatibility, Hardhat configuration, deployment scripts, test suite and GitHub repository.

- **John Nuñez Perez**
  - Role: MRV/Data Lead and Product Presenter.
  - Responsibilities: MRV methodology design, sample dataset, impact analysis, final submission documentation, pitch narrative and functional demo script.

## 3. PROBLEM DESCRIPTION

**Global challenge: low-trust nature-based carbon markets.**

Blue-carbon projects such as mangrove conservation can generate strong climate, biodiversity and community benefits. However, carbon credit markets still face critical trust barriers:

- **Fragmented MRV evidence:** satellite, drone, sensor and field-plot data often remain in separate reports with no direct link to issued credits.
- **Double-counting risk:** a credit can be sold, claimed or reported more than once when retirement is not publicly verifiable.
- **High verification cost:** small coastal communities struggle to access transparent carbon markets because traditional validation and certification processes are expensive.
- **Buyer confidence gap:** companies need a simple way to audit the path from measured carbon benefit to issued batch and retirement certificate.
- **Local benefit visibility:** community stewardship, ecosystem protection and revenue distribution are often disconnected from the token or certificate purchased by the buyer.

Manglar Azul focuses on mangrove ecosystems in Tumbes, Peru as an initial blue-carbon use case, but the architecture can be reused for other coastal restoration projects.

## 4. SOLUTION SUMMARY

Manglar Azul MRV creates an auditable route from carbon measurement to retirement. A Python MRV pipeline calculates issueable tonnes of CO2e after leakage, uncertainty and permanence buffer discounts. The resulting MRV report is hashed and anchored in an EVM smart contract, which issues one tokenized batch per vintage. Buyers can transfer or retire credits, generating a public retirement record and certificate hash.

**Core value proposition:**

- 1 MACC token represents 1 verified tonne of CO2e from a specific MRV batch.
- Each batch stores `projectId`, `vintage`, `tonnesCO2e`, `mrvHash` and `evidenceURI`.
- Retirement reduces available supply and emits an auditable `CreditRetired` event.
- Evidence remains off-chain but is linked on-chain through reproducible hashes.

**Operational proof in the prototype:**

- Four mangrove zones in Tumbes are included in the sample MRV dataset.
- Gross carbon delta: **3,660 tCO2e**.
- Net carbon delta after leakage: **3,580 tCO2e**.
- Issueable credits after uncertainty and permanence buffer: **2,731 MACC**.
- MRV hash: `0x3cbcd3d5dc5901126ac241f1ed3001f0264beebca291d27549e5a8a42cc8e1ba`.

## 5. TECHNOLOGIES USED

**Blockchain and smart contract stack:**

- Solidity `0.8.24`.
- Hardhat for compilation, testing and deployment automation.
- EVM-compatible smart contract deployed through a LACNet-ready configuration.
- ERC-1155-style batch accounting for project/vintage credit lots.
- Event-based audit trail for issuance, transfer and retirement.

**MRV and data stack:**

- Python MRV pipeline for reproducible calculations.
- CSV observation dataset with baseline stock, measured stock, leakage, uncertainty and permanence buffer.
- SHA-256 hashing for MRV reports and retirement certificates.
- IPFS-style URIs for off-chain evidence and metadata.

**Demo and documentation stack:**

- HTML/CSS/JavaScript functional demo for the user flow.
- PowerPoint pitch deck with PDF export.
- GitHub public repository with source code, docs, MRV outputs and PDF deliverables.

## 6. PITCH DECK LINK

**Local deck:** `pitch/output/output.pptx`

**Canva editable deck:** https://www.canva.com/d/gsJ0PxkcwH9zA30

**Canva view link:** https://www.canva.com/d/u_Mhmdc4g2DdGZC

**PDF version for upload:** `entregables_pdf/03_pitch_deck_manglar_azul_mrv.pdf`

**Repository copy:** https://github.com/hnamisa/manglar-token/tree/main/entregables_pdf

Pitch deck structure:

1. Cover: Manglar Azul MRV and the verified blue-carbon promise.
2. Problem: a carbon credit without traceability does not create trust.
3. Opportunity: Tumbes as the first case for a repeatable blue-carbon pattern.
4. Solution: MRV measurement, evidence hash, MACC batch and public retirement.
5. MRV evidence: 3,660 gross tCO2e, 3,580 net tCO2e and 2,731 issueable MACC.
6. Zone traceability: the final batch keeps links to observations and evidence URIs.
7. Architecture: heavy evidence off-chain, integrity proof on-chain.
8. Contract and demo: project registration, issuance, transfer and retirement.
9. Impact and scale: buyer trust, community visibility and regional expansion.
10. Roadmap and close: LACNet testnet, IPFS/Filecoin, verifier, wallet UI and pilot.

## 7. GITHUB REPOSITORY LINK

**Public repository:** https://github.com/hnamisa/manglar-token

Repository contents:

- `/contracts`: `ManglarCarbonCredit.sol`, the EVM smart contract.
- `/scripts`: deployment, demo-flow and PDF export scripts.
- `/mrv`: Python MRV pipeline and generated report.
- `/data`: sample MRV observations and project metadata.
- `/demo`: functional browser demo.
- `/docs`: final submission, architecture, roadmap, deployment guide and video script.
- `/pitch`: editable pitch deck source and exported slides.
- `/entregables_pdf`: PDF files ready to upload to the professor's Drive folder.
- `/test`: Hardhat test suite covering project registration, issuance, transfer, retirement and access control.

## 8. FUNCTIONAL VIDEO DEMO LINK

**Video status:** ready to record and upload.

**Script:** `docs/demo-script.md`

**PDF script:** `entregables_pdf/06_guion_video_demo_manglar_azul_mrv.pdf`

Recommended 3-minute demo structure:

- `0:00-0:30`: problem and project overview.
- `0:30-1:05`: run `python mrv/mrv_pipeline.py` and explain the MRV hash.
- `1:05-1:45`: show the Solidity contract and run `node scripts/demo-flow.js`.
- `1:45-2:45`: open `demo/index.html` and click register, issue and retire.
- `2:45-3:00`: summarize impact, scalability and roadmap.

Once uploaded to Drive/YouTube, replace this field with the public demo link.

## 9. IMPACT OR SCALABILITY JUSTIFICATION

**Climate and environmental impact:**

- Supports mangrove conservation and restoration, a high-value blue-carbon ecosystem.
- Links carbon benefit to transparent MRV evidence instead of unverifiable claims.
- Makes credit retirement public, reducing greenwashing and double-counting risk.

**Social and economic impact:**

- Creates a path for coastal communities to participate in carbon markets.
- Makes project stewardship and evidence visible to buyers and institutions.
- Can be extended to revenue-sharing contracts or community multisig governance.

**Technical scalability:**

- Multi-project and multi-vintage smart contract structure.
- Off-chain evidence with on-chain hashes keeps gas costs low.
- EVM compatibility allows deployment on LACNet and other EVM networks.
- MRV pipeline can ingest certified data from drones, satellites, sensors and auditors.

**Market scalability:**

- Initial use case: mangrove zones in Tumbes, Peru.
- Expansion potential: mangrove and coastal wetland projects in Ecuador, Colombia, Brazil and other Latin American countries.
- Future integration: IPFS/Filecoin storage, verifier dashboards, wallet UI and institutional buyer retirement certificates.

## 10. HACKATHON OBJECTIVES ALIGNMENT

**Objective: transparency in carbon markets.**

- The project anchors MRV evidence hashes directly to issued batches.
- Every retirement produces an on-chain event and certificate hash.

**Objective: viable and scalable blockchain solution.**

- The contract compiles and tests with Hardhat.
- The code is public and organized for deployment.
- The architecture separates data-heavy MRV evidence from efficient on-chain state.

**Objective: sustainability and global regulation.**

- The project supports climate mitigation through blue-carbon ecosystems.
- The evidence URI/hash structure can connect to verifiers, registries and national frameworks.
- Future versions can add methodology-specific compliance fields without replacing the core contract.

**Objective: innovation through advanced technology.**

- Combines MRV data processing, hashing, smart contracts and functional UI demo.
- Uses tokenized batches and retirement receipts rather than simple claim certificates.

## 11. FUTURE ROADMAP

**Phase 1: Hackathon foundation completed**

- EVM smart contract implemented.
- MRV pipeline and sample dataset completed.
- Functional demo and pitch deck completed.
- Public GitHub repository and PDF deliverables published.

**Phase 2: LACNet testnet deployment**

- Configure real wallet credentials and RPC endpoint.
- Deploy `ManglarCarbonCredit` on LACNet testnet.
- Store deployed contract address and transaction hashes in `deployments/`.
- Update final submission with explorer links.

**Phase 3: Verified MRV and decentralized evidence**

- Replace sample data with verifier-approved mangrove MRV data.
- Publish MRV documents and geospatial evidence to IPFS/Filecoin.
- Add signed verifier attestations linked to each batch.

**Phase 4: Buyer-facing retirement interface**

- Add wallet connection to the demo UI.
- Generate downloadable retirement certificates.
- Show public audit trail by project, batch, holder and beneficiary.

**Phase 5: Pilot and scale**

- Run a pilot with one mangrove site and one institutional buyer.
- Add community revenue distribution and multisig administration.
- Extend the model to additional blue-carbon projects in Latin America.
