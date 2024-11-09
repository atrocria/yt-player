import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter from react-router-dom
import App from "./App";
import "./index.css";

//TODO: update firebase cloud functions name in firebase.json, signin popup in app.tsx and hosting with emulators

// Wrap the <App /> in <BrowserRouter> to provide the routing context
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
          <App />
    </BrowserRouter>
  </StrictMode>
);
