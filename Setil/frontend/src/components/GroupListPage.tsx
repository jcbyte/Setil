import React from "react";
import { useNavigate } from "react-router-dom";

import { authFetch } from "./auth";

export default function GroupListPage() {
	const navigate = useNavigate();

	function getFoo() {
		authFetch("/api/Foo", {
			method: "GET",
		})
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
			})
			.catch(() => {
				navigate("/login");
			});
	}

	return (
		<>
			GroupListPage
			<button onClick={getFoo}>click</button>
		</>
	);
}
