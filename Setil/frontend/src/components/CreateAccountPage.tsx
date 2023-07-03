import React from "react";
import { useState } from "react";
import { TextField, Box, Link } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Link as RouterLink } from "react-router-dom";

import { createAccount } from "./api";
import { AccountDetails } from "./apiInterfaces";
import { AlertNotificationParameterData } from "./AlertInterfaces";

export default function CreateAccountPage({
	showAlert,
}: {
	showAlert: (data: AlertNotificationParameterData) => void;
}) {
	const [typedAccountDetails, setTypedAccountDetails] = useState<AccountDetails>({
		name: "",
		username: "",
		password: "",
	});
	const [tryingCreateAccount, setTryingCreateAccount] = useState(false);

	function tryCreateAccount() {
		setTryingCreateAccount(true);

		createAccount(typedAccountDetails).then((result) => {
			if (result.success) {
				showAlert({ details: "Account created", severity: "success", timeout: 3000 });
			} else {
				if (result.name) {
					if (result.name[0] == "blank")
						showAlert({ details: "Please give a name", severity: "warning", timeout: 3000 });
				} else if (result.username) {
					if (result.username[0] == "blank")
						showAlert({ details: "Please give a username", severity: "warning", timeout: 3000 });
					else if (result.username[0] == "unique")
						showAlert({ details: "Username already exists", severity: "warning", timeout: 3000 });
				} else if (result.password) {
					if (result.password[0] == "blank")
						showAlert({ details: "Please give a password", severity: "warning", timeout: 3000 });
				}
			}

			setTryingCreateAccount(false);
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
					placeholder="Name"
					fullWidth
					onChange={(e) => {
						setTypedAccountDetails((prev) => {
							return { ...prev, name: e.target.value };
						});
					}}
				/>
				<TextField
					variant="outlined"
					placeholder="Username"
					fullWidth
					onChange={(e) => {
						setTypedAccountDetails((prev) => {
							return { ...prev, username: e.target.value };
						});
					}}
				/>
				<TextField
					variant="outlined"
					placeholder="Password"
					fullWidth
					onChange={(e) => {
						setTypedAccountDetails((prev) => {
							return { ...prev, password: e.target.value };
						});
					}}
				/>
				<LoadingButton
					variant="contained"
					fullWidth
					loading={tryingCreateAccount}
					//loadingPosition="end"
					onClick={tryCreateAccount}
				>
					Create Account
				</LoadingButton>
				<Link variant="body2" component={RouterLink} to="/login">
					Login
				</Link>
			</Box>
		</>
	);
}
