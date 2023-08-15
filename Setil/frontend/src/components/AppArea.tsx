import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AlertNotificationParameterData } from "./AlertInterfaces";
import { logout } from "./api";

export default function AppArea({ showAlert }: { showAlert: (data: AlertNotificationParameterData) => void }) {
	const navigate = useNavigate();

	return (
		<>
			<button
				onClick={() => {
					logout().then(() => {
						showAlert({ details: "Logged out", severity: "success", timeout: 3000 });
						navigate("/login");
					});
				}}
			>
				logout
			</button>
			<Outlet />
		</>
	);
}
