import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectAccounts() {
  try {
    console.log('\n=== Inspecting Database ===\n');

    // Get all accounts
    const accounts = await prisma.account.findMany({
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            companyId: true,
            role: true,
          },
        },
      },
    });

    console.log(`Found ${accounts.length} account(s):\n`);

    accounts.forEach((account, index) => {
      console.log(`Account ${index + 1}:`);
      console.log(`  - User Email: ${account.user.email}`);
      console.log(`  - User ID: ${account.userId}`);
      console.log(`  - Provider ID: ${account.providerId}`);
      console.log(`  - Account ID: ${account.accountId}`);
      console.log(`  - Has Password: ${account.password ? 'Yes' : 'No'}`);
      console.log(`  - Created: ${account.createdAt}`);
      console.log('');
    });

    // Check for specific email
    const testEmail = 'testUser2@gmail.com';
    const userWithEmail = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        accounts: true,
      },
    });

    if (userWithEmail) {
      console.log(`\nUser with email ${testEmail}:`);
      console.log(`  - User ID: ${userWithEmail.id}`);
      console.log(`  - Name: ${userWithEmail.name}`);
      console.log(`  - Email Verified: ${userWithEmail.emailVerified}`);
      console.log(`  - Company ID: ${userWithEmail.companyId}`);
      console.log(`  - Role: ${userWithEmail.role}`);
      console.log(`  - Accounts (${userWithEmail.accounts.length}):`);
      userWithEmail.accounts.forEach((acc) => {
        console.log(
          `    * Provider: ${acc.providerId}, AccountID: ${acc.accountId}`,
        );
      });
    } else {
      console.log(`\nNo user found with email: ${testEmail}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectAccounts();
