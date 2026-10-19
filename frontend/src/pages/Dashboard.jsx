
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

import DashboardSummary from "../components/DashboardSummary";
import QuickNavigation from "../components/QuickNavigation";
import MonthlyBudgetProgress from "../components/MonthlyBudgetProgress";

function Dashboard() {

    // Current month's spending
    const [currentSpending, setCurrentSpending] = useState(null);

    // Comparison data used by DashboardSummary
    const [comparison, setComparison] = useState(null);

    // Grocery lists used by DashboardSummary
    const [groceryLists, setGroceryLists] = useState([]);

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadDashboard() {

            try {
                setLoading(true);
                setError("");

                // Load only the data needed by the dashboard
                const [
                    spendingData,
                    comparisonData,
                    groceryListData
                ] = await Promise.all([

                    apiRequest("/spending/current/"),

                    apiRequest("/spending/comparison/"),

                    apiRequest("/grocery-lists/")
                ]);

                setCurrentSpending(spendingData);
                setComparison(comparisonData);
                setGroceryLists(groceryListData);

            } catch (err) {

                console.error("Dashboard error:", err);

                setError(
                    err.message ||
                    "Unable to load dashboard information."
                );

            } finally {
                setLoading(false);
            }
        }

        loadDashboard();

    }, []);

    if (loading) {
        return (
            <div className="dashboard-page">
                <div
                    className="dashboard-feedback"
                    role="status"
                >
                    Loading dashboard...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <div
                    className="dashboard-feedback dashboard-error"
                    role="alert"
                >
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            <h1>Dashboard Overview</h1>

            <p className="dashboard-description">
                Welcome to GroceryTrackerZM. Here's a quick
                overview of your monthly grocery spending.
            </p>

            {/* Summary cards */}
            <DashboardSummary
                spending={currentSpending}
                comparison={comparison}
                groceryLists={groceryLists}
            />

            {/* Monthly budget progress */}
            <MonthlyBudgetProgress
                spending={currentSpending}
            />

            {/* Navigation to other pages */}
            <QuickNavigation />

        </div>
    );
}

export default Dashboard;
