import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { ChefHat, Mail, Lock, User, AtSign, Eye, EyeOff, Loader } from "lucide-react";

type AuthMode = "login" | "register";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AVATAR_COLORS = [
  "#10b981", "#6366f1", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"
];

function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "Incorrect email or password."
        : error.message);
    } else {
      onAuthSuccess();
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (username.includes(" ")) {
      setError("Username cannot contain spaces.");
      setLoading(false);
      return;
    }

    // 1. Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Create profile row
      const avatarInitials = displayName
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: username.toLowerCase().trim(),
        display_name: displayName.trim(),
        avatar_initials: avatarInitials || displayName[0]?.toUpperCase() || "U",
        avatar_color: randomAvatarColor(),
      });

      if (profileError) {
        setError(profileError.message.includes("unique")
          ? "Username already taken. Please choose another."
          : profileError.message);
        setLoading(false);
        return;
      }

      setSuccessMsg("Account created! Check your email to confirm, then log in.");
      setMode("login");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--surface)",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative background blobs */}
      <div style={{
        position: "absolute", top: "-120px", left: "-120px",
        width: "400px", height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-100px", right: "-100px",
        width: "350px", height: "350px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Auth Card */}
      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "var(--surface-container-lowest)",
        border: "1px solid var(--surface-container-high)",
        borderRadius: "24px",
        padding: "40px 36px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        animation: "fadeInSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo + Brand */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px", height: "64px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, var(--primary) 0%, #059669 100%)",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
          }}>
            <ChefHat size={32} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: "var(--font-title)",
            fontSize: "24px",
            fontWeight: "800",
            color: "var(--on-surface)",
            margin: 0,
          }}>
            Culinary Vitality
          </h1>
          <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: "4px" }}>
            {mode === "login" ? "Welcome back, Chef! 👨‍🍳" : "Create your chef account 🌿"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: "flex",
          background: "var(--surface-container-low)",
          borderRadius: "12px",
          padding: "4px",
          gap: "4px",
        }}>
          {(["login", "register"] as AuthMode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccessMsg(null); setConfirmPassword(""); }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-title)",
                fontSize: "14px",
                fontWeight: "700",
                transition: "all 0.2s",
                background: mode === m ? "var(--surface-container-lowest)" : "transparent",
                color: mode === m ? "var(--primary)" : "var(--on-surface-variant)",
                boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.12)" : "none",
              }}
            >
              {m === "login" ? "Log In" : "Register"}
            </button>
          ))}
        </div>

        {/* Success message */}
        {successMsg && (
          <div style={{
            padding: "12px 16px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "10px",
            fontSize: "13px",
            color: "var(--primary)",
            fontWeight: "600",
          }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            padding: "12px 16px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "10px",
            fontSize: "13px",
            color: "var(--error)",
            fontWeight: "600",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Display Name — only on register */}
          {mode === "register" && (
            <div style={{ position: "relative" }}>
              <User size={16} style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", color: "var(--outline)", pointerEvents: "none"
              }} />
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                className="interactive-input"
                style={{ width: "100%", paddingLeft: "42px", boxSizing: "border-box" }}
              />
            </div>
          )}

          {/* Username — only on register */}
          {mode === "register" && (
            <div style={{ position: "relative" }}>
              <AtSign size={16} style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", color: "var(--outline)", pointerEvents: "none"
              }} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                required
                className="interactive-input"
                style={{ width: "100%", paddingLeft: "42px", boxSizing: "border-box" }}
              />
            </div>
          )}

          {/* Email */}
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", color: "var(--outline)", pointerEvents: "none"
            }} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="interactive-input"
              style={{ width: "100%", paddingLeft: "42px", boxSizing: "border-box" }}
            />
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", color: "var(--outline)", pointerEvents: "none"
            }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={mode === "register" ? "Password (min. 6 characters)" : "Password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="interactive-input"
              style={{ width: "100%", paddingLeft: "42px", paddingRight: "42px", boxSizing: "border-box" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)", background: "none", border: "none",
                cursor: "pointer", color: "var(--outline)", padding: "4px",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Confirm Password — only on register */}
          {mode === "register" && (
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", color: "var(--outline)", pointerEvents: "none"
              }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="interactive-input"
                style={{ width: "100%", paddingLeft: "42px", paddingRight: "42px", boxSizing: "border-box" }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "800",
              borderRadius: "12px",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> Processing...</>
              : mode === "login" ? "🔑 Log In" : "🚀 Create Account"
            }
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--on-surface-variant)", margin: 0 }}>
          {mode === "login"
            ? <>Don't have an account? <button onClick={() => { setMode("register"); setError(null); }} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}>Sign up</button></>
            : <>Already have an account? <button onClick={() => { setMode("login"); setError(null); }} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}>Log in</button></>
          }
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
