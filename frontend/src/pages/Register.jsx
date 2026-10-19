
import { useState } from "react";
import { Link } from "react-router-dom";
import GoogleSignIn from "../components/GoogleSignIn";

const API_URL = "http://127.0.0.1:8000/api";

function Register() {

    // Store registration form values
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password2: "",
    });

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form feedback
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Update form values
    function handleChange(event) {
        setFormData((previous) => ({
            ...previous,
            [event.target.name]: event.target.value,
        }));
    }

    // Submit registration form
    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setSuccess(false);

        // Check passwords match before submitting
        if (formData.password !== formData.password2) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/register/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(JSON.stringify(data));
            }

            setSuccess(true);
            setMessage(
                "Account created successfully! You can now log in."
            );

            // Clear form after successful registration
            setFormData({
                username: "",
                email: "",
                password: "",
                password2: "",
            });

        } catch (error) {
            setMessage(
                `Registration failed: ${error.message}`
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* Header */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <i className="bi bi-basket2-fill"></i>
                    </div>

                    <h2>Create Account</h2>

                    <p className="auth-description">
                        Create an account to start tracking
                        your grocery spending.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="register-username">
                            Username
                        </label>

                        <div className="auth-input-wrapper">
                            <i className="bi bi-person auth-input-icon"></i>

                            <input
                                id="register-username"
                                type="text"
                                name="username"
                                placeholder="Choose a username"
                                autoComplete="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="register-email">
                            Email Address
                        </label>

                        <div className="auth-input-wrapper">
                            <i className="bi bi-envelope auth-input-icon"></i>

                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="register-password">
                            Password
                        </label>

                        <div className="auth-input-wrapper">
                            <i className="bi bi-lock auth-input-icon"></i>

                            <input
                                id="register-password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Create a password"
                                autoComplete="new-password"
                                minLength={8}
                                value={formData.password}
                                onChange={handleChange}
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

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="register-password2">
                            Confirm Password
                        </label>

                        <div className="auth-input-wrapper">
                            <i className="bi bi-shield-lock auth-input-icon"></i>

                            <input
                                id="register-password2"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password2"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                minLength={8}
                                value={formData.password2}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="auth-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                <i
                                    className={
                                        showConfirmPassword
                                            ? "bi bi-eye-slash"
                                            : "bi bi-eye"
                                    }
                                ></i>
                            </button>
                        </div>
                    </div>

                    {/* Register button */}
                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create Account"}
                    </button>
                </form>
                <GoogleSignIn />

                {/* Registration feedback */}
                {message && (
                    <p
                        className={
                            success
                                ? "auth-message auth-success"
                                : "auth-message auth-error"
                        }
                        role={success ? "status" : "alert"}
                    >
                        {message}
                    </p>
                )}

                {/* Login link */}
                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">
                        Log in here
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Register;
