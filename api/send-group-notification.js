import admin from "./firebaseAdmin.js";

const db = admin.firestore();

export default async function (req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ success: false, error: "Method Not Allowed" });
	}

	// Extract parameters
	const { groupId, title, body } = req.body;
	if (!groupId || !title || !body) {
		return res.status(400).json({ success: false, error: "Missing parameters" });
	}

	// todo authenticate user is in group

	try {
		// Get list of all userId's who are active in the group (without getting all their data)
		const groupUsersRef = db.collection(`groups/${groupId}/users`);
		const groupUsersMetaSnap = await groupUsersRef.where("status", "==", "active").select().get();
		const userIds = groupUsersMetaSnap.docs.map((doc) => doc.id);

		// Get list of all fcm tokens for active users
		const fcmTokens = [];
		for (let userMetaDoc of groupUsersMetaSnap.docs) {
			const userSnap = await db.doc(`users/${userMetaDoc.id}`).get();
			fcmTokens.push(...userSnap.get("fcmTokens"));
		}

		// Send notification to all users' fcm tokens
		const message = {
			tokens: fcmTokens,
			notification: {
				title,
				body,
			},
		};
		await admin.messaging().sendEachForMulticast(message);

		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
}
