
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

// Manage and display the logged-in user's budget for this month.
function MonthlyBudget({ spending }) {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const [budget, setBudget] = useState(null);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Load the budget for the current month.
    useEffect(() => {
        async function loadBudget() {
            try {
                setError("");

                const data = await apiRequest(
                    `/budget/?year=${year}&month=${month}`
                );

                const savedBudget = data.budget;

                setBudget(savedBudget);

                // Pre-fill the form if a budget already exists.
                setAmount(
                    savedBudget ? savedBudget.amount : ""
                );
            } catch (err) {
                console.error("Load budget error:", err);
                setError(err.message || "Unable to load budget.");
            } finally {
                setLoading(false);
            }
        }

        loadBudget();
    }, [year, month]);

    // Create a new budget or update the existing one.
    async function handleSaveBudget(event) {
        event.preventDefault();

        const numericAmount = Number(amount);

        if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
            setError("Enter a budget amount greater than zero.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const data = await apiRequest("/budget/", {
                method: "POST",
                body: JSON.stringify({
                    year,
                    month,
                    amount: numericAmount.toFixed(2),
                }),
            });

            setBudget(data.budget);
            setAmount(data.budget.amount);
            setMessage("Monthly budget saved successfully.");
        } catch (err) {
            console.error("Save budget error:", err);
            setError(err.message || "Unable to save budget.");
        } finally {
            setSaving(false);
        }
    }

    // Format amounts as Zambian kwacha.
    function formatMoney(value) {
        return Number(value || 0).toLocaleString("en-ZM", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    if (loading) {
        return <section><p>Loading monthly budget...</p></section>;
    }

    const spent = Number(spending?.total_spent || 0);
    const budgetAmount = Number(budget?.amount || 0);
    const remaining = budgetAmount - spent;

    // Keep the progress bar between 0% and 100%.
    const percentageUsed = budgetAmount > 0
        ? Math.min((spent / budgetAmount) * 100, 100)
        : 0;

    const overBudget = budgetAmount > 0 && spent > budgetAmount;
    const budgetReached = budgetAmount > 0 && spent >= budgetAmount;

    return (
        <section
            style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
            }}
        >
            <h2>Monthly Grocery Budget</h2>

            <p>
                Set a spending limit for this month and track your progress.
            </p>

            <form onSubmit={handleSaveBudget} className="monthly-budget-form">
                <label htmlFor="monthly-budget-amount">
                    Budget amount (ZMW)
                </label>

                <div className="monthly-budget-form-controls">
                    <input
                        id="monthly-budget-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="e.g. 2000.00"
                        required
                    />

                    <button type="submit" disabled={saving}>
                        {saving
                            ? "Saving..."
                            : budget
                            ? "Update Budget"
                            : "Set Budget"}
                    </button>
                </div>
            </form>

            {error && (
                <p role="alert" style={{ color: "#dc2626" }}>
                    {error}
                </p>
            )}

            {message && (
                <p role="status" style={{ color: "#16a34a" }}>
                    {message}
                </p>
            )}

            {!budget ? (
                <p>Set a budget to see how much you have remaining.</p>
            ) : (
                <div style={{ marginTop: "20px" }}>
                    <p>
                        Monthly budget: <strong>ZMW {formatMoney(budgetAmount)}</strong>
                    </p>

                    <p>
                        Spent so far: <strong>ZMW {formatMoney(spent)}</strong>
                    </p>

                    <p className="budget-remaining">
    {remaining >= 0 ? "Remaining" : "Over budget by"}:{" "}
    <strong
        style={{
            color: remaining >= 0 ? "#C65D21" : "#dc2626",
        }}
    >
        ZMW {formatMoney(Math.abs(remaining))}
    </strong>
</p>

                    <div
                        style={{
                            height: "12px",
                            backgroundColor: "#e5e7eb",
                            borderRadius: "999px",
                            overflow: "hidden",
                        }}
                        aria-label={`${percentageUsed.toFixed(1)} percent of budget used`}
                    >
                        <div
                            style={{
                                width: `${percentageUsed}%`,
                                height: "100%",
                                backgroundColor: overBudget
                                    ? "#dc2626"
                                    : budgetReached
                                    ? "#d97706"
                                    : "#C65D21",
                                transition: "width 0.3s ease",
                            }}
                        />
                    </div>

                    <p>
                        {((spent / budgetAmount) * 100).toFixed(1)}% of budget used
                    </p>

                    {overBudget && (
                        <p role="alert" style={{ color: "#dc2626" }}>
                            You have exceeded your monthly grocery budget.
                        </p>
                    )}

                    {budgetReached && !overBudget && (
                        <p style={{ color: "#d97706" }}>
                            You have reached your monthly budget limit.
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}

export default MonthlyBudget;
