const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.systemSetting.findFirst();
  console.log('System Setting:', settings);
}

main().finally(() => prisma.$disconnect());
