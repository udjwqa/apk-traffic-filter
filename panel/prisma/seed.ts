import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcryptjs.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@panel.local" },
    update: {},
    create: {
      email: "admin@panel.local",
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Seeded admin user: admin@panel.local / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
