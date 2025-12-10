import admin from "./firebaseAdmin.js";

const db = admin.firestore();
const auth = admin.auth();

export default async function (req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ success: false, error: "Method Not Allowed" });
	}

	// Extract parameters
	const authHeader = req.headers.authorization;
	let jwt;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		jwt = authHeader.split(" ")[1];
	}
	const { paymentDetails } = req.body;
	if (!jwt || !paymentDetails) {
		return res.status(400).json({ success: false, error: "Missing parameters" });
	}

	// Get user who performed the request
	let user;
	try {
		user = await auth.verifyIdToken(jwt);
	} catch (e) {
		return res.status(401).json({ success: false, error: "Unauthorized" });
	}

	// TODO encryption
	const encryptedPaymentDetails = paymentDetails;

	const paymentDetailsRef = db.doc(`/users/${user.uid}/public/paymentDetails`);
	await paymentDetailsRef.set({ enc: encryptedPaymentDetails });

	return res.status(200).json({ success: true });
}
