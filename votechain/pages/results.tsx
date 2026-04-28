import { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import Navbar from "@/components/Navbar";
import ResultsCard from "@/components/ResultsCard";
import { PositionUI, CandidateUI } from "@/types";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [positions, setPositions] = useState<PositionUI[]>([]);
  const [results, setResults] = useState<CandidateUI[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await axios.get("/api/results");
        setPositions(data.data.positions);
        setResults(data.data.results);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || "Failed to load results.");
        } else {
          setError("Failed to load results.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <>
      <Head>
        <title>Results — VoteChain</title>
      </Head>
      <Navbar />

      <main className="min-h-screen bg-[#F7F8FB] py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold text-au-blue">Election Results</h1>
            <p className="text-gray-500 mt-2 text-sm">ACOMSS 2026–2027 Elections</p>
          </div>

          {loading && (
            <div className="card p-10 text-center">
              <div className="flex justify-center mb-4">
                <svg className="animate-spin w-8 h-8 text-au-blue" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Loading results from blockchain...</p>
            </div>
          )}

          {!loading && error && (
            <div className="card p-10 text-center space-y-4">
              <div className="text-5xl">🏁</div>
              <h2 className="font-heading text-2xl font-bold text-au-blue">Results Not Available</h2>
              <p className="text-gray-500 text-sm">{error}</p>
              <p className="text-gray-400 text-xs">
                Results are only visible after the admin closes voting.
              </p>
            </div>
          )}

          {!loading && !error && positions.length > 0 && (
            <div className="space-y-5">
              <div className="bg-au-blue text-white rounded-xl px-5 py-4 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-semibold text-sm">Official Election Results</p>
                  <p className="text-blue-200 text-xs">
                    Results are final and verified on-chain.
                  </p>
                </div>
              </div>

              {positions.map((position) => {
                const positionCandidates = results.filter(
                  (c) => c.positionId === position.id
                );
                return (
                  <ResultsCard
                    key={position.id}
                    positionName={position.name}
                    candidates={positionCandidates}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
