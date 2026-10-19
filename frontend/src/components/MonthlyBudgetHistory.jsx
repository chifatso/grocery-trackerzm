import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

function MonthlyBudgetHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadHistory() {
            try {
                setLoading(true);
                setError("");

                const data = await apiRequest("/budget/history/");
                setHistory(data);
            } catch (err) {
                console.error("Budget history error:", err);
                setError(
                    err.message || "Unable to load budget history."
                );
            } finally {
                setLoading(false);
            }
        }

        loadHistory();
    }, []);

    function formatMoney(value) {
        if(value === null || value === undefined) {
            return "-";
        }

        return `ZMW ${Number(value).toLocaleString("en-ZM", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    function formatMonth(year, month) {
        // Month is 1-12, while JavaScript expects 0-11.
        return new Date(year, month - 1, 1).toLocaleDateString(
            "en",
            { month: "long", year: "numeric"}
        );
    }

    function getStatusLabel(status) {
        switch(status) {
            case "over_budget":
                return "Over budget";
            case "under_budget":
                return "Under budget";
            default:
                return "No budget set";
        }
    }

    if(loading) {
        return <section><p>Loading budget history...</p></section>
    }

    if(error) {
        return (
            <section>
                <h2>Budget History</h2>
                <p role="alert">{error}</p>
                <button onClick={() => window.location.reload()}>
                    Reload page
                </button>
            </section>
        );
    }

    return (
        <section className="budget-history">
            <h2>Monthly Budget History</h2>
            <p>Review your budget and grocery spending over the last 12 months.</p>

            {history.length === 0 ? (
                <p>No budget history available yet.</p>
            ): (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Budget</th>
                                <th>Spent</th>
                                <th>Remaining</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {history.map((item) => (
                                <tr key={`${item.year}-${item.month}`}>
                                    <td>
                                        {formatMonth(item.year, item.month)}
                                    </td>
                                    <td>{formatMoney(item.budget)}</td>
                                    <td>{formatMoney(item.spent)}</td>
                                    <td>{formatMoney(item.remaining)}</td>
                                    <td>
                                        <span
                                           className={`budget-status ${item.status}`}
                                        >
                                            {getStatusLabel(item.status)}

                                        </span>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}

        </section>
    );
}

export default MonthlyBudgetHistory;