import admin from "./firebaseAdmin.js";

export default async function (req, res) {
	if (req.method === "POST") {
		// Extract parameters
		const { token, topic } = req.body;
		if (!token || !topic) {
			return res.status(400).json({ success: false, error: "Missing parameters" });
		}

		try {
			// Subscribe the device to a topic
			await admin.messaging().subscribeToTopic(token, topic);
			res.status(200).json({ success: true });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	} else {
		res.status(405).json({ success: false, error: "Method Not Allowed" });
	}
}
