import { ethers, BrowserProvider, Contract } from "ethers";

// ─── ABI ────────────────────────────────────────────────────────────────────
// Keep in sync with contracts/StudentVoting.sol
export const CONTRACT_ABI = [
  // Admin - Whitelist
  "function whitelist(address wallet) external",
  "function revokeWhitelist(address wallet) external",
  "function isWhitelisted(address) external view returns (bool)",
  "function hasVoted(address) external view returns (bool)",

  // Admin - Positions
  "function addPosition(string calldata name) external",
  "function removePosition(uint256 positionId) external",

  // Admin - Candidates
  "function addCandidate(string calldata name, uint256 positionId) external",
  "function removeCandidate(uint256 candidateId) external",

  // Admin - Election
  "function openVoting() external",
  "function closeVoting() external",
  "function getVotingStatus() external view returns (bool)",

  // Student - Vote
  "function vote(uint256[] calldata positionIds, uint256[] calldata candidateIds) external",

  // Public reads
  "function getPositions() external view returns (tuple(uint256 id, string name, bool active)[])",
  "function getCandidates() external view returns (tuple(uint256 id, string name, uint256 positionId, uint256 voteCount, bool active)[])",
  "function getResults() external view returns (tuple(uint256 id, string name, uint256 positionId, uint256 voteCount, bool active)[])",
  "function admin() external view returns (address)",
  "function votingOpen() external view returns (bool)",

  // Events
  "event Whitelisted(address indexed wallet)",
  "event VoteCast(address indexed voter)",
  "event VotingOpened()",
  "event VotingClosed()",
  "event PositionAdded(uint256 indexed id, string name)",
  "event CandidateAdded(uint256 indexed id, string name, uint256 positionId)",
];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// ─── Get read-only provider (no wallet needed) ──────────────────────────────
export function getReadOnlyContract(): Contract {
  const provider = new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
  );
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// ─── Get signer contract (MetaMask required) ────────────────────────────────
export async function getSignerContract(): Promise<Contract> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// ─── Connect MetaMask and return address ────────────────────────────────────
export async function connectWallet(): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed. Please install it to continue.");
  }
  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0] as string;
}

// ─── Get current connected address ──────────────────────────────────────────
export async function getCurrentAddress(): Promise<string | null> {
  if (typeof window === "undefined" || !window.ethereum) return null;
  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.listAccounts();
  return accounts.length > 0 ? accounts[0].address : null;
}
