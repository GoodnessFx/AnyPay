
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Dark-only app
document.documentElement.style.background = "var(--ap-bg)";
document.body.style.background = "var(--ap-bg)";

createRoot(document.getElementById("root")!).render(<App />);
  