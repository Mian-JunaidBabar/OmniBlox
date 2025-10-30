import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('\n=== All Users in Database ===\n');

    const users = await prisma.user.findMany({
      take: 10,
      include: {
        accounts: true,
        company: true,
      },
    });

    console.log(`Total users: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Name: ${user.name}`);
      console.log(`  - ID: ${user.id}`);
      console.log(
        `  - Company: ${user.company.name} (${user.company.workspaceUrl})`,
      );
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Email Verified: ${user.emailVerified}`);
      console.log(`  - Accounts: ${user.accounts.length}`);
      user.accounts.forEach((acc) => {
        console.log(`    * Provider: ${acc.providerId}`);
        console.log(`      Account ID: ${acc.accountId}`);
        console.log(
          `      Has Password: ${acc.password ? 'Yes (' + acc.password.substring(0, 20) + '...)' : 'No'}`,
        );
      });
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();
