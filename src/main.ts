import Material from "@primeuix/themes/material";
import "primeicons/primeicons.css";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

const app = createApp(App);
app.use(PrimeVue, {
	theme: {
		preset: Material,
	},
});
app.mount("#app");
