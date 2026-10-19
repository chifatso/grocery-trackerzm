import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

// Display grocery spending for each month
function SpendingChart({ history }) {
    // Handle missing history safely
    if(!history || history.length === 0) {
        return (
            <section>
                <h2>Monthly spending chart</h2>
                <p>No spending data available yet.</p>
            </section>
        );
    }

    // Convert YYYY-MM into a readable month label.
    const chartData = history
       .map((entry) => {
           const [year, month] = entry.month.split("-");

           const date = new Date(
            Number(year),
            Number(month) - 1
           );

           return {
            month: date.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
            }),
            spending: Number(entry.total),
           };
       })
       .reverse();

    return (
        <section>
            <h2>Monthly Spending Chart</h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="month" />

                    <YAxis tickFormatter={(value) => `ZMW ${value}`} />

                    <Tooltip
                        formatter={(value) => [
                            `ZMW ${Number(value).toFixed(2)}`,
                            "Spending",
                        ]}
                        cursor={{ fill: "#FFF4EC" }}
                    />

                    <Bar
                        dataKey="spending"
                        name="Spending"
                        fill="#C65D21"
                        radius={[6, 6, 0, 0]}
                    />


                </BarChart>

            </ResponsiveContainer>
        </section>
    );
}

export default SpendingChart;