import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/api";

function MonthlyBudgetProgress({ spending }) {

    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadBudget() {
            try {
                setLoading(true);
                setError("");

                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1;

                const data = await apiRequest(
                    `/budget/?year=${year}&month=${month}`
                );

                // Check the actual budget response
                console.log("Monthly budget API response:", data);

                setBudget(data);
            } catch (err) {
                console.error("Budget progress error:", err);
                setError("Unable to load monthly budget.");
            } finally {
                setLoading(false);
            }
        }

        loadBudget();
    }, []);

    function formatMoney(value) {
        return `ZMW ${Number(value || 0).toLocaleString("en-ZM", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    // Adapt this field if your Django budget serializer uses a different name
    const budgetAmount = Number(budget?.budget?.amount ?? 0);

    console.log("Budget state:", budget);
    console.log("Calculated budget amount:", budgetAmount);

    // Use the same spending total as the dashboard
    const spentAmount = Number(spending?.total_spent ?? 0);

    console.log("Spending received:", spending);

    const remaining = budgetAmount - spentAmount;

    const percentage = budgetAmount > 0
        ? (spentAmount / budgetAmount) * 100
        : 0;

    const progressWidth = Math.min(
        Math.max(percentage, 0),
        100
    );

    if(loading) {
        return <p>Loading monthly budget...</p>
    }

    return (
        <section className="monthly-budget-progress">

            <div className="budget-progress-header">
                <h2>Monthly Budget Progress</h2>

                <Link to="/budget-spending">
                    Manage Budget

                </Link>

            </div>

            {error ? (
                <p role="alert">{error}</p>
            ) : budgetAmount <= 0 ? (
                <p>
                    No monthly budget has been set.
                    Visit Budget & Spending to create one.
                </p>
            ):(
                <>
                    <div className="budget-progress-values">

                        <div>
                            <span>Monthly Budget</span>
                            <h3>{formatMoney(budgetAmount)}</h3>
                        </div>

                        <div>
                            <span>Amount Spent</span>
                            <h3>{formatMoney(spentAmount)}</h3>
                        </div>

                        <div>
                            <span>
                                {remaining >= 0
                                    ? "Remaining"
                                    : "Over Budget"
                                }
                            </span>

                            <h3>
                                {formatMoney(Math.abs(remaining))}
                            </h3>
                        </div>

                    </div>

                    <div
                        className="budget-progress-track"
                        role="progressbar"
                        aria-label="Monthly budget used"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progressWidth}
                    >
                        <div
                            className="budget-progress-fill"
                            style={{
                                width: `${progressWidth}%`,
                                backgroundColor:
                                    remaining < 0
                                        ? "#DC2626"
                                        : "#C65D21",
                            }}
                         />

                    </div>

                    <p className="budget-progress-caption">
                        {percentage.toFixed(1)}% of monthly budget used
                        

                    </p>

                    {remaining < 0 && (
                        <p className="budget-over-limit">
                            You have exceeded your monthly budget.
                        </p>
                    )}
                </>
            )

            }

        </section>
    );
}

export default MonthlyBudgetProgress;