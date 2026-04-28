import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { studentId, walletAddress } = req.body;

  if (!studentId || !walletAddress) {
    return res.status(400).json({ success: false, error: "Student ID and wallet address are required" });
  }

  // Validate wallet address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ success: false, error: "Invalid wallet address format" });
  }

  // Check student exists
  const student = await prisma.student.findUnique({
    where: { studentId: String(studentId) },
    include: { registration: true },
  });

  if (!student) {
    return res.status(404).json({ success: false, error: "Student not found" });
  }

  // Check already registered
  if (student.registration) {
    return res.status(409).json({
      success: false,
      error: "This student already has a registration",
    });
  }

  // Check wallet not already used by someone else
  const existingWallet = await prisma.registration.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });

  if (existingWallet) {
    return res.status(409).json({
      success: false,
      error: "This wallet address is already registered to another student",
    });
  }

  // Create registration
  const registration = await prisma.registration.create({
    data: {
      studentId: student.studentId,
      walletAddress: walletAddress.toLowerCase(),
      status: "pending",
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      registrationId: registration.id,
      status: registration.status,
    },
  });
}
