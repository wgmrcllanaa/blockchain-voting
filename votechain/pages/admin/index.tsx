import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import axios from "axios";
import Navbar from "@/components/Navbar";
import AdminLogin from "@/components/admin/AdminLogin";
import { ADMIN_ADDRESS, getAdminSignerContract, connectWallet } from "@/lib/contract";
import { PendingRegistration } from "@/types";

type Tab = "pending" | "students" | "positions" | "candidates" | "election" | "results";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    setLoginError("");
    setLoginLoading(true);
    try {
      await axios.post("/api/auth/admin-login", { username, password });
      setAuthed(true);
    } catch {
      setLoginError("Invalid username or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await axios.post("/api/auth/admin-logout");
    setAuthed(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get("/api/auth/admin-status");
        setAuthed(Boolean(data.data.authenticated));
      } catch {
        setAuthed(false);
      }
    };
    checkAuth();
  }, []);

  if (authed === null) {
    return (
      <>
        <Head><title>Admin Login — VoteChain</title></Head>
        <Navbar />
        <main className="min-h-screen bg-[#F7F8FB] flex items-center justify-center px-4">
          <div className="card p-8 text-center text-gray-500 text-sm">Checking admin session...</div>
        </main>
      </>
    );
  }

  if (!authed) {
    return (
      <AdminLogin
        username={username}
        password={password}
        loginError={loginError}
        loginLoading={loginLoading}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
      />
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [adminWallet, setAdminWallet] = useState("");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "pending", label: "Pending", icon: "⏳" },
    { id: "students", label: "Students", icon: "🎓" },
    { id: "positions", label: "Positions", icon: "📋" },
    { id: "candidates", label: "Candidates", icon: "👤" },
    { id: "election", label: "Election", icon: "🗳️" },
    { id: "results", label: "Results", icon: "📊" },
  ];

  const handleConnectAdminWallet = async () => {
    try {
      const address = await connectWallet();
      if (ADMIN_ADDRESS && address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
        alert(`Wrong wallet. Switch MetaMask to the admin wallet ${ADMIN_ADDRESS.slice(0, 6)}...${ADMIN_ADDRESS.slice(-4)}.`);
        return;
      }
      setAdminWallet(address);
    } catch {
      alert("Failed to connect MetaMask.");
    }
  };

  return (
    <>
      <Head><title>Admin Panel — VoteChain</title></Head>
      <Navbar />
      <main className="min-h-screen bg-[#F7F8FB]">
        {/* Admin header */}
        <div className="bg-au-blue-dark border-b-4 border-au-gold px-6 py-4">
          <div className="max-w-5xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-blue-300 text-xs">ACOMSS 2026–2027 Elections</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!adminWallet ? (
                <button onClick={handleConnectAdminWallet} className="btn-gold text-sm py-2 px-4">
                  Connect Admin Wallet
                </button>
              ) : (
                <div className="bg-white/10 rounded-lg px-3 py-1.5 text-xs text-au-gold font-mono">
                  {adminWallet.slice(0, 6)}...{adminWallet.slice(-4)}
                </div>
              )}
              <button onClick={onLogout} className="text-blue-300 hover:text-white text-sm transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-au-blue text-white shadow"
                    : "text-gray-500 hover:text-au-blue hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "pending" && <PendingTab adminWallet={adminWallet} />}
          {activeTab === "students" && <StudentsTab />}
          {activeTab === "positions" && <PositionsTab adminWallet={adminWallet} />}
          {activeTab === "candidates" && <CandidatesTab adminWallet={adminWallet} />}
          {activeTab === "election" && <ElectionTab adminWallet={adminWallet} />}
          {activeTab === "results" && <ResultsTab />}
        </div>
      </main>
    </>
  );
}

