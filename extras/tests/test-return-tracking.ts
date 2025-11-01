async function testReturnTracking() {
  const baseUrl = "http://localhost:5000";

  console.log("\n=== Testing Return Tracking Workflow ===\n");

  // Test credentials
  const testEmail = "testdirect@example.com";
  const testPassword = "Test@12345";

  try {
    // 1. Login
    console.log("1. Logging in...");

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    if (!loginResponse.ok) {
      console.log("   ✗ Login failed:", loginResponse.status);
      return;
    }

    const cookies = loginResponse.headers.get("set-cookie");
    const sessionTokenMatch = cookies?.match(
      /better-auth\.session_token=([^;]+)/
    );
    const sessionToken = sessionTokenMatch ? sessionTokenMatch[1] : "";

    console.log("   ✓ Login successful");

    // 2. Get existing sales to see current state
    console.log("\n2. Checking existing sales...");

    const salesResponse = await fetch(`${baseUrl}/sales`, {
      method: "GET",
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (salesResponse.ok) {
      const salesData = await salesResponse.json();
      console.log(`   Found ${salesData.sales?.length || 0} existing sales`);
    }

    // 3. Create a test sale
    console.log("\n3. Creating a test sale...");

    const createSaleResponse = await fetch(`${baseUrl}/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
      body: JSON.stringify({
        invoiceNumber: `TEST-${Date.now()}`,
        customer: {
          name: "Test Customer",
          email: "test@example.com",
        },
        warehouseId: "warehouse-id", // We'll need to get a real warehouse ID
        saleDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "COMPLETED",
        paymentStatus: "PAID",
        items: [
          {
            productId: "product-id", // We'll need real product IDs
            quantity: 10,
            unitPrice: 100,
          },
        ],
      }),
    });

    let saleId = null;
    if (createSaleResponse.ok) {
      const saleData = await createSaleResponse.json();
      saleId = saleData.id;
      console.log("   ✓ Sale created:", saleId);
    } else {
      console.log("   ✗ Sale creation failed:", createSaleResponse.status);
      const error = await createSaleResponse.text();
      console.log("   Error:", error);
      return;
    }

    // 4. Create a return for the sale
    console.log("\n4. Creating a return for the sale...");

    const createReturnResponse = await fetch(`${baseUrl}/sales-returns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
      body: JSON.stringify({
        saleId: saleId,
        returnDate: new Date().toISOString(),
        reason: "Test return",
        status: "PENDING",
        items: [
          {
            saleItemId: "sale-item-id", // We'll need real sale item IDs
            quantity: 2,
            reason: "Defective",
          },
        ],
      }),
    });

    let returnId = null;
    if (createReturnResponse.ok) {
      const returnData = await createReturnResponse.json();
      returnId = returnData.id;
      console.log("   ✓ Return created:", returnId);
    } else {
      console.log("   ✗ Return creation failed:", createReturnResponse.status);
      const error = await createReturnResponse.text();
      console.log("   Error:", error);
      return;
    }

    // 5. Complete the return
    console.log("\n5. Completing the return...");

    const completeReturnResponse = await fetch(
      `${baseUrl}/sales-returns/${returnId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      }
    );

    if (completeReturnResponse.ok) {
      console.log("   ✓ Return completed");
    } else {
      console.log(
        "   ✗ Return completion failed:",
        completeReturnResponse.status
      );
      const error = await completeReturnResponse.text();
      console.log("   Error:", error);
      return;
    }

    // 6. Check if the sale now shows hasReturns: true
    console.log("\n6. Checking if sale shows return tracking...");

    const checkSaleResponse = await fetch(`${baseUrl}/sales/${saleId}`, {
      method: "GET",
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (checkSaleResponse.ok) {
      const saleData = await checkSaleResponse.json();
      console.log("   Sale hasReturns:", saleData.hasReturns);
      console.log("   Items returned quantities:");
      saleData.items?.forEach((item: any, index: number) => {
        console.log(
          `     Item ${index + 1}: ${item.returnedQuantity} returned`
        );
      });

      if (saleData.hasReturns) {
        console.log("   ✓ Return tracking working correctly!");
      } else {
        console.log(
          "   ✗ Return tracking not working - hasReturns should be true"
        );
      }
    } else {
      console.log(
        "   ✗ Could not fetch sale details:",
        checkSaleResponse.status
      );
    }

    // 7. Check sales list to see return indicators
    console.log("\n7. Checking sales list for return indicators...");

    const salesListResponse = await fetch(`${baseUrl}/sales`, {
      method: "GET",
      headers: {
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
    });

    if (salesListResponse.ok) {
      const salesListData = await salesListResponse.json();
      const testSale = salesListData.sales?.find((s: any) => s.id === saleId);
      if (testSale) {
        console.log("   Sale in list hasReturns:", testSale.hasReturns);
        if (testSale.hasReturns) {
          console.log("   ✓ Sales list return indicators working!");
        } else {
          console.log("   ✗ Sales list return indicators not working");
        }
      } else {
        console.log("   ✗ Test sale not found in sales list");
      }
    }

    console.log("\n=== Return Tracking Test Complete ===\n");
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

// Run the test
testReturnTracking();
