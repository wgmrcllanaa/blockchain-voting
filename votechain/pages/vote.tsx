import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import axios from "axios";
import Navbar from "@/components/Navbar";
import CandidateCard from "@/components/CandidateCard";
import BallotReview from "@/components/BallotReview";
import { connectWallet, getSignerContract, getReadOnlyContract } from "@/lib/contract";
import { PositionUI, CandidateUI, BallotSelections } from "@/types";

type VoteStatus = "idle" | "checking" | "not_connected" | "not_whitelisted" | "already_voted" | "voting_closed" | "ready" | "reviewing" | "submitting" | "success";

export default function VotePage() {
  const [status, setStatus] = useState<VoteStatus>("idle");
  const [walletAddress, setWalletAddress] = useState("");
  const [positions, setPositions] = useState<PositionUI[]>([]);
  const [candidates, setCandidates] = useState<CandidateUI[]>([]);
  const [selections, setSelections] = useState<BallotSelections>({});
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const checkWalletStatus = useCallback(async (address: string) => {
    setStatus("checking");
    setError("");
    try {
      const contract = getReadOnlyContract();
      const [isOpen, isWhitelisted, hasVoted] = await Promise.all([
        contract.votingOpen(),
        contract.isWhitelisted(address),
        contract.hasVoted(address),
      ]);

      if (!isOpen) { setStatus("voting_closed"); return; }
      if (!isWhitelisted) { setStatus("not_whitelisted"); return; }
      if (hasVoted) { setStatus("already_voted"); return; }

      // Load ballot data
      const { data } = await axios.get("/api/positions");
      setPositions(data.data.positions);
      setCandidates(data.data.candidates);
      setStatus("ready");
    } catch {
      setError("Failed to connect to the contract. Make sure the Hardhat node is running and MetaMask is on Hardhat Local (Chain ID 31337).");
      setStatus("idle");
    }
  }, []);

  const handleConnect = async () => {
    setError("");
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      await checkWalletStatus(address);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet.");
    }
  };

  // Listen for account change
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const handler = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length > 0) {
        setWalletAddress(accs[0]);
        checkWalletStatus(accs[0]);
      } else {
        setStatus("not_connected");
        setWalletAddress("");
      }
    };
    window.ethereum.on("accountsChanged", handler);
    return () => window.ethereum?.removeListener("accountsChanged", handler);
  }, [checkWalletStatus]);

  const handleSelect = (positionId: string, candidateId: string) => {
    setSelections((prev) => ({ ...prev, [positionId]: candidateId }));
  };

  const skippedPositions = positions.filter((p) => !selections[p.id]);

  const handleSubmitVote = async () => {
    setStatus("submitting");
    setError("");
    try {
      const contract = await getSignerContract();

      const positionIds = Object.keys(selections).map(BigInt);
      const candidateIds = Object.values(selections).map(BigInt);

      const tx = await contract.vote(positionIds, candidateIds);
      await tx.wait();
      setTxHash(tx.hash);
      setStatus("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed.";
      setError(msg.includes("user rejected") ? "Transaction was rejected in MetaMask." : msg);
      setStatus("reviewing");
    }
  };

  return (
    <>
      <Head>
        <title>Vote — VoteChain</title>
      </Head>
      <Navbar />

      {/* Ballot review modal */}
      {(status === "reviewing" || status === "submitting") && (
        <BallotReview
          positions={positions}
          candidates={candidates}
          selections={selections}
          onConfirm={handleSubmitVote}
          onBack={() => setStatus("ready")}
          isSubmitting={status === "submitting"}
        />
      )}

      <main className="min-h-screen bg-[#F7F8FB] py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold text-au-blue">Cast Your Vote</h1>
            <p className="text-gray-500 mt-2 text-sm">ACOMSS 2026–2027 Elections</p>
          </div>

          {/* ── Not connected ── */}
          {(status === "idle" || status === "not_connected") && (
            <StatusCard
              icon="🦊"
              title="Connect Your Wallet"
              desc="Connect your whitelisted MetaMask wallet to access the ballot."
              action={<button onClick={handleConnect} className="btn-gold">Connect MetaMask</button>}
              error={error}
            />
          )}

          {/* ── Checking ── */}
          {status === "checking" && (
            <StatusCard icon="⏳" title="Checking eligibility..." desc="Verifying your wallet on the blockchain." />
          )}

          {/* ── Not whitelisted ── */}
          {status === "not_whitelisted" && (
            <StatusCard
              icon="🔒"
              title="Wallet Not Approved"
              desc={`Your wallet (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}) is not on the whitelist. Please register first and wait for admin approval.`}
              action={<a href="/register" className="btn-primary inline-block">Go to Registration</a>}
              variant="warning"
            />
          )}

          {/* ── Already voted ── */}
          {status === "already_voted" && (
            <StatusCard
              icon="✅"
              title="You Have Already Voted"
              desc="Your vote has been recorded on the blockchain. Thank you for participating!"
              action={<a href="/results" className="btn-primary inline-block">View Results</a>}
              variant="success"
            />
          )}

          {/* ── Voting closed ── */}
          {status === "voting_closed" && (
            <StatusCard
              icon="🏁"
              title="Voting is Closed"
              desc="The election has ended. Check the results page to see the winners."
              action={<a href="/results" className="btn-primary inline-block">View Results</a>}
            />
          )}

          {/* ── Success ── */}
          {status === "success" && (
            <StatusCard
              icon="🎉"
              title="Vote Submitted Successfully!"
              desc="Your vote has been permanently recorded on the blockchain."
              variant="success"
              action={
                <div className="space-y-3 w-full">
                  {txHash && (
                    <div className="bg-gray-100 rounded-lg px-4 py-2 text-xs text-gray-500 break-all text-center">
                      <span className="font-semibold text-gray-700">Tx Hash:</span> {txHash}
                    </div>
                  )}
                  <a href="/results" className="btn-primary inline-block">View Results</a>
                </div>
              }
            />
          )}

          {/* ── Ballot ── */}
          {status === "ready" && (
            <div className="space-y-6">
              {/* Wallet badge */}
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-gray-500">Connected:</span>
                <span className="text-xs font-mono font-semibold text-au-blue">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <span className="ml-auto badge-approved">Whitelisted ✓</span>
              </div>

              {/* Skipped warning banner */}
              {skippedPositions.length > 0 && Object.keys(selections).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-yellow-700 text-sm">
                  You&apos;re preparing a partial ballot. No candidate selected for:{" "}
                  <span className="font-semibold">
                    {skippedPositions.map((p) => p.name).join(", ")}
                  </span>
                </div>
              )}

              {/* Positions */}
              {positions.map((position) => {
                const positionCandidates = candidates.filter(
                  (c) => c.positionId === position.id
                );
                return (
                  <div key={position.id} className="card">
                    <div className="card-header flex items-center justify-between">
                      <h3 className="font-heading text-lg font-bold">{position.name}</h3>
                      {selections[position.id] ? (
                        <span className="badge-approved text-xs">Selected ✓</span>
                      ) : (
                        <span className="badge-pending text-xs">Not selected</span>
                      )}
                    </div>
                    <div className="card-body grid gap-3">
                      {positionCandidates.length === 0 ? (
                        <p className="text-gray-400 text-sm">No candidates for this position.</p>
                      ) : (
                        positionCandidates.map((candidate) => (
                          <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            isSelected={selections[position.id] === candidate.id}
                            onSelect={(candidateId) => handleSelect(position.id, candidateId)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <div className="sticky bottom-4">
                <button
                  onClick={() => setStatus("reviewing")}
                  disabled={Object.keys(selections).length === 0}
                  className="btn-gold w-full text-base py-4 rounded-xl shadow-lg"
                >
                  {Object.keys(selections).length === positions.length ? "Review Ballot" : "Review Partial Ballot"} ({Object.keys(selections).length}/{positions.length} selected)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ── Status card helper ────────────────────────────────────────────────────────
function StatusCard({
  icon, title, desc, action, error, variant,
}: {
  icon: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
  error?: string;
  variant?: "success" | "warning" | "default";
}) {
  const bg = variant === "success" ? "bg-green-50 border-green-200" : variant === "warning" ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-200";
  return (
    <div className={`card border ${bg} text-center p-10 space-y-4`}>
      <div className="text-5xl">{icon}</div>
      <h2 className="font-heading text-2xl font-bold text-au-blue">{title}</h2>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">{desc}</p>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm text-left">
          {error}
        </div>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
