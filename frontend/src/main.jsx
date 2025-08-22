import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { dark, experimental__simple } from "@clerk/themes";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: "#1e293b",
          colorBackgroundSecondary: "#1e293b",
          colorText: "#f8f8f8",
        },
        elements: {
          formFieldInput: {
            backgroundColor: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #475569",
            borderRadius: "6px",
            padding: "10px 12px",
            ":focus": {
              borderColor: "#3b82f6",
              boxShadow: "0 0 0 2px rgba(59,130,246,0.4)",
            },
          },
          userButton: {
            backgroundColor: "#1e293b",
            color: "#f1f5f9",
            fontWeight: "500",
            borderRadius: "6px",
            padding: "10px 14px",
            ":hover": { backgroundColor: "#334155", color: "#f1f5f9" },
          },
          userButtonPopoverActionButton: {
            backgroundColor: "#1e293b",
            color: "#f1f5f9",
            fontWeight: "500",
            borderRadius: "6px",
            padding: "10px 14px",
            ":hover": { backgroundColor: "#334155", color: "#f1f5f9" },
          },
          userButtonPopoverFooter: { backgroundColor: "#1e293b" },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);
