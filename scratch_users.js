const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function manageUsers() {
  console.log('=== CURRENT USERS IN POSTGRESQL ===');
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  console.log(users);
}

manageUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
