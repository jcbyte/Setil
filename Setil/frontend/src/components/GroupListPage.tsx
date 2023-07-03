import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Button, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { getGroups } from "./api";
import { Group } from "./apiInterfaces";

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
				<List sx={{ width: "100%" }}>
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
				<Button variant="contained" fullWidth onClick={() => {}}>
					Join Group
				</Button>
			</Box>
		</>
	);
}
