import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { registrationId } = req.body;

  if (!registrationId) {
    return res.status(400).json({ success: false, error: "Registration ID required" });
  }

  const registration = await prisma.registration.findUnique({
    where: { id: Number(registrationId) },
  });

  if (!registration) {
    return res.status(404).json({ success: false, error: "Registration not found" });
  }

  if (registration.status !== "pending") {
    return res.status(409).json({
      success: false,
      error: `Registration is already ${registration.status}`,
    });
  }

  await prisma.registration.update({
    where: { id: Number(registrationId) },
    data: { status: "rejected" },
  });

  return res.status(200).json({ success: true });
}
