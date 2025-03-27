// importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
// importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// // Your web app's Firebase configuration
// const firebaseConfig = {
// 	apiKey: "AIzaSyDdxl38UXQp0XrXx9ZENB1BjIR2JC2nMr4",
// 	authDomain: "setil-420xd.firebaseapp.com",
// 	projectId: "setil-420xd",
// 	storageBucket: "setil-420xd.firebasestorage.app",
// 	messagingSenderId: "913646123341",
// 	appId: "1:913646123341:web:83bdc33b50b509f5dc5f04",
// 	measurementId: "G-61RDYF85Q1",
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// const messaging = firebase.messaging();

// Handle messages when in the background
// messaging.onBackgroundMessage(function (payload) {
// 	const notificationTitle = payload.notification.title;
// 	const notificationOptions = {
// 		body: payload.notification.body,
// 		icon: "/icon/icon-192.png",
// 	};

// 	self.registration.showNotification(notificationTitle, notificationOptions);
// });

// self.addEventListener("notificationclick", function (event) {
// 	// Close the notification
// 	event.notification.close();

// 	// Extract route to open too
// 	const appLink = "https://setil.vercel.app";
// 	const route = event.notification.data?.route;
// 	console.log(route);
// 	// todo load route

// 	event.waitUntil(
// 		clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
// 			// Focus on the open tab if it exists
// 			for (let client of clientList) {
// 				if (client.url === appLink && "focus" in client) {
// 					return client.focus();
// 				}
// 			}

// 			// Open a new tab if no matching window is open
// 			return clients.openWindow(appLink);
// 		})
// 	);
// });
