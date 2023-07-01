import React from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import App from "./App";

export default function ThemedApp() {
	const theme = createTheme({
		palette: {
			mode: "dark",
		},
	});

	return (
		<>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<App />
			</ThemeProvider>
		</>
	);
}
