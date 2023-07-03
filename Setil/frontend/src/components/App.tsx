import React from "react";
import { useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import GroupListPage from "./GroupListPage";
import LoginPage from "./LoginPage";
import CreateAccountPage from "./CreateAccountPage";

import AlertNotification from "./AlertNotification";

import { AlertNotificationParameterData, AlertNotificationComponentData } from "./AlertInterfaces";

export default function App() {
	const [alertData, setAlertData] = useState<AlertNotificationComponentData>({
		open: false,
		details: "string",
		severity: "success",
	});
	const alertTimer = useRef<number>();

	function showAlert(data: AlertNotificationParameterData) {
		clearTimeout(alertTimer.current);

		if (data.timeout) {
			alertTimer.current = setTimeout(() => {
				setAlertData((prev) => {
					return { ...prev, open: false };
				});
			}, data.timeout);
		}

		setAlertData({ ...data, open: true });
	}

	return (
		<>
			<AlertNotification alertData={alertData} setAlertData={setAlertData} />
			<Router>
				<Routes>
					<Route path="/" element={<GroupListPage />} />
					<Route path="/createAccount" element={<CreateAccountPage showAlert={showAlert} />} />
					<Route path="/login" element={<LoginPage showAlert={showAlert} />} />
				</Routes>
			</Router>
		</>
	);
}

// Group list page - inc edit/delete
// Transaction list - inc edit/delete - inc payments
