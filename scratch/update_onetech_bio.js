const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany();
  console.log(`Found ${businesses.length} businesses:`);
  for (const b of businesses) {
    console.log(`- ${b.name} (${b.slug})`);
    if (b.slug.includes('onetech') || b.name.toLowerCase().includes('onetech')) {
      const updated = await prisma.business.update({
        where: { id: b.id },
        data: {
          category: 'IT & Software Solutions',
          bio: 'We provide custom web development, mobile app development, UI/UX design, and digital IT cloud solutions for businesses.',
        },
      });
      console.log(`Updated ${b.name} with category: ${updated.category}, bio: ${updated.bio}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
