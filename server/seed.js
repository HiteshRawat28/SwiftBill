const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'admin@swiftbill.com', password: 'password123', role: 'Admin' },
    { email: 'accountant@swiftbill.com', password: 'password123', role: 'Accountant' },
    { email: 'viewer@swiftbill.com', password: 'password123', role: 'Viewer' }
  ];

  for (const u of users) {
    const existingUser = await prisma.user.findUnique({ where: { email: u.email } });
    
    if (existingUser) {
      console.log(`User ${u.email} already exists.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(u.password, 10);
    await prisma.user.create({
      data: {
        email: u.email,
        password: hashedPassword,
        role: u.role
      }
    });

    console.log(`Created test user: ${u.email} (${u.role})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
