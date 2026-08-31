const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.business.updateMany({
    where: { slug: 'onetech-solution' },
    data: {
      category: 'IT & Software Solutions',
      bio: 'We provide custom web development, mobile apps, UI/UX design, and digital IT cloud solutions.',
      services: 'Custom Web App, Mobile App, UI/UX Design, Cloud Infrastructure, SEO & Marketing',
      positiveTags: 'Top Quality, Fast Delivery, Great Support, Professional Team, Highly Recommended',
    },
  });

  await prisma.business.updateMany({
    where: { slug: 'sharma-sweets' },
    data: {
      category: 'Restaurant & Sweets',
      bio: 'Authentic traditional Indian sweets, snacks, thali meals, and pure ghee delicacies.',
      services: 'Dine-in Meals, Traditional Sweets, Fresh Snacks, Takeaway / Catering, Desserts',
      positiveTags: 'Delicious Taste, Pure Ghee Sweets, Fast Service, Clean Ambience, Value for Money',
    },
  });

  await prisma.business.updateMany({
    where: { slug: 'royal-salon' },
    data: {
      category: 'Salon & Spa',
      bio: 'Luxury hair styling, facial treatments, bridal makeover, and relaxing body spa services.',
      services: 'Haircut & Styling, Facial & Skin Care, Hair Spa, Beard Grooming, Bridal Makeup',
      positiveTags: 'Skilled Stylists, Relaxing Ambience, Premium Products, Great Haircut, Friendly Staff',
    },
  });

  console.log('Successfully updated test businesses with distinct Services and Tags!');
}

main().finally(() => prisma.$disconnect());
