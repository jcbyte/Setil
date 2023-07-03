import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getGroups } from "./api";
import { Group } from "./apiInterfaces";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";

export default function GroupListPage() {
	const navigate = useNavigate();

	const [groupsList, setGroupsList] = useState<Array<Group>>([]);

	function loadGroups() {
		getGroups().then((res) => {
			if (!res) {
				navigate("/login");
				return;
			}
			setGroupsList(res.groups);
		});
	}

	useEffect(() => {
		loadGroups();
	}, []);

	return (
		<>
			GroupListPage
			<List>
				{groupsList.map((group) => {
					return (
						<ListItem key={group.id} disablePadding>
							<ListItemButton
								onClick={() => {
									console.log(group.id);
								}}
							>
								<ListItemText primary={group.name} />
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>
		</>
	);
}
