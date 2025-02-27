import Material from "@primeuix/themes/material";
import { createPinia } from "pinia";
import "primeicons/primeicons.css";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";

const app = createApp(App);

app.use(router);

const pinia = createPinia();
app.use(pinia);

app.use(PrimeVue, {
	theme: {
		preset: Material,
	},
});
app.use(ToastService);

app.mount("#app");
