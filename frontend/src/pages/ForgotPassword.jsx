
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";
import "./ForgotPassword.css";

function ForgotPassword() {
    // Store the email entered by the user
    const [email, setEmail] = useState("");

    // Track request status
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Submit password reset request to Django
    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await apiRequest("/auth/forgot-password/", {
                method: "POST",
                body: JSON.stringify({ email: email.trim() }),
            });

            // Generic response protects account privacy
            setSuccess(
                "If an eligible account exists with this email, " +
                "a password reset link has been sent. " +
                "Please check your email."
            );

        } catch (err) {
            setError(
                err.message ||
                "Unable to process your request. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">

                {/* Heading icon */}
                <div className="forgot-heading-icon">
                    <i className="bi bi-envelope-paper"></i>
                </div>

                <h2>Forgot Password?</h2>

                <p className="forgot-description">
                    Enter the email address associated with your
                    GroceryTrackerZM account and we'll send you
                    a password reset link.
                </p>

                {/* Error message */}
                {error && (
                    <div className="forgot-error" role="alert">
                        <i className="bi bi-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div className="forgot-success" role="status">
                        <i className="bi bi-check-circle"></i>
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="forgot-form-group">
                        <label htmlFor="forgot-email">
                            Email Address
                        </label>

                        <div className="forgot-input-wrapper">
                            <i className="bi bi-envelope forgot-input-icon"></i>

                            <input
                                id="forgot-email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="forgot-submit-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="forgot-spinner"></span>
                                Sending...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-send"></i>
                                Send Reset Link
                            </>
                        )}
                    </button>
                </form>

                <div className="forgot-back-link">
                    <Link to="/login">
                        <i className="bi bi-arrow-left"></i>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
