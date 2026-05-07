import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Create user with custom claims
export const setUserClaims = functions.https.onCall(async (data, context) => {
  // Only authenticated users can call this
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Must be logged in"
    );
  }

  const {uid, companyId, role, locationIds} = data;

  // Verify caller is owner
  const callerClaims = context.auth.token;
  if (callerClaims.role !== "owner") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only owners can set claims"
    );
  }

  // Set custom claims
  await admin.auth().setCustomUserClaims(uid, {
    companyId,
    role,
    locationIds: locationIds || [],
  });

  return {success: true, message: "Claims set successfully"};
});

// Create demo users on first deploy
export const createDemoUsers = functions.https.onRequest(
  async (req, res) => {
    try {
      const demoUsers = [
        {
          email: "owner@lunomi.local",
          password: "demo123",
          role: "owner",
          companyId: "demo_company",
        },
        {
          email: "manager@lunomi.local",
          password: "demo123",
          role: "manager",
          companyId: "demo_company",
        },
        {
          email: "kasir@lunomi.local",
          password: "demo123",
          role: "cashier",
          companyId: "demo_company",
        },
        {
          email: "kitchen@lunomi.local",
          password: "demo123",
          role: "kitchen",
          companyId: "demo_company",
        },
      ];

      const results = [];

      for (const userData of demoUsers) {
        try {
          // Try to get existing user
          let user;
          try {
            user = await admin.auth().getUserByEmail(userData.email);
          } catch (error) {
            // User doesn't exist, create it
            user = await admin.auth().createUser({
              email: userData.email,
              password: userData.password,
              emailVerified: true,
            });
          }

          // Set custom claims
          await admin.auth().setCustomUserClaims(user.uid, {
            companyId: userData.companyId,
            role: userData.role,
            locationIds: ["demo_location"],
          });

          results.push({
            email: userData.email,
            uid: user.uid,
            status: "success",
          });
        } catch (error: any) {
          results.push({
            email: userData.email,
            status: "error",
            error: error.message,
          });
        }
      }

      res.json({
        success: true,
        message: "Demo users created/updated",
        results,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// Create transaction
export const createTransaction = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in"
      );
    }

    const {companyId, locationId, items, customer, paymentMethod} = data;
    const db = admin.firestore();

    // Validate
    if (!items || items.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Items required"
      );
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.qty;
    }
    const taxAmount = subtotal * 0.1;
    const totalAmount = subtotal + taxAmount;

    // Create order
    const orderRef = db.collection(`companies/${companyId}/orders`).doc();
    const orderNumber = `ORD-${Date.now()}`;

    await db.runTransaction(async (transaction) => {
      // Create order document
      transaction.set(orderRef, {
        orderNumber,
        locationRef: db.doc(`companies/${companyId}/locations/${locationId}`),
        customerRef: customer ?
          db.doc(`companies/${companyId}/customers/${customer.id}`) :
          null,
        status: "pending",
        orderType: data.orderType || "dine_in",
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: context.auth!.uid,
      });

      // Create order items
      for (const item of items) {
        const itemRef = orderRef.collection("items").doc();
        transaction.set(itemRef, {
          productVariantRef: db.doc(item.productVariantRef),
          productName: item.productName,
          qty: item.qty,
          price: item.price,
          subtotal: item.price * item.qty,
        });
      }
    });

    return {orderId: orderRef.id, orderNumber};
  }
);
