import type { NextApiRequest, NextApiResponse } from "next";
import { getReadOnlyContract } from "@/lib/contract";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const contract = getReadOnlyContract();
    const [positions, candidates] = await Promise.all([
      contract.getPositions(),
      contract.getCandidates(),
    ]);

    // Serialize bigints to strings for JSON
    const positionsUI = positions.map((p: { id: bigint; name: string }) => ({
      id: p.id.toString(),
      name: p.name,
    }));

    const candidatesUI = candidates.map((c: { id: bigint; name: string; positionId: bigint; voteCount: bigint }) => ({
      id: c.id.toString(),
      name: c.name,
      positionId: c.positionId.toString(),
      voteCount: Number(c.voteCount),
    }));

    return res.status(200).json({
      success: true,
      data: { positions: positionsUI, candidates: candidatesUI },
    });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to read contract" });
  }
}
