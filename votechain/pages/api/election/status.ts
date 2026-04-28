import type { NextApiRequest, NextApiResponse } from "next";
import { getReadOnlyContract } from "@/lib/contract";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const contract = getReadOnlyContract();
    const isOpen = await contract.votingOpen();
    return res.status(200).json({ success: true, data: { votingOpen: isOpen } });
  } catch {
    return res.status(500).json({ success: false, error: "Failed to read contract state" });
  }
}
