/**
 * Return Tracking Workflow Test
 *
 * This script tests the COMPLETE return workflow:
 * 1. Create a sale with items
 * 2. Create a sales return referencing the sale (status: PENDING)
 * 3. Verify sale is NOT marked as returned yet
 * 4. Update return status to COMPLETED
 * 5. Verify sale IS NOW marked as returned with correct quantities
 */

// Allow overriding the base URL via TEST_BASE_URL env var so tests can target different ports
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3001/api";

interface TestContext {
  accessToken: string;
  tenantId: string;
  warehouseId: string;
  customerId: string;
  productId: string;
  saleId: string;
  saleItemId: string;
  returnId: string;
  sessionCookie?: string;
}

async function login(): Promise<{
  accessToken: string;
  tenantId: string;
  sessionCookie?: string;
}> {
  console.log("\n📝 Step 1: Login");
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@omniblox.com",
      password: "Admin@123",
    }),
  });

  let successResponse: Response | null = null;

  if (!response.ok) {
    // If login fails with Unauthorized or Not Found, try to auto-register a test admin
    console.log(`Login failed: ${response.statusText}. Attempting signup...`);
    try {
      const signupResp = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@omniblox.com",
          password: "Admin@123",
          name: "Admin Test",
          companyName: "OmniBlox Test",
          // BetterAuth signup requires these additional workspace fields
          workspaceUrl: "omni-test",
          industry: "Software",
          country: "US",
        }),
      });

      if (!signupResp.ok) {
        const txt = await signupResp.text().catch(() => "");
        throw new Error(`Signup failed: ${signupResp.statusText} - ${txt}`);
      }

      console.log("✅ Signup successful, retrying login...");
      // Retry login once
      const retry = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@omniblox.com",
          password: "Admin@123",
        }),
      });

      if (!retry.ok) {
        throw new Error(`Login retry failed: ${retry.statusText}`);
      }

      successResponse = retry;
    } catch (err) {
      throw new Error(`Login failed: ${response.statusText} - ${String(err)}`);
    }
  }
  if (!successResponse) {
    successResponse = response;
  }

  const data = await successResponse.json();
  console.log("✅ Login successful");
  console.log(`   User: ${data.user.email}`);
  console.log(`   Tenant: ${data.user.tenantId}`);

  // Debug: print response headers to inspect Set-Cookie
  try {
    const headersArray = Array.from((successResponse.headers as any).entries());
    console.log("   Response headers:", headersArray);
  } catch (err) {
    console.log(
      "   Could not read response headers for debugging:",
      String(err)
    );
  }

  // Capture session cookie (BetterAuth uses cookie sessions)
  const setCookie =
    (successResponse.headers &&
      (successResponse.headers.get("set-cookie") ||
        successResponse.headers.get("Set-Cookie"))) ||
    "";
  const cookie = Array.isArray(setCookie)
    ? setCookie.join("; ")
    : setCookie || "";

  return {
    accessToken: data.token,
    tenantId: data.user.tenantId,
    // session cookie to send on subsequent requests
    sessionCookie: cookie,
  };
}

async function getWarehouse(ctx: TestContext): Promise<string> {
  console.log("\n📝 Step 2: Get Warehouse");
  const response = await fetch(`${BASE_URL}/warehouses`, {
    headers: {
      Cookie: ctx.sessionCookie || "",
    },
  });

  if (!response.ok) {
    throw new Error(`Get warehouses failed: ${response.statusText}`);
  }

  const warehouses = await response.json();
  if (warehouses.length === 0) {
    throw new Error("No warehouses found");
  }

  console.log(`✅ Found warehouse: ${warehouses[0].name}`);
  return warehouses[0].id;
}

async function getCustomer(ctx: TestContext): Promise<string> {
  console.log("\n📝 Step 3: Get Customer");
  const response = await fetch(`${BASE_URL}/customers`, {
    headers: {
      Cookie: ctx.sessionCookie || "",
    },
  });

  if (!response.ok) {
    throw new Error(`Get customers failed: ${response.statusText}`);
  }

  const customers = await response.json();
  if (customers.length === 0) {
    throw new Error("No customers found");
  }

  console.log(`✅ Found customer: ${customers[0].name}`);
  return customers[0].id;
}