// ─── Pending Tab ──────────────────────────────────────────────────────────────
function PendingTab({ adminWallet }: { adminWallet: string }) {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [notice, setNotice] = useState("");

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/pending?status=${filter}`);
      setRegistrations(data.data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const handleApprove = async (reg: PendingRegistration) => {
    if (!adminWallet) { alert("Please connect your admin wallet first."); return; }
    setActionLoading(reg.id);
    setNotice("");
    try {
      // 1. Whitelist on-chain via admin MetaMask
      const contract = await getAdminSignerContract();
      const alreadyWhitelisted = await contract.isWhitelisted(reg.walletAddress);
      if (!alreadyWhitelisted) {
        const tx = await contract.whitelist(reg.walletAddress);
        await tx.wait();
      }

      // 2. Update DB
      const { data } = await axios.post("/api/admin/approve", { registrationId: reg.id });
      const faucet = data.data?.faucet;
      if (faucet?.funded) {
        const chainStatus = alreadyWhitelisted ? "Wallet was already whitelisted. " : "";
        setNotice(`${chainStatus}Approved and funded ${reg.student.name}'s wallet with ${faucet.amountEth} fake Hardhat ETH.`);
      }
      await fetchRegistrations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to approve.";
      alert(msg.includes("user rejected") ? "Transaction rejected." : `Error: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reg: PendingRegistration) => {
    const confirmed = window.confirm(
      `Reject ${reg.student.name}'s registration?\n\nStudent ID: ${reg.student.studentId}\nWallet: ${reg.walletAddress}\n\nThey will not be able to vote with this registration.`
    );
    if (!confirmed) return;

    setActionLoading(reg.id);
    try {
      await axios.post("/api/admin/reject", { registrationId: reg.id });
      await fetchRegistrations();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Registrations</h2>
        <div className="flex gap-1">
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${filter === s ? "bg-au-gold text-au-blue-dark" : "text-blue-200 hover:bg-white/10"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body">
        {notice && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm mb-4">
            {notice}
          </div>
        )}
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
        ) : registrations.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No {filter} registrations.</p>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div key={reg.id} className="border border-gray-200 rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-au-blue text-sm">{reg.student.name}</p>
                  <p className="text-gray-500 text-xs">ID: {reg.student.studentId}</p>
                  <p className="text-gray-400 text-xs font-mono mt-0.5">{reg.walletAddress.slice(0, 10)}...{reg.walletAddress.slice(-6)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {reg.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(reg)}
                        disabled={actionLoading === reg.id}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        {actionLoading === reg.id ? "..." : "✓ Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(reg)}
                        disabled={actionLoading === reg.id}
                        className="bg-red-50 border border-red-300 text-red-600 text-xs py-1.5 px-3 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {reg.status === "approved" && <span className="badge-approved">Approved</span>}
                  {reg.status === "rejected" && <span className="badge-rejected">Rejected</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Students Tab ─────────────────────────────────────────────────────────────
function StudentsTab() {
  const [students, setStudents] = useState<{ id: number; studentId: string; name: string; email: string; registration: { status: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/students/list");
      setStudents(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleAdd = async () => {
    setAddError("");
    if (!newId || !newName || !newEmail) { setAddError("All fields required."); return; }
    setAddLoading(true);
    try {
      await axios.post("/api/admin/students/list", { studentId: newId, name: newName, email: newEmail });
      setNewId(""); setNewName(""); setNewEmail("");
      await fetchStudents();
    } catch (err: unknown) {
      setAddError(axios.isAxiosError(err) ? err.response?.data?.error : "Failed to add student.");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add student */}
      <div className="card">
        <div className="card-header"><h2 className="font-heading text-xl font-bold">Add Student</h2></div>
        <div className="card-body space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <input className="input-field" placeholder="Student ID" value={newId} onChange={(e) => setNewId(e.target.value)} />
            <input className="input-field" placeholder="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className="input-field" placeholder="email@adamson.edu.ph" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          {addError && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">⚠️ {addError}</div>}
          <button onClick={handleAdd} disabled={addLoading} className="btn-primary text-sm">
            {addLoading ? "Adding..." : "+ Add Student"}
          </button>
        </div>
      </div>

      {/* Student list */}
      <div className="card">
        <div className="card-header"><h2 className="font-heading text-xl font-bold">All Students ({students.length})</h2></div>
        <div className="card-body">
          {loading ? <p className="text-gray-400 text-sm text-center py-4">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-200">
                    <th className="pb-2 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="pb-2 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="pb-2 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Email</th>
                    <th className="pb-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s) => (
                    <tr key={s.id} className="py-2">
                      <td className="py-2.5 font-medium text-au-blue">{s.name}</td>
                      <td className="py-2.5 text-gray-500 font-mono text-xs">{s.studentId}</td>
                      <td className="py-2.5 text-gray-400 text-xs hidden sm:table-cell">{s.email}</td>
                      <td className="py-2.5">
                        {s.registration ? (
                          <span className={s.registration.status === "approved" ? "badge-approved" : s.registration.status === "rejected" ? "badge-rejected" : "badge-pending"}>
                            {s.registration.status}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">Not registered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Positions Tab ────────────────────────────────────────────────────────────
function PositionsTab({ adminWallet }: { adminWallet: string }) {
  const [positions, setPositions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/positions");
      setPositions(data.data.positions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPositions(); }, []);

  const requireWallet = () => { if (!adminWallet) { alert("Connect admin wallet first."); return false; } return true; };

  const handleAdd = async () => {
    if (!requireWallet() || !newName.trim()) return;
    setActionLoading(true);
    try {
      const contract = await getAdminSignerContract();
      const tx = await contract.addPosition(newName.trim());
      await tx.wait();
      setNewName("");
      await fetchPositions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to add position.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!requireWallet()) return;
    if (!confirm("Remove this position? This can affect the ballot structure and cannot be undone on-chain.")) return;
    setActionLoading(true);
    try {
      const contract = await getAdminSignerContract();
      const tx = await contract.removePosition(BigInt(id));
      await tx.wait();
      await fetchPositions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to remove position.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header"><h2 className="font-heading text-xl font-bold">Positions</h2></div>
      <div className="card-body space-y-4">
        <div className="flex gap-2">
          <input className="input-field" placeholder="Position name (e.g. President)" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <button onClick={handleAdd} disabled={actionLoading} className="btn-primary text-sm whitespace-nowrap">
            {actionLoading ? "..." : "+ Add"}
          </button>
        </div>
        {loading ? <p className="text-gray-400 text-sm text-center py-4">Loading...</p> : (
          <div className="space-y-2">
            {positions.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No positions yet.</p>}
            {positions.map((pos) => (
              <div key={pos.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-au-blue text-sm">{pos.name}</span>
                <button onClick={() => handleRemove(pos.id)} className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Candidates Tab ───────────────────────────────────────────────────────────
function CandidatesTab({ adminWallet }: { adminWallet: string }) {
  const [positions, setPositions] = useState<{ id: string; name: string }[]>([]);
  const [candidates, setCandidates] = useState<{ id: string; name: string; positionId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newPositionId, setNewPositionId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/positions");
      setPositions(data.data.positions);
      setCandidates(data.data.candidates);
      if (data.data.positions.length > 0 && !newPositionId) {
        setNewPositionId(data.data.positions[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const requireWallet = () => { if (!adminWallet) { alert("Connect admin wallet first."); return false; } return true; };

  const handleAdd = async () => {
    if (!requireWallet() || !newName.trim() || !newPositionId) return;
    setActionLoading(true);
    try {
      const contract = await getAdminSignerContract();
      const tx = await contract.addCandidate(newName.trim(), BigInt(newPositionId));
      await tx.wait();
      setNewName("");
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to add candidate.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!requireWallet()) return;
    if (!confirm("Remove this candidate? This can affect the ballot and cannot be undone on-chain.")) return;
    setActionLoading(true);
    try {
      const contract = await getAdminSignerContract();
      const tx = await contract.removeCandidate(BigInt(id));
      await tx.wait();
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to remove candidate.");
    } finally {
      setActionLoading(false);
    }
  };

  const getPositionName = (id: string) => positions.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="card">
      <div className="card-header"><h2 className="font-heading text-xl font-bold">Candidates</h2></div>
      <div className="card-body space-y-4">
        <div className="flex gap-2 flex-wrap">
          <select className="input-field flex-1" value={newPositionId} onChange={(e) => setNewPositionId(e.target.value)}>
            {positions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="input-field flex-1" placeholder="Candidate name" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <button onClick={handleAdd} disabled={actionLoading} className="btn-primary text-sm whitespace-nowrap">
            {actionLoading ? "..." : "+ Add"}
          </button>
        </div>
        {loading ? <p className="text-gray-400 text-sm text-center py-4">Loading...</p> : (
          <div className="space-y-1">
            {candidates.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No candidates yet.</p>}
            {candidates.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <span className="font-medium text-au-blue text-sm">{c.name}</span>
                  <span className="ml-2 text-gray-400 text-xs">— {getPositionName(c.positionId)}</span>
                </div>
                <button onClick={() => handleRemove(c.id)} className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Election Tab ─────────────────────────────────────────────────────────────
function ElectionTab({ adminWallet }: { adminWallet: string }) {
  const [votingOpen, setVotingOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get("/api/election/status");
      setVotingOpen(data.data.votingOpen);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const requireWallet = () => { if (!adminWallet) { alert("Connect admin wallet first."); return false; } return true; };

  const handleOpen = async () => {
    if (!requireWallet()) return;
    if (!confirm("Open voting now? Students will be able to cast votes, and positions/candidates should be treated as locked.")) return;
    setActionLoading(true);
    try {
      const contract = await getAdminSignerContract();
      const tx = await contract.openVoting();
      await tx.wait();
      await fetchStatus();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to open voting.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!requireWallet()) return;
    if (!confirm("Close voting now? Students will no longer be able to vote, and results will become public.")) return;
    setActionLoading(true);
    try {
      const contract = await getAdminSignerContract();
      const tx = await contract.closeVoting();
      await tx.wait();
      await fetchStatus();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to close voting.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header"><h2 className="font-heading text-xl font-bold">Election Control</h2></div>
      <div className="card-body space-y-6">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
        ) : (
          <>
            <div className={`rounded-xl px-6 py-5 text-center border-2 ${votingOpen ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
              <div className="text-4xl mb-2">{votingOpen ? "🟢" : "🔴"}</div>
              <p className="font-heading text-2xl font-bold text-au-blue">
                Voting is {votingOpen ? "OPEN" : "CLOSED"}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {votingOpen ? "Students can currently cast their votes." : "Voting has not started or has ended."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="font-semibold text-au-blue mb-1 text-sm">Open Voting</h3>
                <p className="text-gray-500 text-xs mb-4">Allows whitelisted students to start casting votes. Positions and candidates will be locked.</p>
                <button onClick={handleOpen} disabled={!!votingOpen || actionLoading} className="btn-primary w-full text-sm">
                  {actionLoading ? "Processing..." : "Open Voting"}
                </button>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <h3 className="font-semibold text-red-700 mb-1 text-sm">Close Voting</h3>
                <p className="text-gray-500 text-xs mb-4">Ends the election. Results will be visible to everyone on the results page.</p>
                <button onClick={handleClose} disabled={!votingOpen || actionLoading} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg w-full text-sm disabled:opacity-50 transition-colors">
                  {actionLoading ? "Processing..." : "Close Voting"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Results Tab (admin always sees results) ──────────────────────────────────
function ResultsTab() {
  const [data, setData] = useState<{ positions: { id: string; name: string }[]; results: { id: string; name: string; positionId: string; voteCount: number }[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Try results endpoint first (only works when closed)
        const { data: r } = await axios.get("/api/results");
        setData(r.data);
      } catch {
        // If voting is open, just show a message
        setError("Results are only available after voting is closed.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="card">
      <div className="card-header"><h2 className="font-heading text-xl font-bold">Results</h2></div>
      <div className="card-body">
        {loading && <p className="text-gray-400 text-sm text-center py-6">Loading...</p>}
        {error && <p className="text-gray-400 text-sm text-center py-6">{error}</p>}
        {data && data.positions.map((pos) => {
          const candidates = data.results.filter((c) => c.positionId === pos.id);
          const total = candidates.reduce((s, c) => s + c.voteCount, 0);
          const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
          return (
            <div key={pos.id} className="mb-6">
              <h3 className="font-semibold text-au-blue text-sm mb-3 border-b border-gray-100 pb-2">{pos.name}</h3>
              <div className="space-y-2">
                {sorted.map((c, i) => {
                  const pct = total > 0 ? Math.round((c.voteCount / total) * 100) : 0;
                  return (
                    <div key={c.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`font-medium ${i === 0 && total > 0 ? "text-au-blue font-bold" : "text-gray-600"}`}>
                          {i === 0 && total > 0 && "🏆 "}{c.name}
                        </span>
                        <span className="text-gray-500">{c.voteCount} votes ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${i === 0 && total > 0 ? "bg-au-gold" : "bg-au-blue/30"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
