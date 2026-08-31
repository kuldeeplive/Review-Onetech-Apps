const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Create Super Admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: adminPasswordHash,
      role: 'SUPER_ADMIN',
    },
    create: {
      name: 'Super Admin Master',
      email: 'admin@example.com',
      password: adminPasswordHash,
      role: 'SUPER_ADMIN',
      phone: '+91 99999 00000',
    },
  });

  console.log('Super Admin created:', superAdmin.email);

  // 2. Create Business Client 1 (Restaurant)
  const client1PasswordHash = await bcrypt.hash('client123', 10);
  const client1 = await prisma.user.upsert({
    where: { email: 'sharma@example.com' },
    update: {
      password: client1PasswordHash,
    },
    create: {
      name: 'Rajesh Sharma',
      email: 'sharma@example.com',
      password: client1PasswordHash,
      role: 'BUSINESS_OWNER',
      phone: '+91 98765 43210',
    },
  });

  const business1 = await prisma.business.upsert({
    where: { slug: 'sharma-sweets' },
    update: {},
    create: {
      ownerId: client1.id,
      name: 'Sharma Sweets & Restaurant',
      slug: 'sharma-sweets',
      primaryColor: '#e11d48',
      googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
      minPositiveRating: 4,
      isActive: true,
      planName: 'Pro Annual Plan',
      planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      notificationEmail: 'sharma@example.com',
      notificationPhone: '+91 98765 43210',
      whatsappAlertEnabled: true,
      discountOfferTitle: 'Special 10% Discount Coupon',
      discountOfferCode: 'SWEET10',
      discountOfferText: 'Show this voucher code SWEET10 on your next dine-in or takeaway to get 10% off your total bill.',
      positiveMessage: 'Thank you for choosing Sharma Sweets! Please take 15 seconds to leave a 5-star Google review.',
      negativeMessage: 'We are sorry that your experience was not up to the mark. Please let our manager know what happened so we can make it right.',
    },
  });

  // Seed sample feedbacks for Business 1
  await prisma.feedback.deleteMany({ where: { businessId: business1.id } });
  await prisma.feedback.createMany({
    data: [
      {
        businessId: business1.id,
        rating: 2,
        customerName: 'Amit Patel',
        customerPhone: '+91 91234 56789',
        customerEmail: 'amit.patel@gmail.com',
        issueCategory: 'Service Speed',
        comment: 'Food was delicious, but waited over 35 minutes for main course on Sunday evening. Staff seemed overwhelmed.',
        status: 'PENDING',
      },
      {
        businessId: business1.id,
        rating: 1,
        customerName: 'Pooja Verma',
        customerPhone: '+91 98989 12345',
        customerEmail: 'pooja.v@yahoo.com',
        issueCategory: 'Food/Product Quality',
        comment: 'Gulab jamuns were cold and samosa was too oily today. Disappointed.',
        status: 'CONTACTED',
        resolutionNote: 'Manager called customer, offered free fresh box of sweets on next visit.',
      },
      {
        businessId: business1.id,
        rating: 3,
        customerName: 'Karan Mehra',
        customerPhone: '+91 97777 88888',
        customerEmail: 'karan.m@outlook.com',
        issueCategory: 'Pricing',
        comment: 'Taste is good, but prices have increased by 20% recently without extra portion size.',
        status: 'RESOLVED',
        resolutionNote: 'Explained new premium ghee ingredients used.',
      },
    ],
  });

  // 3. Create Business Client 2 (Salon & Spa) with 5-star threshold
  const client2PasswordHash = await bcrypt.hash('client123', 10);
  const client2 = await prisma.user.upsert({
    where: { email: 'royal@example.com' },
    update: {
      password: client2PasswordHash,
    },
    create: {
      name: 'Vikram Malhotra',
      email: 'royal@example.com',
      password: client2PasswordHash,
      role: 'BUSINESS_OWNER',
      phone: '+91 98111 22233',
    },
  });

  const business2 = await prisma.business.upsert({
    where: { slug: 'royal-salon' },
    update: {},
    create: {
      ownerId: client2.id,
      name: 'Royal Touch Unisex Salon & Spa',
      slug: 'royal-salon',
      primaryColor: '#7c3aed',
      googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJLfySpTOuEmsRsc_avJ0hP44',
      minPositiveRating: 5, // Strict 5-star threshold
      isActive: true,
      planName: 'Starter Monthly Plan',
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notificationEmail: 'royal@example.com',
      notificationPhone: '+91 98111 22233',
      whatsappAlertEnabled: true,
      discountOfferTitle: 'Free Hair Spa Upgrade Coupon',
      discountOfferCode: 'ROYALSPA',
      discountOfferText: 'We value your honest feedback! Enjoy a complimentary hair spa with your next haircut.',
    },
  });

  // Sample analytics records
  await prisma.scanAnalytics.createMany({
    data: [
      { businessId: business1.id, ratingSelected: 5, action: 'REDIRECTED_GOOGLE' },
      { businessId: business1.id, ratingSelected: 5, action: 'REDIRECTED_GOOGLE' },
      { businessId: business1.id, ratingSelected: 4, action: 'REDIRECTED_GOOGLE' },
      { businessId: business1.id, ratingSelected: 2, action: 'SUBMITTED_FEEDBACK' },
      { businessId: business1.id, action: 'PAGE_VIEW' },
      { businessId: business2.id, ratingSelected: 5, action: 'REDIRECTED_GOOGLE' },
      { businessId: business2.id, ratingSelected: 3, action: 'SUBMITTED_FEEDBACK' },
    ],
  });

  console.log('Seeding completed successfully!');
  console.log('--- Credentials ---');
  console.log('Super Admin: admin@example.com / admin123');
  console.log('Client 1 (Restaurant): sharma@example.com / client123 (Slug: sharma-sweets, threshold: 4)');
  console.log('Client 2 (Salon): royal@example.com / client123 (Slug: royal-salon, threshold: 5)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
