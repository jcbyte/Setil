import React from "react";
import { Outlet } from "react-router-dom";
import { logout } from "./api";

export default function AppArea() {
	return (
		<>
			<button onClick={logout}>logout</button>
			<Outlet />
		</>
	);
}
