import Head from "next/head";
import Navbar from "@/components/Navbar";

interface AdminLoginProps {
  username: string;
  password: string;
  loginError: string;
  loginLoading: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
}

export default function AdminLogin({
  username,
  password,
  loginError,
  loginLoading,
  onUsernameChange,
  onPasswordChange,
  onLogin,
}: AdminLoginProps) {
  return (
    <>
      <Head><title>Admin Login — VoteChain</title></Head>
      <Navbar />
      <main className="min-h-screen bg-[#F7F8FB] flex items-center justify-center px-4">
        <div className="card w-full max-w-sm">
          <div className="card-header">
            <h2 className="font-heading text-xl font-bold">Admin Login</h2>
            <p className="text-blue-200 text-xs mt-0.5">ACOMSS VoteChain Administration</p>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onLogin()}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onLogin()}
              />
            </div>
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">
                {loginError}
              </div>
            )}
            <button onClick={onLogin} disabled={loginLoading} className="btn-primary w-full">
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
