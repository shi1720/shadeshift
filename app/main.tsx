import { StrictMode, useEffect, useState, Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import Workbench from "./workbench";
import "./globals.css";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main style={{ margin: "0 auto", maxWidth: 640, padding: 50 }}>
        <h1>Something did not load correctly.</h1>
        <p>
          Your saved plans are safe. Refresh to try again, or download the
          example scenario to continue later.
        </p>
        <p>
          <a href="/data/example-scenario.json" download>
            Download example scenario
          </a>
        </p>
        <button className="primary" onClick={() => location.reload()}>
          Reload ShadeShift
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function App() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return (
    <Workbench
      user={
        user
          ? {
              displayName: user.displayName ?? user.email ?? "Your account",
              email: user.email ?? "",
              uid: user.uid,
            }
          : null
      }
    />
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
