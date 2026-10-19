function MonthlyComparison({ comparison }){

    // Don't display the section until
    // comparison data has loaded.
    if(!comparison){
        return null;
    }

    return (

        <section>

            <h2>
                Monthly Comparison
            </h2>

            <p>
                Current month:
                {" "}
                {comparison.current_month.month}
            </p>

            <p>
                Current total:
                {" "}
                ZMW {comparison.current_month.total}
            </p>

            <p>
                Previous month:
                {" "}
                {comparison.previous_month.month}
            </p>

            <p>
                Previous total:
                {" "}
                ZMW {comparison.previous_month.total}
            </p>

            <p>
                Difference:
                {" "}
                ZMW {comparison.difference}
            </p>

            <p>
                Percentage change:
                {" "}

                {comparison.percentage_change !== null
                   ? `${comparison.percentage_change}%`
                   : "No previous spending data"
                }
            </p>
        </section>
    );
}

export default MonthlyComparison;