import React from "react";
import { Outlet } from "react-router-dom";

export default function AppArea() {
	return (
		<>
			app area
			<Outlet />
		</>
	);
}
