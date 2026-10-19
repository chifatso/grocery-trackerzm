import { Link } from "react-router-dom";

function QuickNavigation() {

    const navigationItems = [
        {
            title: "Grocery Lists",
            description: "Create lists and manage your grocery items.",
            icon: "bi bi-cart3",
            path: "/grocery-lists",
        },
        {
            title: "Spending History",
            description: "View your monthly spending trends.",
            icon: "bi bi-bar-chart",
            path: "/spending-history",
        },
        {
            title: "Budget & Spending",
            description: "Manage your budget and track expenses.",
            icon: "bi bi-wallet-fill",
            path: "/budget-spending",

        },
    ];

    return (
        <section className="quick-navigation">

            <h2>Quick Access</h2>

            <div className="quick-navigation-grid">

                {navigationItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="quick-navigation-card"
                    >
                        <div className="quick-navigation-icon">
                            <i className={item.icon}></i>

                        </div>

                        <div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>

                        <i className="bi bi-arrow-right quick-navigation-arrow"></i>
                       
                    </Link>
                ))}

            </div>

        </section>
    );
}

export default QuickNavigation;