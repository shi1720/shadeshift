import { useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { X, LockKeyhole, ArrowRight } from "lucide-react";
export default function AuthDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<"signin" | "create" | "reset">("signin"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const container = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    container.current?.querySelector("input")?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
      if (e.key === "Tab") {
        const nodes = Array.from(
          container.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]),input,a[href]",
          ) ?? [],
        );
        if (e.shiftKey && document.activeElement === nodes[0]) {
          e.preventDefault();
          nodes.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
          e.preventDefault();
          nodes[0]?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onClose, busy]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setError(
          "If an account exists, a reset link will arrive in its inbox.",
        );
        return;
      }
      if (mode === "create")
        await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(
        code === "auth/email-already-in-use"
          ? "This email is already registered. Sign in or reset your password."
          : code === "auth/weak-password"
            ? "Use at least 8 characters for your password."
            : code === "auth/too-many-requests"
              ? "Too many attempts. Please wait and try again."
              : code === "auth/network-request-failed"
                ? "Connection failed. Your scenario is still here; try again."
                : mode === "create"
                  ? "Account creation failed. Check the email and password, then try again."
                  : "Could not sign in. Check your email and password.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={() => !busy && onClose()}>
      <section
        ref={container}
        className="modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close icon-button"
          disabled={busy}
          aria-label="Close sign in"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <LockKeyhole size={28} />
        <h2 id="auth-title">
          {mode === "create"
            ? "Create your workspace."
            : mode === "reset"
              ? "Reset your password."
              : "Welcome back."}
        </h2>
        <p>
          Save private investment plans across devices. Your current scenario
          stays exactly as it is.
        </p>
        <form onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {mode !== "reset" && (
            <label>
              Password
              <input
                type="password"
                autoComplete={
                  mode === "create" ? "new-password" : "current-password"
                }
                minLength={mode === "create" ? 8 : 1}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary full-width" disabled={busy} type="submit">
            {busy
              ? "Please wait…"
              : mode === "create"
                ? "Create account"
                : mode === "reset"
                  ? "Send reset link"
                  : "Sign in"}
            <ArrowRight size={16} />
          </button>
        </form>
        <div className="auth-options">
          <button
            className="text-button"
            onClick={() => {
              setMode(mode === "create" ? "signin" : "create");
              setError("");
            }}
          >
            {mode === "create"
              ? "Already have an account? Sign in"
              : "New here? Create an account"}
          </button>
          <button
            className="text-button"
            onClick={() => {
              setMode(mode === "reset" ? "signin" : "reset");
              setError("");
            }}
          >
            {mode === "reset" ? "Back to sign in" : "Forgot password?"}
          </button>
        </div>
        <small className="auth-privacy">
          Firebase secures your account. Each plan is accessible only to its
          owner. No payment required.
        </small>
      </section>
    </div>
  );
}
