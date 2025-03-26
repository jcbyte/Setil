import { getMessaging, getToken } from "firebase/messaging";
import { app } from "./firebase";
import { getUser } from "./firestore/util";

const VAPID_KEY = "BNTO7GezdnZI2F6tcCs-IENFqIrp0BJ27_lmVEaz19VtOgDaA6uhnzYl0AdAWAzwh6yqN0mDOA30qeOoyay6p-8";

const messaging = getMessaging(app);

/**
 * Request notification permission.
 */
export async function requestPushNotificationPermission() {
	try {
		const token = await getToken(messaging, { vapidKey: VAPID_KEY });

		if (token) {
			console.log("FCM Token:", token);
			// Send the token to your backend for push notification subscription
		} else {
			console.log("No registration token available.");
		}
	} catch (error) {
		console.error("Error getting FCM token:", error);
	}
}

/**
 * Send a notification to all suers within a specified group.
 * @param groupId id of the group to send users messages to.
 * @param title title of the notification.
 * @param body body of the notification.
 * @returns true if it was successful.
 */
export async function sendNotification(groupId: string, title: string, body: string): Promise<boolean> {
	const user = getUser();

	const res = await fetch("/api/send-group-notification", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ jwt: await user.getIdToken(), groupId: groupId, title, body }),
	}).then((res) => res.json());

	return res.success;
}
