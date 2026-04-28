// ─── Contract Types ──────────────────────────────────────────────────────────
export interface Position {
  id: bigint;
  name: string;
  active: boolean;
}

export interface Candidate {
  id: bigint;
  name: string;
  positionId: bigint;
  voteCount: bigint;
  active: boolean;
}

// ─── UI-friendly types (serialized from contract) ────────────────────────────
export interface PositionUI {
  id: string;
  name: string;
}

export interface CandidateUI {
  id: string;
  name: string;
  positionId: string;
  voteCount: number;
}

// ─── Ballot ───────────────────────────────────────────────────────────────────
// key = positionId (string), value = candidateId (string)
export type BallotSelections = Record<string, string>;

// ─── Registration ─────────────────────────────────────────────────────────────
export interface PendingRegistration {
  id: number;
  studentId: string;
  walletAddress: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  student: {
    name: string;
    studentId: string;
    email: string;
  };
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Window ethereum extension ────────────────────────────────────────────────
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
