import React from "react";
import { createRoot } from "react-dom/client";
import ThemedApp from "./components/ThemedApp";

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<ThemedApp />);
