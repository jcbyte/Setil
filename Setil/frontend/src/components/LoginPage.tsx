import { LoadingButton } from "@mui/lab";
import { Box, Link, TextField } from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { AlertNotificationParameterData } from "./AlertInterfaces";
import { login } from "./api";
import { LoginDetails } from "./apiInterfaces";

export default function LoginPage({ showAlert }: { showAlert: (data: AlertNotificationParameterData) => void }) {
	const [typedLoginDetails, settypedLoginDetails] = useState<LoginDetails>({
		username: "",
		password: "",
	});
	const [tryingLogin, setTryingLogin] = useState(false);

	function tryLogin() {
		setTryingLogin(true);
		login(typedLoginDetails).then((result) => {
			if (result.success) {
				showAlert({ details: "Logged in", severity: "success", timeout: 3000 });
			} else {
				showAlert({ details: "Invalid credentials", severity: "error", timeout: 3000 });
			}
			setTryingLogin(false);
		});
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
