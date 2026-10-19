
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

import MonthlyBudget from "../components/MonthlyBudget";
import MonthlyBudgetHistory from "../components/MonthlyBudgetHistory";

function BudgetSpendingPage() {

    // Store current month's spending
    const [currentSpending, setCurrentSpending] = useState(null);

    // Track loading and errors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadSpending() {
            try {
                setLoading(true);
                setError("");

                // Fetch current month's spending
                const data = await apiRequest(
                    "/spending/current/"
                );

                setCurrentSpending(data);

            } catch (err) {
                console.error(
                    "Budget page error:",
                    err
                );

                setError(
                    "Unable to load current spending."
                );

            } finally {
                setLoading(false);
            }
        }

        loadSpending();

    }, []);

    if (loading) {
        return <p>Loading budget information...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="budget-spending-page">

            <h1>Budget & Spending</h1>

            <p>
                Manage your monthly grocery budget
                and track your spending.
            </p>

            {/* Current month's budget */}
            <section className="budget-page-section">
                <MonthlyBudget spending={currentSpending} />
            </section>
            

            {/* Previous monthly budgets */}
            <section className="budget-page-section">
                <MonthlyBudgetHistory />

            </section>
            

        </div>
    );
}

export default BudgetSpendingPage;
