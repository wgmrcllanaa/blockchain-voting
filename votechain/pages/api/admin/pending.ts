import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { status = "pending" } = req.query;

  const registrations = await prisma.registration.findMany({
    where: { status: String(status) },
    include: {
      student: {
        select: { name: true, studentId: true, email: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return res.status(200).json({ success: true, data: registrations });
}
