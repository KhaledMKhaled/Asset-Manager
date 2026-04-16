import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react";

setAuthTokenGetter(() => localStorage.getItem("crm_auth_token"));

document.documentElement.classList.add("dark");

const storedLang = (localStorage.getItem("crm_lang") as "en" | "ar") ?? "en";
document.documentElement.dir = storedLang === "ar" ? "rtl" : "ltr";
document.documentElement.lang = storedLang;

createRoot(document.getElementById("root")!).render(<App />);
