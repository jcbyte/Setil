import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";

const VAPID_KEY = "BNTO7GezdnZI2F6tcCs-IENFqIrp0BJ27_lmVEaz19VtOgDaA6uhnzYl0AdAWAzwh6yqN0mDOA30qeOoyay6p-8";

const messaging = getMessaging(app);

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

onMessage(messaging, (payload) => {
	console.log("Message received.");
	console.log(payload);
});
