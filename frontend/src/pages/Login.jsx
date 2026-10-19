
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import GoogleSignIn from "../components/GoogleSignIn";

const API_URL = "http://127.0.0.1:8000/api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/token/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Invalid username or password."
                );
            }

            const data = await response.json();

            // Save JWT tokens
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            navigate("/dashboard");

        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-header">
                    <div className="auth-logo">
                        <i className="bi bi-basket2-fill"></i>
                    </div>

                    <h2>Welcome back</h2>

                    <p className="auth-description">
                        Log in to manage your grocery spending.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="login-username">
                            Username
                        </label>

                        <div className="auth-input-wrapper">
                            <i className="bi bi-person auth-input-icon"></i>

                            <input
                                id="login-username"
                                type="text"
                                placeholder="Enter your username"
                                autoComplete="username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="login-password">
                            Password
                        </label>

                        <div className="auth-input-wrapper">
                            <i className="bi bi-lock auth-input-icon"></i>

                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />

                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                <i
                                    className={
                                        showPassword
                                            ? "bi bi-eye-slash"
                                            : "bi bi-eye"
                                    }
                                ></i>
                            </button>
                        </div>
                    </div>

                    {/* Login button */}
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>
                <GoogleSignIn />

                {message && (
                    <p className="auth-message" role="alert">
                        {message}
                    </p>
                )}

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Create an account
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Login;
