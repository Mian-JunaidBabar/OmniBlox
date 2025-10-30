async function testCompleteSignupFlow() {
  const baseUrl = 'http://localhost:5000';
  const timestamp = Date.now();
  const testEmail = `newuser.${timestamp}@example.com`;
  const testPassword = 'Test@12345';

  console.log('\n=== Testing Complete Signup + Login Flow ===\n');

  try {
    // 1. Signup
    console.log('1. Testing Signup...');
    console.log('   Email:', testEmail);

    const signupResponse = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'New Test User',
        companyName: 'New Test Company',
        workspaceUrl: `newtest-${timestamp}`,
        industry: 'Technology',
        country: 'US',
      }),
    });

    console.log('   Status:', signupResponse.status);

    if (signupResponse.status === 201) {
      const signupBody = await signupResponse.json();
      console.log('   ✓ Signup SUCCESSFUL');
      console.log('   User ID:', signupBody.userId);
      console.log('   Company ID:', signupBody.company.id);
    } else {
      const body = await signupResponse.text();
      console.log('   ✗ Signup FAILED:', body);
      return;
    }

    // 2. Wait for DB consistency
    console.log('\n2. Waiting 500ms for DB consistency...');
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Login
    console.log('\n3. Testing Login...');

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log('   Status:', loginResponse.status);

    const loginBody = await loginResponse.json();

    if (loginResponse.ok && !loginBody.code) {
      console.log('   ✓ Login SUCCESSFUL');
      console.log('   User:', loginBody.user?.email);

      const cookies = loginResponse.headers.get('set-cookie');
      const hasSessionCookie = cookies?.includes('better-auth.session_token');
      console.log('   Session cookie set:', hasSessionCookie ? 'YES' : 'NO');

      if (hasSessionCookie) {
        // 4. Test /auth/me
        const sessionTokenMatch = cookies?.match(
          /better-auth\.session_token=([^;]+)/,
        );
        const sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : '';

        console.log('\n4. Testing /auth/me...');
        const meResponse = await fetch(`${baseUrl}/auth/me`, {
          method: 'GET',
          headers: {
            Cookie: `better-auth.session_token=${sessionToken}`,
          },
        });

        if (meResponse.ok) {
          const meBody = await meResponse.json();
          console.log('   ✓ /auth/me SUCCESSFUL');
          console.log('   User:', meBody.name);
          console.log('   Company:', meBody.company.name);
        } else {
          console.log('   ✗ /auth/me FAILED');
        }
      }
    } else {
      console.log('   ✗ Login FAILED');
      console.log('   Error:', loginBody);
    }

    console.log('\n=== Flow Complete ===\n');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCompleteSignupFlow();
