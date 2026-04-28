import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { fundLocalWallet } from "@/lib/localFaucet";

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

  // Update status to approved
  // Note: The actual on-chain whitelist() call is made by the admin's MetaMask in the frontend
  const updated = await prisma.registration.update({
    where: { id: Number(registrationId) },
    data: { status: "approved" },
  });

  const faucet = await fundLocalWallet(updated.walletAddress).catch((error: unknown) => ({
    funded: false,
    reason: error instanceof Error ? error.message : "Failed to fund local wallet",
  }));

  return res.status(200).json({
    success: true,
    data: {
      walletAddress: updated.walletAddress,
      status: updated.status,
      faucet,
    },
  });
}
