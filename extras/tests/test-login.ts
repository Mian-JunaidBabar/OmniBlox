async function testBetterAuthLogin() {
  const baseUrl = 'http://localhost:5000';

  console.log('\n=== Testing Better Auth Login Endpoint ===\n');

  // Test with the user we just created
  const testEmail = 'testdirect@example.com';
  const testPassword = 'Test@12345';

  try {
    console.log('1. Testing login with:', testEmail);

    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);

    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      console.log('   Cookies:', cookies);
    } else {
      console.log('   No Set-Cookie header');
    }

    const body = await response.json();
    console.log('   Response body:', JSON.stringify(body, null, 2));

    if (response.ok && !body.code) {
      console.log('\n✓ Login SUCCESSFUL');
    } else {
      console.log('\n✗ Login FAILED');
      if (body.code) {
        console.log('   Error code:', body.code);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testBetterAuthLogin();
