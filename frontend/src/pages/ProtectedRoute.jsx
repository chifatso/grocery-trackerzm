import { Navigate } from "react-router-dom";


function ProtectedRoute({ children }) {

    // Check whether the user has a JWT access token.
    const token = localStorage.getItem("access");


    // If there is no token, send the user to login.
    if(!token){
        return <Navigate to="/login" replace />;
    }

    // If the user is logged in,
    // display the requested page.
    return children;
}

export default ProtectedRoute;