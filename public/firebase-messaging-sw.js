importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyDdxl38UXQp0XrXx9ZENB1BjIR2JC2nMr4",
	authDomain: "setil-420xd.firebaseapp.com",
	projectId: "setil-420xd",
	storageBucket: "setil-420xd.firebasestorage.app",
	messagingSenderId: "913646123341",
	appId: "1:913646123341:web:83bdc33b50b509f5dc5f04",
	measurementId: "G-61RDYF85Q1",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

self.addEventListener("notificationclick", (event) => {
	console.log("On notification click: ", event.notification.tag);
	event.notification.close();

	// This looks to see if the current is already open and focuses if it is
	event.waitUntil(
		clients
			.matchAll({
				type: "window",
			})
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url === "/" && "focus" in client) return client.focus();
				}
				if (clients.openWindow) return clients.openWindow("/");
			})
	);
});
