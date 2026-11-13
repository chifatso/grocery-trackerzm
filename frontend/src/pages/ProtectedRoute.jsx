
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

    // Get both JWT tokens from local storage.
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");

    // If neither token exists, redirect to login.
    if (!accessToken && !refreshToken) {
        return <Navigate to="/login" replace />;
    }

    // If an access token or refresh token exists,
    // allow the protected page to render.
    // The API layer will attempt token refresh
    // when Django responds with HTTP 401.
    return children;
}

export default ProtectedRoute;
