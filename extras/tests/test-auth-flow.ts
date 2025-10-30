import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();

async function testBetterAuthFlow() {
  const testEmail = 'testdirect@example.com';
  const testPassword = 'Test@12345';

  try {
    console.log('\n=== Testing Better Auth Flow ===\n');

    // 1. Create user manually (simulating signup)
    console.log('1. Creating user...');
    const hashedPassword = await hashPassword(testPassword);

    const company = await prisma.company.create({
      data: {
        name: 'Test Direct Company',
        workspaceUrl: `test-direct-${Date.now()}`,
        industry: 'Technology',
        country: 'US',
      },
    });

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test Direct User',
        role: 'OWNER',
        companyId: company.id,
        emailVerified: false,
      },
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id, // Must match userId for credential provider
        providerId: 'credential', // Must be 'credential' for email/password
        password: hashedPassword,
      },
    });

    console.log('✓ User created:', user.email);
    console.log('✓ Account created with providerId:', account.providerId);

    // 2. Verify the account can be found
    console.log('\n2. Verifying account lookup...');
    const foundAccount = await prisma.account.findFirst({
      where: {
        providerId: 'credential',
        user: {
          email: testEmail,
        },
      },
      include: {
        user: true,
      },
    });

    if (foundAccount) {
      console.log('✓ Account found via lookup');
      console.log('  - User Email:', foundAccount.user.email);
      console.log('  - Provider ID:', foundAccount.providerId);
      console.log('  - Account ID:', foundAccount.accountId);
    } else {
      console.log('✗ Account NOT found via lookup');
    }

    // 3. Verify password
    console.log('\n3. Testing password verification...');
    const isValid = await verifyPassword({
      password: testPassword,
      hash: foundAccount!.password!,
    });
    console.log('✓ Password verification:', isValid ? 'PASSED' : 'FAILED');

    // 4. Test what Better Auth would do
    console.log('\n4. Simulating Better Auth lookup...');
    const userByEmail = await prisma.user.findUnique({
      where: { email: testEmail },
      include: {
        accounts: {
          where: {
            providerId: 'credential',
          },
        },
      },
    });

    if (userByEmail && userByEmail.accounts.length > 0) {
      console.log('✓ User found with credential account');
      console.log('  - User ID:', userByEmail.id);
      console.log('  - Account ID:', userByEmail.accounts[0].accountId);
      console.log(
        '  - Match:',
        userByEmail.id === userByEmail.accounts[0].accountId ? 'YES' : 'NO',
      );
    } else {
      console.log('✗ User not found or no credential account');
    }

    console.log('\n=== All checks passed! ===\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBetterAuthFlow();
