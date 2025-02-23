import Material from "@primeuix/themes/material";
import "primeicons/primeicons.css";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

import router from "./router";

const app = createApp(App);

app.use(PrimeVue, {
	theme: {
		preset: Material,
	},
});
app.use(ToastService);
app.use(router);

app.mount("#app");
