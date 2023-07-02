import React from "react";
import { useState } from "react";
import { TextField, Box, Link } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Link as RouterLink } from "react-router-dom";

import { LoginDetails } from "./api";
import { AlertNotificationParameterData } from "./AlertInterfaces";

export default function LoginPage({ showAlert }: { showAlert: (data: AlertNotificationParameterData) => void }) {
	const [typedLoginDetails, settypedLoginDetails] = useState<LoginDetails>({
		username: "",
		password: "",
	});
	const [tryingLogin, setTryingLogin] = useState(false);

	function tryLogin() {
		// setTryingCreateAccount(true);
		// createAccount(typedLoginDetails).then((result) => {
		// 	if (result.success) {
		// 		showAlert({ details: "Account created", severity: "success", timeout: 3000 });
		// 	} else {
		// 		if (result.name) {
		// 			if (result.name[0] == "blank")
		// 				showAlert({ details: "Please give a name", severity: "warning", timeout: 3000 });
		// 		} else if (result.username) {
		// 			if (result.username[0] == "blank")
		// 				showAlert({ details: "Please give a username", severity: "warning", timeout: 3000 });
		// 			else if (result.username[0] == "unique")
		// 				showAlert({ details: "Username already exists", severity: "warning", timeout: 3000 });
		// 		} else if (result.password) {
		// 			if (result.password[0] == "blank")
		// 				showAlert({ details: "Please give a password", severity: "warning", timeout: 3000 });
		// 		}
		// 	}
		// 	setTryingCreateAccount(false);
		// });
	}

	return (
		<>
			<Box
				sx={{
					position: "fixed",
					bottom: "10%",
					left: 0,
					right: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					margin: "10px",
					gap: "10px",
				}}
			>
				<TextField
					variant="outlined"
					placeholder="Username"
					fullWidth
					onChange={(e) => {
						settypedLoginDetails((prev) => {
							return { ...prev, username: e.target.value };
						});
					}}
				/>
				<TextField
					variant="outlined"
					placeholder="Password"
					fullWidth
					onChange={(e) => {
						settypedLoginDetails((prev) => {
							return { ...prev, password: e.target.value };
						});
					}}
				/>
				<LoadingButton
					variant="contained"
					fullWidth
					loading={tryingLogin}
					//loadingPosition="end"
					onClick={tryLogin}
				>
					Login
				</LoadingButton>
				<Link variant="body2" component={RouterLink} to="/createAccount">
					Create Account
				</Link>
			</Box>
		</>
	);
}
