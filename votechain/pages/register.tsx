import { useState } from "react";
import Head from "next/head";
import axios from "axios";
import Navbar from "@/components/Navbar";
import StepBar from "@/components/StepBar";
import AppIcon from "@/components/AppIcon";
import { connectWallet } from "@/lib/contract";

const STEPS = [
  { label: "Verify Identity", description: "Enter your student credentials" },
  { label: "Connect Wallet", description: "Link your MetaMask wallet" },
  { label: "Confirm", description: "Submit your registration" },
  { label: "Done", description: "Await admin approval" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 0 form
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [verifiedStudent, setVerifiedStudent] = useState<{ name: string; studentId: string } | null>(null);

  // Step 1
  const [walletAddress, setWalletAddress] = useState("");

  const clearError = () => setError("");

  // ── Step 0: Verify student identity ───────────────────────────
  const handleVerify = async () => {
    clearError();
    if (!studentId.trim() || !email.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/students/verify", { studentId, email });
      setVerifiedStudent(data.data);
      setStep(1);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Verification failed.";
      setError(msg || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: Connect MetaMask ───────────────────────────────────
  const handleConnectWallet = async () => {
    clearError();
    setLoading(true);
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Submit registration ────────────────────────────────
  const handleSubmit = async () => {
    clearError();
    setLoading(true);
    try {
      await axios.post("/api/students/register", {
        studentId: verifiedStudent?.studentId,
        walletAddress,
      });
      setStep(3);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : "Registration failed.";
      setError(msg || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register — VoteChain</title>
      </Head>
      <Navbar />

      <main className="min-h-screen bg-[#F7F8FB] py-10 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold text-au-blue">Voter Registration</h1>
            <p className="text-gray-500 mt-2 text-sm">ACOMSS 2026–2027 Elections</p>
          </div>

          {/* Step bar */}
          <StepBar steps={STEPS} currentStep={step} />

          {/* Card */}
          <div className="card mt-6">
            <div className="card-header">
              <h2 className="font-heading text-xl font-bold">{STEPS[step]?.label}</h2>
              <p className="text-blue-200 text-xs mt-0.5">{STEPS[step]?.description}</p>
            </div>
            <div className="card-body">

              {/* ── STEP 0: Identity verification ── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Student ID
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 202215505"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Adamson Email
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="youremail@adamson.edu.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    />
                    <p className="text-xs text-gray-400 mt-1">Only @adamson.edu.ph emails are accepted.</p>
                  </div>

                  {error && <ErrorBox message={error} />}

                  <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? "Verifying..." : "Verify Identity →"}
                  </button>
                </div>
              )}

              {/* ── STEP 1: Connect wallet ── */}
              {step === 1 && verifiedStudent && (
                <div className="space-y-5">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-800 font-semibold text-sm">{verifiedStudent.name}</p>
                      <p className="text-green-600 text-xs">Student ID: {verifiedStudent.studentId}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-700 text-sm">
                    <p className="font-semibold mb-1 flex items-center gap-2">
                      <AppIcon name="metamask" className="h-5 w-5 text-au-blue" />
                      Connect your MetaMask wallet
                    </p>
                    <p className="text-xs text-blue-500">
                      Make sure MetaMask is installed and you are connected to the{" "}
                      <strong>Hardhat localhost network</strong> (Chain ID: 31337).
                    </p>
                  </div>

                  {error && <ErrorBox message={error} />}

                  <button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className="btn-gold w-full"
                  >
                    {loading ? (
                      "Connecting..."
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2">
                        <AppIcon name="metamask" className="h-5 w-5 text-au-blue-dark" />
                        Connect MetaMask
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* ── STEP 2: Confirm submission ── */}
              {step === 2 && verifiedStudent && (
                <div className="space-y-5">
                  <p className="text-gray-600 text-sm">Please confirm the following details before submitting:</p>

                  <div className="space-y-2">
                    <InfoRow label="Name" value={verifiedStudent.name} />
                    <InfoRow label="Student ID" value={verifiedStudent.studentId} />
                    <InfoRow
                      label="Wallet"
                      value={`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                    />
                    <InfoRow label="Status after submit" value="Pending Admin Approval" highlight />
                  </div>

                  {error && <ErrorBox message={error} />}

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setStep(1); clearError(); }}
                      className="btn-outline flex-1"
                      disabled={loading}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn-primary flex-1"
                    >
                      {loading ? "Submitting..." : "Submit Registration"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Done ── */}
              {step === 3 && (
                <div className="text-center space-y-5 py-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-au-blue">Registration Submitted!</h3>
                    <p className="text-gray-500 text-sm mt-2">
                      Your wallet has been submitted for approval. The admin will review your registration
                      shortly. Return to the voting page once your status is approved.
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-left text-xs text-gray-500 space-y-1">
                    <p><span className="font-semibold">Name:</span> {verifiedStudent?.name}</p>
                    <p><span className="font-semibold">Wallet:</span> {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}</p>
                    <p><span className="font-semibold">Status:</span> <span className="badge-pending">Pending</span></p>
                  </div>
                  <a href="/" className="btn-primary inline-block">
                    Back to Home
                  </a>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
      <AppIcon name="warning" className="mr-2 h-4 w-4 align-[-2px] text-red-600" />
      {message}
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-au-gold" : "text-au-blue"}`}>
        {value}
      </span>
    </div>
  );
}
