import { AlertColor } from "@mui/material";

export interface AlertNotificationData {
	details: string;
	severity: AlertColor;
}

export interface AlertNotificationComponentData extends AlertNotificationData {
	open: boolean;
}

export interface AlertNotificationParameterData extends AlertNotificationData {
	timeout?: number;
}
