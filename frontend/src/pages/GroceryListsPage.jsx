import GroceryManager from "../components/GroceryManager";

function GroceryListsPage() {
    return (
        <div className="grocery-lists-page">
            <h1>My Grocery Lists</h1>
            <p>Create lists, add grocery items, manage prices, and track purchases.</p>
            <GroceryManager />
        </div>
    );
}

export default GroceryListsPage;
