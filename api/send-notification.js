import admin from "./firebaseAdmin.js";

export default async function (req, res) {
	if (req.method === "POST") {
		// Extract parameters
		const { token, topic, title, body } = req.body;
		if ((!token && !topic) || !title || !body) {
			return res.status(400).json({ success: false, error: "Missing parameters" });
		}
		if (token && topic) {
			return res.status(400).json({ success: false, error: "Cannot give both token and topic" });
		}

		try {
			const message = {
				...(topic && { topic }),
				...(token && { token }),
				notification: {
					title,
					body,
				},
			};

			// Send the notification
			await admin.messaging().send(message);
			res.status(200).json({ success: true });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	} else {
		res.status(405).json({ success: false, error: "Method Not Allowed" });
	}
}
