import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a test owner user
  const hashedPassword = await hash('password123', 10);

  // Check if owner already exists
  const existingOwner = await prisma.user.findUnique({
    where: { email: 'owner@omniblox.com' },
  });

  if (existingOwner) {
    console.log('Owner user already exists, skipping seed');
    return;
  }

  // Create company without owner first
  const company = await prisma.company.create({
    data: {
      id: 'company-1',
      name: 'Demo Company',
      workspaceUrl: 'demo-company',
      industry: 'Technology',
      country: 'United States',
      // ownerId will be set after creating the owner
    },
  });

  // Create owner user
  const owner = await prisma.user.create({
    data: {
      id: 'owner-1',
      email: 'owner@omniblox.com',
      password: hashedPassword,
      name: 'Owner User',
      role: 'OWNER' as any,
      companyId: company.id,
    },
  });

  // Update company to set the owner
  await prisma.company.update({
    where: { id: company.id },
    data: { ownerId: owner.id },
  });

  // Create some test users
  const manager = await prisma.user.create({
    data: {
      email: 'manager@omniblox.com',
      password: hashedPassword,
      name: 'Manager User',
      role: 'MANAGER' as any,
      companyId: company.id,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@omniblox.com',
      password: hashedPassword,
      name: 'Staff User',
      role: 'STAFF' as any,
      companyId: company.id,
    },
  });

  // Create warehouses
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Main Warehouse',
      location: 'New York, NY',
      companyId: company.id,
    },
  });

  const backupWarehouse = await prisma.warehouse.create({
    data: {
      name: 'Backup Warehouse',
      location: 'Los Angeles, CA',
      companyId: company.id,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log({
    company: company.name,
    owner: owner.email,
    manager: manager.email,
    staff: staff.email,
    warehouses: [mainWarehouse.name, backupWarehouse.name],
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
