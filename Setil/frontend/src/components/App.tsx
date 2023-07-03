import React, { useRef, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import CreateAccountPage from "./CreateAccountPage";
import GroupListPage from "./GroupListPage";
import LoginPage from "./LoginPage";

import AlertNotification from "./AlertNotification";

import { AlertNotificationComponentData, AlertNotificationParameterData } from "./AlertInterfaces";
import AppArea from "./AppArea";
import LoginArea from "./LoginArea";

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
					<Route path="/" element={<AppArea />}>
						<Route path="" element={<GroupListPage />} />
					</Route>
					<Route path="/login/" element={<LoginArea />}>
						<Route path="" element={<LoginPage showAlert={() => {}} />} />
						<Route path="create/" element={<CreateAccountPage showAlert={() => {}} />} />
					</Route>
				</Routes>
			</Router>
		</>
	);
}

// Group list page - inc edit/delete
// Transaction list - inc edit/delete - inc payments
