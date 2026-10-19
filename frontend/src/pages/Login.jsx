
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const API_URL = "http://127.0.0.1:8000/api";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    // Login form state
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Show or hide password
    const [showPassword, setShowPassword] = useState(false);

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Display a message after successful password reset
    const successMessage = location.state?.message || "";

    // Save JWT tokens and navigate to dashboard
    function completeLogin(data) {
        if (!data.access || !data.refresh) {
            throw new Error("Authentication tokens were not returned.");
        }

        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        navigate("/dashboard", { replace: true });
    }

    // Username and password login
    async function handleLogin(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/token/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Invalid username or password."
                );
            }

            completeLogin(data);

        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // Google Sign-In
    async function handleGoogleLogin(credentialResponse) {
        setError("");
        setLoading(true);

        try {
            if (!credentialResponse.credential) {
                throw new Error("Google authentication failed.");
            }

            const response = await fetch(`${API_URL}/auth/google/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credential: credentialResponse.credential,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.error ||
                    "Unable to sign in with Google."
                );
            }

            completeLogin(data);

        } catch (err) {
            setError(
                err.message || "Google Sign-In failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">

                {/* App icon */}
                <div className="login-heading-icon">
                    <i className="bi bi-basket2-fill"></i>
                </div>

                {/* Heading */}
                <h2>Welcome back</h2>

                <p className="login-description">
                    Log in to manage your grocery spending.
                </p>

                {/* Password reset success message */}
                {successMessage && (
                    <div className="login-success" role="status">
                        <i className="bi bi-check-circle"></i>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Login error */}
                {error && (
                    <div className="login-error" role="alert">
                        <i className="bi bi-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Login form */}
                <form onSubmit={handleLogin}>

                    {/* Username */}
                    <div className="login-form-group">
                        <label htmlFor="login-username">
                            Username
                        </label>

                        <div className="login-input-wrapper">
                            <i className="bi bi-person login-input-icon"></i>

                            <input
                                id="login-username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="login-form-group">
                        <label htmlFor="login-password">
                            Password
                        </label>

                        <div className="login-input-wrapper">
                            <i className="bi bi-lock login-input-icon"></i>

                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />

                            {/* Show/hide password */}
                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                <i
                                    className={`bi ${
                                        showPassword
                                            ? "bi-eye-slash"
                                            : "bi-eye"
                                    }`}
                                ></i>
                            </button>
                        </div>

                        {/* Forgot Password - outside input wrapper */}
                        <div className="login-forgot-password">
                            <Link to="/forgot-password">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    {/* Login button */}
                    <button
                        type="submit"
                        className="login-submit-button"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                {/* Divider */}
                <div className="login-divider">
                    <span>or continue with</span>
                </div>

                {/* Google Login */}
                <div className="login-google-container">
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() =>
                            setError("Google Sign-In failed.")
                        }
                        theme="outline"
                        size="large"
                        text="continue_with"
                        width="350"
                    />
                </div>

                {/* Register link */}
                <div className="login-register-link">
                    <span>Don't have an account? </span>
                    <Link to="/register">
                        Create an account
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Login;
