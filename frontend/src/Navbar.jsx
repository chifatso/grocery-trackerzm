import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Navbar() {
    const navigate = useNavigate();

    // Remove saved authentication tokenes when logging out
    function handleLogout() {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        // Redirect the user to the login page
        navigate("/login");
    }


return (
    <nav className="navbar">
        <div className="navbar-container">

            {/* App logo and name */}
            <NavLink to="/dashboard" className="navbar-brand">
                <span className="navbar-logo">
                    <i className="bi bi-basket2-fill"></i>

                </span>
                <span className="navbar-title">
                    GroceryTrackerZM

                </span>


            </NavLink>

            {/* Navigation links */}
            <div className="navbar-links">

                <NavLink
                   to="/dashboard"
                   className={({ isActive }) => 
                       `navbar-link ${isActive ? "active" : ""}`
                }
                >
                    <i className="bi bi-grid"></i>
                    <span>Dashboard</span>

                </NavLink>

                <NavLink
                   to="/grocery-lists"
                   className={({ isActive }) => 
                       `navbar-link ${isActive ? "active" : ""}`
                }
                >
                    <i className="bi bi-cart3"></i>
                    <span>Grocery Lists</span>

                </NavLink>
                <NavLink
                    to="/spending-history"
                    className={({ isActive }) => 
                        `navbar-link ${isActive ? "active" : ""}`
                    }
                >
                    <i className="bi bi-bar-chart"></i>
                    <span>Spending History</span>
                    

                </NavLink>

                {/* Budget and Spending Navigation */}
                <NavLink
                    to="/budget-spending"
                    className={({ isActive }) => 
                        `navbar-link ${isActive ? "active" : ""}`
                    }
                >
                    <i className="bi bi-wallet-fill"></i>
                    <span>Budget & Spending</span>

                </NavLink>

                <button
                    type="button"
                    className="navbar-logout"
                    onClick={handleLogout}
                >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>

                </button>

            </div>

        </div>

    </nav>
);

}

export default Navbar;