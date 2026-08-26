const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Admin User
  const adminEmail = 'admin@swiftbill.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin'
      }
    });
    console.log(`Created admin user: ${adminEmail} / admin123`);
  } else {
    console.log(`Admin user ${adminEmail} already exists.`);
  }

  // 2. Create Lookups (Categories and Units)
  const categories = ['Electronics', 'Furniture', 'Stationery', 'Clothing'];
  for (const cat of categories) {
    const existing = await prisma.category.findFirst({ where: { name: cat } });
    if (!existing) {
      await prisma.category.create({ data: { name: cat } });
      console.log(`Created Category: ${cat}`);
    }
  }

  const units = ['Pieces', 'Box', 'Kg', 'Meters'];
  for (const unit of units) {
    const existing = await prisma.unit.findFirst({ where: { name: unit } });
    if (!existing) {
      await prisma.unit.create({ data: { name: unit } });
      console.log(`Created Unit: ${unit}`);
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
