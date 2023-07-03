import CloseIcon from "@mui/icons-material/Close";
import { Alert, Box, Collapse, IconButton } from "@mui/material";
import React from "react";

import { AlertNotificationComponentData } from "./AlertInterfaces";

export default function AlertNotification({
	alertData,
	setAlertData,
}: {
	alertData: AlertNotificationComponentData;
	setAlertData: any;
}) {
	return (
		<Box sx={{ width: "100%" }}>
			<Collapse in={alertData.open}>
				<Alert
					severity={alertData.severity}
					action={
						<IconButton
							aria-label="close"
							color="inherit"
							size="small"
							onClick={() => {
								setAlertData({ ...alertData, open: false });
							}}
						>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					}
					sx={{ mb: 2 }}
				>
					{alertData.details}
				</Alert>
			</Collapse>
		</Box>
	);
}
