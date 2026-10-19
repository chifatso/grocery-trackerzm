
function SpendingHistory({ history }) {

    // Don't display the section until data has loaded.
    if (!history) {
        return null;
    }

    // Convert YYYY-MM into a readable month name.
    function formatMonth(month) {
        const [year, monthNumber] = month.split("-");

        const date = new Date(
            Number(year),
            Number(monthNumber) - 1
        );

        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    }

    // Format amounts in Zambian Kwacha.
    function formatMoney(value) {
        return Number(value || 0).toLocaleString("en-ZM", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    return (
        <section className="spending-history-section">
            <div className="spending-history-header">
                <div>
                    <h2>Monthly Spending History</h2>
                    <p>
                        Review your grocery spending
                        across previous months.
                    </p>
                </div>
            </div>

            {history.length === 0 ? (
                <p className="spending-history-empty">
                    No spending history available yet.
                </p>
            ) : (
                <ul className="spending-history-list">
                    {history.map((month) => (
                        <li
                            key={month.month}
                            className="spending-history-item"
                        >
                            <div className="spending-history-month">
                                <span className="spending-history-icon">
                                    <i className="bi bi-calendar3"></i>
                                </span>

                                <strong>
                                    {formatMonth(month.month)}
                                </strong>
                            </div>

                            <span className="spending-history-amount">
                                ZMW {formatMoney(month.total)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default SpendingHistory;
