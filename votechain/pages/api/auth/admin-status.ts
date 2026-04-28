import type { NextApiRequest, NextApiResponse } from "next";
import { isAdminRequest } from "@/lib/adminAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  return res.status(200).json({
    success: true,
    data: { authenticated: isAdminRequest(req) },
  });
}
