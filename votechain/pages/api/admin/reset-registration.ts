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
    include: {
      student: {
        select: { name: true, studentId: true },
      },
    },
  });

  if (!registration) {
    return res.status(404).json({ success: false, error: "Registration not found" });
  }

  await prisma.registration.delete({
    where: { id: Number(registrationId) },
  });

  return res.status(200).json({
    success: true,
    data: {
      studentName: registration.student.name,
      studentId: registration.student.studentId,
      walletAddress: registration.walletAddress,
      previousStatus: registration.status,
    },
  });
}
