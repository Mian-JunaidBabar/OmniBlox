async function testAuthMe() {
  const baseUrl = 'http://localhost:5000';

  console.log('\n=== Testing /auth/me Endpoint ===\n');

  // First login to get session cookie
  const testEmail = 'testdirect@example.com';
  const testPassword = 'Test@12345';

  try {
    console.log('1. Logging in...');

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

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('   ✓ Got session cookies');

    // Extract session token
    const sessionTokenMatch = cookies?.match(
      /better-auth\.session_token=([^;]+)/,
    );
    const sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : '';

    console.log('\n2. Testing /auth/me with session cookie...');

    const meResponse = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    console.log('   Status:', meResponse.status);

    if (meResponse.ok) {
      const body = await meResponse.json();
      console.log('   Response:', JSON.stringify(body, null, 2));
      console.log('\n✓ /auth/me SUCCESSFUL');
      console.log('   User:', body.name);
      console.log('   Email:', body.email);
      console.log('   Company:', body.company?.name);
      console.log('   Role:', body.role);
    } else {
      const body = await meResponse.text();
      console.log('   Response:', body);
      console.log('\n✗ /auth/me FAILED');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuthMe();
