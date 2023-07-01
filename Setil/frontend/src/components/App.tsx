import React from "react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import GroupListPage from "./GroupListPage";
import LoginPage from "./LoginPage";

export default function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<GroupListPage />} />
					<Route path="/login" element={<LoginPage />} />
				</Routes>
			</Router>
		</>
	);
}
