// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC1155Receiver {
    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4);

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4);
}

/// @title ManglarCarbonCredit
/// @notice EVM-compatible carbon credit registry for blue-carbon mangrove projects.
/// @dev Token unit: 1 token = 1 verified tonne of CO2e for one MRV batch.
contract ManglarCarbonCredit {
    struct Project {
        string name;
        string location;
        address steward;
        string methodology;
        string metadataURI;
        bool active;
        uint256 totalIssued;
        uint256 totalRetired;
    }

    struct Batch {
        uint256 projectId;
        uint256 tonnesCO2e;
        uint256 issuedAt;
        string vintage;
        bytes32 mrvHash;
        string evidenceURI;
    }

    struct Retirement {
        uint256 batchId;
        address beneficiary;
        uint256 amount;
        string reason;
        uint256 retiredAt;
        bytes32 certificateHash;
    }

    string public constant name = "Manglar Azul Carbon Credit";
    string public constant symbol = "MACC";

    bytes4 private constant ERC1155_ACCEPTED = 0xf23a6e61;
    bytes4 private constant ERC1155_BATCH_ACCEPTED = 0xbc197c81;

    address public owner;
    uint256 public nextProjectId = 1;
    uint256 public nextBatchId = 1;
    uint256 public nextRetirementId = 1;

    mapping(address => bool) public oracles;
    mapping(address => bool) public certifiers;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Batch) public batches;
    mapping(uint256 => Retirement) public retirements;
    mapping(uint256 => uint256) public retiredByBatch;
    mapping(uint256 => mapping(address => uint256)) private balances;
    mapping(address => mapping(address => bool)) private operatorApprovals;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OracleUpdated(address indexed account, bool allowed);
    event CertifierUpdated(address indexed account, bool allowed);
    event ProjectRegistered(uint256 indexed projectId, address indexed steward, string name, string location);
    event ProjectStatusUpdated(uint256 indexed projectId, bool active);
    event BatchIssued(
        uint256 indexed batchId,
        uint256 indexed projectId,
        address indexed to,
        uint256 amount,
        bytes32 mrvHash,
        string evidenceURI
    );
    event MrvEvidenceUpdated(uint256 indexed batchId, bytes32 oldHash, bytes32 newHash, string evidenceURI);
    event CreditRetired(
        uint256 indexed retirementId,
        uint256 indexed batchId,
        address indexed holder,
        address beneficiary,
        uint256 amount,
        bytes32 certificateHash
    );
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);
    event URI(string value, uint256 indexed id);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == owner || oracles[msg.sender] || certifiers[msg.sender], "ONLY_VERIFIER");
        _;
    }

    constructor(address initialOwner) {
        require(initialOwner != address(0), "OWNER_ZERO");
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || interfaceId == 0xd9b67a26 || interfaceId == 0x0e89341c;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "OWNER_ZERO");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setOracle(address account, bool allowed) external onlyOwner {
        require(account != address(0), "ACCOUNT_ZERO");
        oracles[account] = allowed;
        emit OracleUpdated(account, allowed);
    }

    function setCertifier(address account, bool allowed) external onlyOwner {
        require(account != address(0), "ACCOUNT_ZERO");
        certifiers[account] = allowed;
        emit CertifierUpdated(account, allowed);
    }

    function registerProject(
        string calldata projectName,
        string calldata location,
        address steward,
        string calldata methodology,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 projectId) {
        require(steward != address(0), "STEWARD_ZERO");
        projectId = nextProjectId++;

        projects[projectId] = Project({
            name: projectName,
            location: location,
            steward: steward,
            methodology: methodology,
            metadataURI: metadataURI,
            active: true,
            totalIssued: 0,
            totalRetired: 0
        });

        emit ProjectRegistered(projectId, steward, projectName, location);
    }

    function setProjectActive(uint256 projectId, bool active) external onlyOwner {
        _requireProject(projectId);
        projects[projectId].active = active;
        emit ProjectStatusUpdated(projectId, active);
    }

    function issueBatch(
        uint256 projectId,
        address to,
        uint256 amount,
        string calldata vintage,
        bytes32 mrvHash,
        string calldata evidenceURI,
        bytes calldata data
    ) external onlyVerifier returns (uint256 batchId) {
        require(to != address(0), "TO_ZERO");
        require(amount > 0, "AMOUNT_ZERO");
        _requireProject(projectId);
        require(projects[projectId].active, "PROJECT_INACTIVE");

        batchId = nextBatchId++;
        batches[batchId] = Batch({
            projectId: projectId,
            tonnesCO2e: amount,
            issuedAt: block.timestamp,
            vintage: vintage,
            mrvHash: mrvHash,
            evidenceURI: evidenceURI
        });

        projects[projectId].totalIssued += amount;
        _mint(to, batchId, amount, data);

        emit BatchIssued(batchId, projectId, to, amount, mrvHash, evidenceURI);
        emit URI(evidenceURI, batchId);
    }

    function updateMrvEvidence(
        uint256 batchId,
        bytes32 newMrvHash,
        string calldata newEvidenceURI
    ) external onlyVerifier {
        _requireBatch(batchId);
        bytes32 oldHash = batches[batchId].mrvHash;
        batches[batchId].mrvHash = newMrvHash;
        batches[batchId].evidenceURI = newEvidenceURI;
        emit MrvEvidenceUpdated(batchId, oldHash, newMrvHash, newEvidenceURI);
        emit URI(newEvidenceURI, batchId);
    }

    function retire(
        uint256 batchId,
        uint256 amount,
        address beneficiary,
        string calldata reason,
        bytes32 certificateHash
    ) external returns (uint256 retirementId) {
        require(beneficiary != address(0), "BENEFICIARY_ZERO");
        require(amount > 0, "AMOUNT_ZERO");
        _requireBatch(batchId);
        require(balances[batchId][msg.sender] >= amount, "INSUFFICIENT_BALANCE");

        balances[batchId][msg.sender] -= amount;
        retiredByBatch[batchId] += amount;
        projects[batches[batchId].projectId].totalRetired += amount;

        retirementId = nextRetirementId++;
        retirements[retirementId] = Retirement({
            batchId: batchId,
            beneficiary: beneficiary,
            amount: amount,
            reason: reason,
            retiredAt: block.timestamp,
            certificateHash: certificateHash
        });

        emit TransferSingle(msg.sender, msg.sender, address(0), batchId, amount);
        emit CreditRetired(retirementId, batchId, msg.sender, beneficiary, amount, certificateHash);
    }

    function transfer(address to, uint256 batchId, uint256 amount) external {
        _transfer(msg.sender, msg.sender, to, batchId, amount);
        _doSafeTransferAcceptanceCheck(msg.sender, msg.sender, to, batchId, amount, bytes(""));
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external {
        require(from == msg.sender || operatorApprovals[from][msg.sender], "NOT_APPROVED");
        _transfer(msg.sender, from, to, id, amount);
        _doSafeTransferAcceptanceCheck(msg.sender, from, to, id, amount, data);
    }

    function setApprovalForAll(address operator, bool approved) external {
        require(operator != msg.sender, "SELF_APPROVAL");
        operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) external view returns (bool) {
        return operatorApprovals[account][operator];
    }

    function balanceOf(address account, uint256 id) public view returns (uint256) {
        require(account != address(0), "ACCOUNT_ZERO");
        return balances[id][account];
    }

    function balanceOfBatch(
        address[] calldata accounts,
        uint256[] calldata ids
    ) external view returns (uint256[] memory batchBalances) {
        require(accounts.length == ids.length, "LENGTH_MISMATCH");
        batchBalances = new uint256[](accounts.length);
        for (uint256 i = 0; i < accounts.length; i++) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }
    }

    function uri(uint256 batchId) external view returns (string memory) {
        _requireBatch(batchId);
        return batches[batchId].evidenceURI;
    }

    function availableToRetire(uint256 batchId) external view returns (uint256) {
        _requireBatch(batchId);
        return batches[batchId].tonnesCO2e - retiredByBatch[batchId];
    }

    function _mint(address to, uint256 id, uint256 amount, bytes calldata data) internal {
        balances[id][to] += amount;
        emit TransferSingle(msg.sender, address(0), to, id, amount);
        _doSafeTransferAcceptanceCheck(msg.sender, address(0), to, id, amount, data);
    }

    function _transfer(address operator, address from, address to, uint256 id, uint256 amount) internal {
        require(to != address(0), "TO_ZERO");
        require(amount > 0, "AMOUNT_ZERO");
        _requireBatch(id);
        require(balances[id][from] >= amount, "INSUFFICIENT_BALANCE");

        balances[id][from] -= amount;
        balances[id][to] += amount;

        emit TransferSingle(operator, from, to, id, amount);
    }

    function _requireProject(uint256 projectId) internal view {
        require(projectId > 0 && projectId < nextProjectId, "PROJECT_NOT_FOUND");
    }

    function _requireBatch(uint256 batchId) internal view {
        require(batchId > 0 && batchId < nextBatchId, "BATCH_NOT_FOUND");
    }

    function _doSafeTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        if (to.code.length == 0) {
            return;
        }

        bytes4 response = IERC1155Receiver(to).onERC1155Received(operator, from, id, amount, data);
        require(response == ERC1155_ACCEPTED || response == ERC1155_BATCH_ACCEPTED, "ERC1155_REJECTED");
    }
}
