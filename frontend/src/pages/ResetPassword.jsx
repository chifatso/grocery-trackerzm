
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import "./ResetPassword.css";

function ResetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    // Password fields
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    // Show/hide password states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Request states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle password reset
    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        // Validate matching passwords
        if (password !== password2) {
            setError("Passwords do not match.");
            return;
        }

        // Validate minimum length
        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            // Send password reset request to Django
            await apiRequest("/auth/reset-password/", {
                method: "POST",
                body: JSON.stringify({
                    uid,
                    token,
                    password,
                    password2,
                }),
            });

            // Redirect to login after successful reset
            navigate("/login", {
                replace: true,
                state: {
                    message: "Password reset successfully. Please log in.",
                },
            });

        } catch (err) {
            setError(
                err.message || "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="reset-password-page">
            <div className="reset-password-card">

                {/* Heading icon */}
                <div className="reset-heading-icon">
                    <i className="bi bi-shield-lock"></i>
                </div>

                <h2>Reset Password</h2>

                <p className="reset-description">
                    Enter your new GroceryTrackerZM password.
                </p>

                {/* Error message */}
                {error && (
                    <div className="reset-error" role="alert">
                        <i className="bi bi-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* New Password */}
                    <div className="reset-form-group">
                        <label htmlFor="new-password">
                            New Password
                        </label>

                        <div className="reset-input-wrapper">
                            <i className="bi bi-lock reset-input-icon"></i>

                            <input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                                minLength={8}
                            />

                            <button
                                type="button"
                                className="reset-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? "Hide new password"
                                        : "Show new password"
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
                    </div>

                    {/* Confirm New Password */}
                    <div className="reset-form-group">
                        <label htmlFor="confirm-password">
                            Confirm New Password
                        </label>

                        <div className="reset-input-wrapper">
                            <i className="bi bi-lock reset-input-icon"></i>

                            <input
                                id="confirm-password"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Confirm new password"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                autoComplete="new-password"
                                required
                                minLength={8}
                            />

                            <button
                                type="button"
                                className="reset-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide confirmation password"
                                        : "Show confirmation password"
                                }
                            >
                                <i
                                    className={`bi ${
                                        showConfirmPassword
                                            ? "bi-eye-slash"
                                            : "bi-eye"
                                    }`}
                                ></i>
                            </button>
                        </div>
                    </div>

                    {/* Reset Password Button */}
                    <button
                        type="submit"
                        className="reset-submit-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="reset-spinner"></span>
                                Resetting Password...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-key"></i>
                                Reset Password
                            </>
                        )}
                    </button>
                </form>

                {/* Back to login */}
                <div className="reset-back-link">
                    <Link to="/login">
                        <i className="bi bi-arrow-left"></i>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
