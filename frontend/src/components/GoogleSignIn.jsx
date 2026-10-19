
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";

function GoogleSignIn() {
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleGoogleSuccess(credentialResponse) {
        setError("");

        if (!credentialResponse.credential) {
            setError("Google did not return a valid credential.");
            return;
        }

        try {
            setLoading(true);

            // Send Google's ID token to Django for verification.
            const response = await fetch(
                `${API_URL}/auth/google/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        credential: credentialResponse.credential,
                    }),
                }
            );

            // Check the response type before parsing JSON.
            const contentType =
                response.headers.get("content-type") || "";

            if (!contentType.includes("application/json")) {
                console.error("Unexpected Google API response:", {
                    status: response.status,
                    url: response.url,
                    contentType: contentType,
                });

                throw new Error(
                    `Google authentication failed (HTTP ${response.status}). ` +
                    "The backend returned HTML instead of JSON. " +
                    "Check the Django terminal for details."
                );
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Google authentication failed."
                );
            }

            // Ensure Django returned both JWT tokens.
            if (!data.access || !data.refresh) {
                throw new Error(
                    "The backend did not return valid authentication tokens."
                );
            }

            // Store GroceryTrack's JWT tokens.
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            // Redirect to Dashboard.
            navigate("/dashboard", { replace: true });

        } catch (err) {
            console.error("Google login error:", err);

            setError(
                err.message || "Unable to sign in with Google."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="google-signin-section">

            <div className="auth-divider">
                <span>or continue with</span>
            </div>

            <div className="google-signin-button">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        setError("Google sign-in was unsuccessful.");
                    }}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    text="continue_with"
                    width="350"
                />
            </div>

            {loading && (
                <p
                    className="google-signin-feedback"
                    role="status"
                >
                    Signing in with Google...
                </p>
            )}

            {error && (
                <p
                    className="auth-message auth-error"
                    role="alert"
                >
                    {error}
                </p>
            )}

        </div>
    );
}

export default GoogleSignIn;
