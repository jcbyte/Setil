import admin from "firebase-admin";

admin.initializeApp({
	credential: admin.credential.cert({
		type: process.env.FIREBASE_TYPE,
		project_id: process.env.FIREBASE_PROJECT_ID,
		private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
		private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
		client_email: process.env.FIREBASE_CLIENT_EMAIL,
		client_id: process.env.FIREBASE_CLIENT_ID,
		auth_uri: process.env.FIREBASE_AUTH_URI,
		token_uri: process.env.FIREBASE_TOKEN_URI,
		auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
		client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
		universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
	}),
});

export default async function handler(req, res) {
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
			// const response = await admin.messaging().send(message);
			const response = message;
			res.status(200).json({ success: true, message: response });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	} else {
		res.status(405).json({ success: false, error: "Method Not Allowed" });
	}
}
