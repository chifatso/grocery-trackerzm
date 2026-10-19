
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

import SpendingHistory from "../components/SpendingHistory";
import SpendingChart from "../components/SpendingChart";

function SpendingHistoryPage() {

    // Store the monthly spending records
    const [spendingHistory, setSpendingHistory] = useState([]);

    // Track loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadSpendingHistory() {
            try {
                setLoading(true);

                // Fetch spending history from Django
                const data = await apiRequest(
                    "/spending/history/"
                );

                setSpendingHistory(data);

            } catch (err) {
                console.error(err);
                setError("Unable to load spending history.");
            } finally {
                setLoading(false);
            }
        }

        loadSpendingHistory();

    }, []);

    if (loading) {
        return <p>Loading spending history...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="spending-history-page">

            <h1>Spending History</h1>

            <p>
                Track and compare your monthly grocery
                spending over time.
            </p>

            {/* Monthly spending records */}
            <SpendingHistory history={spendingHistory} />

            {/* Monthly spending chart */}
            <SpendingChart history={spendingHistory} />

        </div>
    );
}

export default SpendingHistoryPage;
