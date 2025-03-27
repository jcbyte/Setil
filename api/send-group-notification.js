import admin from "./firebaseAdmin.js";

const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

export default async function (req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ success: false, error: "Method Not Allowed" });
	}

	// Extract parameters
	const { jwt, groupId, title, body, route } = req.body;
	if (!jwt || !groupId || !title || !body) {
		return res.status(400).json({ success: false, error: "Missing parameters" });
	}

	// todo reenable auth
	// // Get user who performed the request
	// let user;
	// try {
	// 	user = await auth.verifyIdToken(jwt);
	// } catch (e) {
	// 	return res.status(401).json({ success: false, error: "Unauthorized" });
	// }

	try {
		// Get list of all userId's who are active in the group (without getting all their data)
		const groupUsersRef = db.collection(`groups/${groupId}/users`);
		const groupUsersMetaSnap = await groupUsersRef.where("status", "==", "active").select().get();
		const userIds = groupUsersMetaSnap.docs.map((doc) => doc.id);

		// todo reenable auth
		// // Verify that the user asking for the notification is in the group
		// if (!userIds.some((userId) => userId === user.uid)) {
		// 	return res.status(401).json({ success: false, error: "Unauthorized" });
		// }

		// Get list of all fcm tokens for active users
		const fcmTokens = [];
		for (let userId of userIds) {
			const userSnap = await db.doc(`users/${userId}`).get();
			fcmTokens.push(...userSnap.get("fcmTokens"));
		}

		let message;
		if (fcmTokens.length > 0) {
			// Send notification to all users' fcm tokens
			// https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages
			message = {
				tokens: fcmTokens,
				notification: { title, body },
				// https://developer.mozilla.org/en-US/docs/Web/API/Notification
				webpush: {
					notification: {
						icon: "https://setil.vercel.app/icon/icon-192.png",
						badge: "https://setil.vercel.app/icon/mask-monochrome-96.png",
					},
				},
				data: {
					route,
				},
			};
			await messaging.sendEachForMulticast(message);
		}

		return res.status(200).json({ success: true, message });
	} catch (error) {
		return res.status(500).json({ success: false, error: error.message });
	}
}
