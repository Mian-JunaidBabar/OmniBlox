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

  // Step 1: Create a dummy company first
  const dummyCompany = await prisma.company.create({
    data: {
      id: 'dummy-company',
      name: 'Dummy Company',
      workspaceUrl: 'dummy',
      ownerId: 'dummy-owner',
    },
  });

  // Step 2: Create dummy owner to satisfy FK constraint
  const dummyOwner = await prisma.user.create({
    data: {
      id: 'dummy-owner',
      email: 'dummy@dummy.com',
      password: hashedPassword,
      name: 'Dummy User',
      role: 'STAFF' as any,
      companyId: dummyCompany.id,
    },
  });

  // Step 3: Create the real owner
  const realOwner = await prisma.user.create({
    data: {
      id: 'owner-1',
      email: 'owner@omniblox.com',
      password: hashedPassword,
      name: 'Owner User',
      role: 'OWNER' as any,
      companyId: dummyCompany.id, // Temporary
    },
  });

  // Step 4: Create the real company
  const company = await prisma.company.create({
    data: {
      id: 'company-1',
      name: 'Demo Company',
      workspaceUrl: 'demo-company',
      industry: 'Technology',
      country: 'United States',
      ownerId: realOwner.id,
    },
  });

  // Step 5: Update the real owner to point to the real company
  const owner = await prisma.user.update({
    where: { id: realOwner.id },
    data: { companyId: company.id },
  });

  // Step 6: Clean up dummy data
  await prisma.user.delete({ where: { id: dummyOwner.id } });
  await prisma.company.delete({ where: { id: dummyCompany.id } });

  // Now create the rest of the data
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

  // Create product categories
  const categories = await Promise.all([
    prisma.productCategory.create({
      data: { name: 'Uncategorized', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Electronics', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Accessories', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Furniture', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Office Supplies', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Food & Beverages', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Health & Beauty', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Clothing', companyId: company.id },
    }),
    prisma.productCategory.create({
      data: { name: 'Books', companyId: company.id },
    }),
  ]);

  const uncategorizedCategory = categories[0];
  const electronicsCategory = categories[1];
  const clothingCategory = categories[7];

  // Create brands
  const appleBrand = await prisma.brand.create({
    data: {
      name: 'Apple',
      companyId: company.id,
    },
  });

  const nikeBrand = await prisma.brand.create({
    data: {
      name: 'Nike',
      companyId: company.id,
    },
  });

  // Create products
  const iPhone = await prisma.product.create({
    data: {
      name: 'iPhone 15',
      sku: 'IPHONE15-001',
      description: 'Latest iPhone model',
      costPrice: 800,
      salePrice: 1000,
      reorderLevel: 10,
      categoryId: electronicsCategory.id,
      brandId: appleBrand.id,
      companyId: company.id,
    },
  });

  const nikeShoes = await prisma.product.create({
    data: {
      name: 'Nike Air Max',
      sku: 'NIKE-AIR-001',
      description: 'Comfortable running shoes',
      costPrice: 60,
      salePrice: 120,
      reorderLevel: 20,
      categoryId: clothingCategory.id,
      brandId: nikeBrand.id,
      companyId: company.id,
    },
  });

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, New York, NY',
      companyId: company.id,
    },
  });

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Tech Supplier Inc',
      email: 'contact@techsupplier.com',
      phone: '+1987654321',
      address: '456 Tech Ave, San Francisco, CA',
      companyId: company.id,
    },
  });

  // Create expense categories
  const rentCategory = await prisma.expenseCategory.create({
    data: {
      name: 'Rent',
      companyId: company.id,
    },
  });

  const utilitiesCategory = await prisma.expenseCategory.create({
    data: {
      name: 'Utilities',
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
    products: [iPhone.name, nikeShoes.name],
    categories: [electronicsCategory.name, clothingCategory.name],
    brands: [appleBrand.name, nikeBrand.name],
    customers: [customer1.name],
    suppliers: [supplier1.name],
    expenseCategories: [rentCategory.name, utilitiesCategory.name],
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
