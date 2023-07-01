import React from "react";
import { useState } from "react";
import { TextField, Button } from "@mui/material";

import { obtainToken } from "./auth";

export default function LoginPage() {
	const [typedUsername, setTypedUsername] = useState("");
	const [typedPassword, setTypedPassword] = useState("");
	const [resultText, setResultText] = useState("No data");

	function tryLogin() {
		obtainToken(typedUsername, typedPassword)
			.then(() => {
				setResultText("logged in");
			})
			.catch(() => {
				setResultText("Unknown credideitnials");
			});
	}

	return (
		<>
			Login Page
			<TextField
				placeholder="Username"
				onChange={(e) => {
					setTypedUsername(e.target.value);
				}}
			/>
			<TextField
				placeholder="Password"
				onChange={(e) => {
					setTypedPassword(e.target.value);
				}}
			/>
			<Button onClick={tryLogin}>Login</Button>
			{resultText}
		</>
	);
}
