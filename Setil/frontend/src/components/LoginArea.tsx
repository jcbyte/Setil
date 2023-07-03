import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import LoginPage from "./LoginPage";
import CreateAccountPage from "./CreateAccountPage";

export default function LoginArea() {
	return (
		<>
			login area
			<Outlet />
		</>
	);
}
