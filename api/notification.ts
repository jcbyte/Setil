import { type VercelRequest, type VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

admin.initializeApp({
	credential: admin.credential.cert({
		// type: process.env.FIREBASE_TYPE,
		projectId: process.env.FIREBASE_PROJECT_ID,
		// private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
		privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		// client_id: process.env.FIREBASE_CLIENT_ID,
		// auth_uri: process.env.FIREBASE_AUTH_URI,
		// token_uri: process.env.FIREBASE_TOKEN_URI,
		// auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
		// client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
		// universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
	}),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method === "POST") {
		// Extract parameters
		const { token, title, body } = req.body;
		if (!token || !title || !body) {
			return res.status(400).json({ success: false, error: "Missing parameters" });
		}

		try {
			const message = {
				token: token,
				notification: {
					title: title,
					body: body,
				},
			};

			// Send the notification
			await admin.messaging().send(message);
			res.status(200).json({ success: true });
		} catch (error: any) {
			res.status(500).json({ success: false, error: error.message });
		}
	} else {
		res.status(405).json({ success: false, error: "Method Not Allowed" });
	}
}
