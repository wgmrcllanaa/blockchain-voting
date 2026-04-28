import type { NextApiRequest, NextApiResponse } from "next";
import { clearAdminSessionCookie } from "@/lib/adminAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  res.setHeader("Set-Cookie", clearAdminSessionCookie());
  return res.status(200).json({ success: true });
}
