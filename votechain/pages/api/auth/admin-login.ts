import type { NextApiRequest, NextApiResponse } from "next";
import { createAdminSessionCookie } from "@/lib/adminAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Username and password required" });
  }

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (username === validUsername && password === validPassword) {
    res.setHeader("Set-Cookie", createAdminSessionCookie(username));
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ success: false, error: "Invalid credentials" });
}
