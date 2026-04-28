import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Students ───────────────────────────────────────────────
  const students = [
    {
      studentId: "202215505",
      name: "Willyn Grace Marcellana",
      email: "willyn.grace.marcellana@adamson.edu.ph",
    },
    {
      studentId: "202213764",
      name: "Constante Dizon II",
      email: "constante.dizon.ii@adamson.edu.ph",
    },
  ];

  for (const student of students) {
    await prisma.student.upsert({
      where: { studentId: student.studentId },
      update: {},
      create: student,
    });
    console.log(`  ✅ Student: ${student.name} (${student.studentId})`);
  }

  console.log("\n✅ Seed complete.");
  console.log("\n📋 NOTE: Positions and candidates are managed by the admin");
  console.log("   through the admin panel or by calling the smart contract.");
  console.log("\n   Default positions to add via admin panel:");
  const positions = [
    "AUSG Representative",
    "President",
    "VP Internal",
    "VP External",
    "Secretary",
    "Treasurer",
    "Auditor",
    "P.R.O",
  ];
  positions.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
