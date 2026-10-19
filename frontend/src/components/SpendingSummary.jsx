function SpendingSummary({ spending }) {

    // If spending data hasn't loaded yet,
    // do not display anything
    if(!spending) {
        return null;
    }

    return (

        <section>

            <h2>
                {spending.month}
            </h2>

            <p>
                Total spent:
                {" "}
                ZMW {spending.total_spent}
            </p>

            <p>
                Items purchased:
                {" "}
                {spending.items_purchased}
            </p>
        </section>
    );
}

export default SpendingSummary;