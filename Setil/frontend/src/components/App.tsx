import React from "react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import GroupListPage from "./GroupListPage";
import LoginPage from "./LoginPage";
import CreateAccountPage from "./CreateAccountPage";

export default function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<GroupListPage />} />
					<Route path="/createAccount" element={<CreateAccountPage />} />
					<Route path="/login" element={<LoginPage />} />
				</Routes>
			</Router>
		</>
	);
}

// Login Page
// Create account page
// Group list page - inc edit/delete
// Transaction list - inc edit/delete - inc payments
