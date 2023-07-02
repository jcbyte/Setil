import React from "react";
import { useState } from "react";
import { TextField, Button } from "@mui/material";

import { createAccount, AccountDetails } from "./api";

export default function LoginPage() {
	const [typedAccountDetails, setTypedAccountDetails] = useState<AccountDetails>({
		name: "",
		username: "",
		password: "",
	});
	const [resultText, setResultText] = useState("No data");

	function tryCreateAccount() {
		createAccount(typedAccountDetails).then((result) => {
			if (result.success) {
				setResultText("account created");
			} else {
				if (result.name == "blank") {
					setResultText("Give name");
				}
				if (result.username == "blank") {
					setResultText("Give username");
				}
				if (result.username == "unique") {
					setResultText("Username already exists");
				}
				if (result.password == "blank") {
					setResultText("Give password");
				}
			}
		});
	}

	return (
		<>
			Create account page
			<TextField
				placeholder="Name"
				onChange={(e) => {
					setTypedAccountDetails((prev) => {
						return { ...prev, name: e.target.value };
					});
				}}
			/>
			<TextField
				placeholder="Username"
				onChange={(e) => {
					setTypedAccountDetails((prev) => {
						return { ...prev, username: e.target.value };
					});
				}}
			/>
			<TextField
				placeholder="Password"
				onChange={(e) => {
					setTypedAccountDetails((prev) => {
						return { ...prev, password: e.target.value };
					});
				}}
			/>
			<Button onClick={tryCreateAccount}>Login</Button>
			{resultText}
		</>
	);
}
