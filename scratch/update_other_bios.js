const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.business.updateMany({
    where: { slug: 'sharma-sweets' },
    data: {
      category: 'Restaurant & Sweets',
      bio: 'Authentic traditional Indian sweets, fresh snacks, thali meals, and pure ghee delicacies.',
    },
  });

  await prisma.business.updateMany({
    where: { slug: 'royal-salon' },
    data: {
      category: 'Salon & Spa',
      bio: 'Luxury hair styling, facial treatments, bridal makeover, and relaxing body spa services.',
    },
  });
  console.log('Updated Sharma Sweets & Royal Salon with category and bio!');
}

main().finally(() => prisma.$disconnect());
