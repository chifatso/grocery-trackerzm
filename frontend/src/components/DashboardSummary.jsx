function DashboardSummary({
    spending,
    comparison,
    groceryLists,
}) {
    // Format allamounts in Zambian kwacha
    function formatMoney(value) {
        return Number(value || 0).toLocaleString("en-ZM", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    const difference = Number(comparison?.difference || 0);
    const percentage = comparison?.percentage_change;

    // Reusable style for each summary card.
    const cardStyle = {
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        flex: "1 1 200px",
        minWidth: "180px",
    };

    const headingStyle = {
        margin: "0 0 12px",
        fontSize: "14px",
        color: "#666",
    };

    const valueStyle = {
        margin: 0,
        fontSize: "24px",
    };

    return (
        <section style={{ marginBottom: "28px" }}>
            <h2>Spending Overview</h2>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                }}
            >
                {/* Current month's spending */}
                <div style={cardStyle}>
                    <p style={headingStyle}>
                        This Month's Spending
                    </p>
                    <h3 style={valueStyle}>
                        ZMW {formatMoney(spending?.total_spent)}

                    </h3>

                </div>

                {/* Number of purchased items */}
                <div style={cardStyle}>
                    <p style={headingStyle}>
                        Items Purchased
                    </p>
                    <h3 style={valueStyle}>
                        {spending?.items_purchased ?? 0}

                    </h3>

                </div>

                {/* Difference compared with the previous month */}
                <div style={cardStyle}>
                    <p style={headingStyle}>
                        Change vs Last Month
                    </p>

                    <h3
                       style={{
                        ...valueStyle,
                        color:
                            difference > 0
                                ? "#dc2626"
                                : difference < 0
                                ? "#16a34a"
                                : "inherit",
                       }}
                    >
                        {difference > 0 ? "+" : ""}
                        ZMW {formatMoney(difference)}

                    </h3>
                    <p>
                        {percentage === null || 
                        percentage === undefined
                            ? "No previous spending data"
                            : `${Number(percentage).toFixed(1)}% change`
                        }
                    </p>

                </div>

                {/* Number of grocery lists owned by the user */}
                <div style={cardStyle}>
                    <p style={headingStyle}>
                        Grocery Lists
                    </p>
                    <h3 style={valueStyle}>
                        {groceryLists.length}
                    </h3>

                </div>

            </div>

        </section>
    );
}

export default DashboardSummary;