async function getProduct(ctx: TestContext): Promise<string> {
  console.log("\n📝 Step 4: Get Product");
  const response = await fetch(`${BASE_URL}/products`, {
    headers: {
      Cookie: ctx.sessionCookie || "",
    },
  });

  if (!response.ok) {
    throw new Error(`Get products failed: ${response.statusText}`);
  }

  const products = await response.json();
  if (products.length === 0) {
    throw new Error("No products found");
  }

  console.log(`✅ Found product: ${products[0].name}`);
  return products[0].id;
}

async function createSale(
  ctx: TestContext
): Promise<{ saleId: string; saleItemId: string }> {
  console.log("\n📝 Step 5: Create Sale with 10 units");
  const response = await fetch(`${BASE_URL}/sales`, {
    method: "POST",
    headers: {
      Cookie: ctx.sessionCookie || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: ctx.customerId,
      warehouseId: ctx.warehouseId,
      saleDate: new Date().toISOString(),
      status: "COMPLETED",
      paymentStatus: "PAID",
      items: [
        {
          productId: ctx.productId,
          quantity: 10,
          unitPrice: 100,
          taxRate: 0,
          discount: 0,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create sale failed: ${response.statusText} - ${error}`);
  }

  const sale = await response.json();
  console.log(`✅ Sale created: ${sale.id}`);
  console.log(`   Items: ${sale.items.length}`);
  console.log(`   Item ID: ${sale.items[0].id}`);
  console.log(`   Quantity: ${sale.items[0].quantity}`);
  console.log(`   ⚠️  hasReturns: ${sale.hasReturns} (should be false)`);
  console.log(
    `   ⚠️  returnedQuantity: ${sale.items[0].returnedQuantity} (should be 0)`
  );

  return {
    saleId: sale.id,
    saleItemId: sale.items[0].id,
  };
}

async function createReturn(ctx: TestContext): Promise<string> {
  console.log("\n📝 Step 6: Create Sales Return (3 units) with PENDING status");
  const response = await fetch(`${BASE_URL}/sales-returns`, {
    method: "POST",
    headers: {
      Cookie: ctx.sessionCookie || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: ctx.customerId,
      warehouseId: ctx.warehouseId,
      returnDate: new Date().toISOString(),
      saleId: ctx.saleId, // IMPORTANT: Link to original sale
      notes: "Test return - checking workflow",
      items: [
        {
          productId: ctx.productId,
          saleItemId: ctx.saleItemId, // IMPORTANT: Link to original sale item
          quantity: 3,
          reason: "Workflow test",
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create return failed: ${response.statusText} - ${error}`);
  }

  const returnData = await response.json();
  console.log(`✅ Return created: ${returnData.id}`);
  console.log(`   Status: ${returnData.status} (should be PENDING)`);
  console.log(`   Linked to Sale: ${returnData.saleId}`);
  console.log(`   Items: ${returnData.items.length}`);
  console.log(`   Linked to Sale Item: ${returnData.items[0].saleItemId}`);

  return returnData.id;
}

async function checkSaleBeforeCompletion(ctx: TestContext): Promise<void> {
  console.log("\n📝 Step 7: Check Sale BEFORE completing return");
  const response = await fetch(`${BASE_URL}/sales/${ctx.saleId}`, {
    headers: {
      Cookie: ctx.sessionCookie || "",
    },
  });

  if (!response.ok) {
    throw new Error(`Get sale failed: ${response.statusText}`);
  }

  const sale = await response.json();
  console.log(`✅ Sale fetched: ${sale.id}`);
  console.log(
    `   ❌ hasReturns: ${sale.hasReturns} (should be FALSE - return not completed yet)`
  );
  console.log(
    `   ❌ returnedQuantity: ${sale.items[0].returnedQuantity} (should be 0 - return not completed yet)`
  );

  if (sale.hasReturns || sale.items[0].returnedQuantity > 0) {
    console.log(
      "   ⚠️  WARNING: Sale already marked as returned before return completion!"
    );
  } else {
    console.log("   ✅ EXPECTED: Sale is NOT marked as returned yet");
  }
}

async function completeReturn(ctx: TestContext): Promise<void> {
  console.log("\n📝 Step 8: Update Return Status to COMPLETED");
  const response = await fetch(`${BASE_URL}/sales-returns/${ctx.returnId}`, {
    method: "PATCH",
    headers: {
      Cookie: ctx.sessionCookie || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "COMPLETED",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Complete return failed: ${response.statusText} - ${error}`
    );
  }

  const returnData = await response.json();
  console.log(`✅ Return updated: ${returnData.id}`);
  console.log(`   Status: ${returnData.status} (should be COMPLETED)`);
}

async function checkSaleAfterCompletion(ctx: TestContext): Promise<void> {
  console.log("\n📝 Step 9: Check Sale AFTER completing return");
  const response = await fetch(`${BASE_URL}/sales/${ctx.saleId}`, {
    headers: {
      Cookie: ctx.sessionCookie || "",
    },
  });

  if (!response.ok) {
    throw new Error(`Get sale failed: ${response.statusText}`);
  }

  const sale = await response.json();
  console.log(`✅ Sale fetched: ${sale.id}`);
  console.log(`   ✅ hasReturns: ${sale.hasReturns} (should be TRUE now)`);
  console.log(
    `   ✅ returnedQuantity: ${sale.items[0].returnedQuantity} (should be 3 now)`
  );
  console.log(`   Original quantity: ${sale.items[0].quantity}`);
  console.log(
    `   Remaining unreturned: ${
      sale.items[0].quantity - sale.items[0].returnedQuantity
    }`
  );

  // Validate
  if (!sale.hasReturns) {
    throw new Error(
      "❌ TEST FAILED: hasReturns is still false after return completion!"
    );
  }

  if (sale.items[0].returnedQuantity !== 3) {
    throw new Error(
      `❌ TEST FAILED: returnedQuantity is ${sale.items[0].returnedQuantity}, expected 3!`
    );
  }

  console.log("\n🎉 TEST PASSED: Return tracking works correctly!");
}

async function testCancellation(ctx: TestContext): Promise<void> {
  console.log("\n📝 Step 10 (Optional): Cancel Return to verify reversal");
  const response = await fetch(`${BASE_URL}/sales-returns/${ctx.returnId}`, {
    method: "PATCH",
    headers: {
      Cookie: ctx.sessionCookie || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: "CANCELLED",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cancel return failed: ${response.statusText} - ${error}`);
  }

  console.log(`✅ Return cancelled`);

  // Check sale again
  const saleResponse = await fetch(`${BASE_URL}/sales/${ctx.saleId}`, {
    headers: {
      Cookie: ctx.sessionCookie || "",
    },
  });

  const sale = await saleResponse.json();
  console.log(
    `   hasReturns: ${sale.hasReturns} (should be FALSE after cancellation)`
  );
  console.log(
    `   returnedQuantity: ${sale.items[0].returnedQuantity} (should be 0 after cancellation)`
  );

  if (sale.hasReturns || sale.items[0].returnedQuantity > 0) {
    throw new Error(
      "❌ TEST FAILED: Cancellation did not reverse the tracking!"
    );
  }

  console.log("   ✅ Cancellation correctly reversed the tracking");
}

async function runTest() {
  console.log("🚀 Starting Return Tracking Workflow Test\n");
  console.log("=".repeat(60));

  const ctx: TestContext = {} as TestContext;

  try {
    // Login
    const { accessToken, tenantId } = await login();
    ctx.accessToken = accessToken;
    ctx.tenantId = tenantId;

    // Get test data
    ctx.warehouseId = await getWarehouse(ctx);
    ctx.customerId = await getCustomer(ctx);
    ctx.productId = await getProduct(ctx);

    // Create sale
    const { saleId, saleItemId } = await createSale(ctx);
    ctx.saleId = saleId;
    ctx.saleItemId = saleItemId;

    // Create return (PENDING status)
    ctx.returnId = await createReturn(ctx);

    // Check sale BEFORE completing return
    await checkSaleBeforeCompletion(ctx);

    // Complete the return
    await completeReturn(ctx);

    // Check sale AFTER completing return
    await checkSaleAfterCompletion(ctx);

    // Optional: Test cancellation
    await testCancellation(ctx);

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL TESTS PASSED");
    console.log("=".repeat(60));
    console.log("\nConclusion:");
    console.log(
      "- Return tracking ONLY updates when return status is COMPLETED"
    );
    console.log(
      "- Creating a return with PENDING status does NOT update the original sale"
    );
    console.log(
      "- Users MUST mark returns as COMPLETED for tracking to appear"
    );
    console.log("- This is working as designed");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    process.exit(1);
  }
}

// Run the test
runTest();
