
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

import GroceryList from "./GroceryList";
import CreateGroceryList from "./CreateGroceryList";
import CreateGroceryItem from "./CreateGroceryItem";

function GroceryManager({ onSpendingChange }) {
    // Store the user's grocery lists.
    const [groceryLists, setGroceryLists] = useState([]);

    // Store the name of the new grocery list.
    const [newListName, setNewListName] = useState("");

    // Generate a default name for the current month.
    const currentDate = new Date();

    const suggestedListName = `${currentDate.toLocaleString(
        "en-US",
        { month: "long" }
    )} ${currentDate.getFullYear()} Groceries`;

    // Track list creation.
    const [creatingList, setCreatingList] = useState(false);

    // Track loading and errors.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // New grocery item states.
    const [selectedListId, setSelectedListId] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [creatingItem, setCreatingItem] = useState(false);

    // Store prices entered before purchasing.
    const [itemPrices, setItemPrices] = useState({});

    // Track the item currently being purchased.
    const [purchasingItem, setPurchasingItem] = useState(null);

    // Track item editing.
    const [editingItem, setEditingItem] = useState(null);
    const [editName, setEditName] = useState("");
    const [editQuantity, setEditQuantity] = useState(1);
    const [editPrice, setEditPrice] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    // Track deletion.
    const [deletingItem, setDeletingItem] = useState(null);
    const [deletingList, setDeletingList] = useState(null);

    // ----------------------------------------
    // LOAD GROCERY LISTS
    // ----------------------------------------

    async function loadGroceryLists() {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest("/grocery-lists/");

            // Support normal and paginated DRF responses.
            const lists = Array.isArray(data)
                ? data
                : data?.results || [];

            setGroceryLists(lists);

            // Select the first list if none is selected.
            setSelectedListId((previousId) => {
                const stillExists = lists.some(
                    (list) => String(list.id) === String(previousId)
                );

                return stillExists
                    ? previousId
                    : lists.length > 0
                        ? String(lists[0].id)
                        : "";
            });

        } catch (err) {
            console.error("Error loading grocery lists:", err);
            setError(
                err.message || "Unable to load grocery lists."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadGroceryLists();
    }, []);

    // Notify the dashboard after spending changes.
    function notifySpendingChange() {
        if (typeof onSpendingChange === "function") {
            onSpendingChange();
        }
    }

    // ----------------------------------------
    // CREATE GROCERY LIST
    // ----------------------------------------

    async function handleCreateList() {
        const name = newListName.trim() || suggestedListName;

        try {
            setCreatingList(true);
            setError("");

            const newList = await apiRequest(
                "/grocery-lists/",
                {
                    method: "POST",
                    body: JSON.stringify({ name }),
                }
            );

            setNewListName("");

            await loadGroceryLists();

            if (newList?.id) {
                setSelectedListId(String(newList.id));
            }

            notifySpendingChange();

        } catch (err) {
            console.error("Error creating grocery list:", err);
            setError(
                err.message || "Unable to create grocery list."
            );
        } finally {
            setCreatingList(false);
        }
    }

    // ----------------------------------------
    // CREATE GROCERY ITEM
    // ----------------------------------------

    async function handleCreateItem() {
        if (!selectedListId) {
            setError("Please select a grocery list.");
            return;
        }

        if (!newItemName.trim()) {
            setError("Please enter an item name.");
            return;
        }

        const quantity = Number(newItemQuantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            setError("Quantity must be a positive whole number.");
            return;
        }

        try {
            setCreatingItem(true);
            setError("");

            await apiRequest("/grocery-items/", {
                method: "POST",
                body: JSON.stringify({
                    grocery_list: Number(selectedListId),
                    name: newItemName.trim(),
                    quantity,
                }),
            });

            setNewItemName("");
            setNewItemQuantity(1);

            await loadGroceryLists();

        } catch (err) {
            console.error("Error creating grocery item:", err);
            setError(
                err.message || "Unable to create grocery item."
            );
        } finally {
            setCreatingItem(false);
        }
    }

    // ----------------------------------------
    // HANDLE ITEM PRICE
    // ----------------------------------------

    function handlePriceChange(itemId, price) {
        setItemPrices((previous) => ({
            ...previous,
            [itemId]: price,
        }));
    }

    // ----------------------------------------
    // MARK ITEM AS PURCHASED
    // ----------------------------------------

    async function handlePurchaseItem(item) {
        const priceValue = itemPrices[item.id];
        const price = Number(priceValue);

        if (
            priceValue === undefined ||
            priceValue === null ||
            String(priceValue).trim() === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setError("Please enter a valid price before purchasing.");
            return;
        }

        try {
            setPurchasingItem(item.id);
            setError("");

            await apiRequest(`/grocery-items/${item.id}/`, {
                method: "PATCH",
                body: JSON.stringify({
                    price: price.toFixed(2),
                    purchased: true,
                }),
            });

            setItemPrices((previous) => {
                const updated = { ...previous };
                delete updated[item.id];
                return updated;
            });

            await loadGroceryLists();
            notifySpendingChange();

        } catch (err) {
            console.error("Error purchasing grocery item:", err);
            setError(
                err.message || "Unable to mark item as purchased."
            );
        } finally {
            setPurchasingItem(null);
        }
    }

    // ----------------------------------------
    // START EDITING AN ITEM
    // ----------------------------------------

    function handleEditItem(item) {
        setEditingItem(item.id);
        setEditName(item.name);
        setEditQuantity(item.quantity);
        setEditPrice(item.price ?? "");
        setError("");
    }

    // ----------------------------------------
    // SAVE EDITED ITEM
    // ----------------------------------------

    async function handleSaveEdit(item) {
        if (!editName.trim()) {
            setError("Item name cannot be empty.");
            return;
        }

        const quantity = Number(editQuantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            setError("Quantity must be a positive whole number.");
            return;
        }

        const price = Number(editPrice);

        if (
            editPrice !== "" &&
            (!Number.isFinite(price) || price < 0)
        ) {
            setError("Please enter a valid price.");
            return;
        }

        try {
            setSavingEdit(true);
            setError("");

            const payload = {
                name: editName.trim(),
                quantity,
            };

            // Include price only when one has been entered.
            if (editPrice !== "") {
                payload.price = price.toFixed(2);
            }

            await apiRequest(`/grocery-items/${item.id}/`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });

            handleCancelEdit();

            await loadGroceryLists();
            notifySpendingChange();

        } catch (err) {
            console.error("Error updating grocery item:", err);
            setError(
                err.message || "Unable to update grocery item."
            );
        } finally {
            setSavingEdit(false);
        }
    }

    // ----------------------------------------
    // CANCEL EDITING
    // ----------------------------------------

    function handleCancelEdit() {
        setEditingItem(null);
        setEditName("");
        setEditQuantity(1);
        setEditPrice("");
    }

    // ----------------------------------------
    // DELETE GROCERY ITEM
    // ----------------------------------------

    async function handleDeleteItem(item) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${item.name}"?`
        );

        if (!confirmed) return;

        try {
            setDeletingItem(item.id);
            setError("");

            await apiRequest(`/grocery-items/${item.id}/`, {
                method: "DELETE",
            });

            await loadGroceryLists();
            notifySpendingChange();

        } catch (err) {
            console.error("Error deleting grocery item:", err);
            setError(
                err.message || "Unable to delete grocery item."
            );
        } finally {
            setDeletingItem(null);
        }
    }

    // ----------------------------------------
    // DELETE GROCERY LIST
    // ----------------------------------------

    async function handleDeleteList(list) {
        const confirmed = window.confirm(
            `Delete "${list.name}" and all its grocery items?`
        );

        if (!confirmed) return;

        try {
            setDeletingList(list.id);
            setError("");

            await apiRequest(`/grocery-lists/${list.id}/`, {
                method: "DELETE",
            });

            await loadGroceryLists();
            notifySpendingChange();

        } catch (err) {
            console.error("Error deleting grocery list:", err);
            setError(
                err.message || "Unable to delete grocery list."
            );
        } finally {
            setDeletingList(null);
        }
    }

    // ----------------------------------------
    // RENDER COMPONENT
    // ----------------------------------------

    return (
        <div className="grocery-manager">


            {/* Display errors */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loading ? (
                <p>Loading grocery lists...</p>
            ) : (
                <>
                    {/* CREATE GROCERY LIST */}
                    <section id="create-grocery-list">

                        <CreateGroceryList
                            newListName={newListName}
                            onNameChange={setNewListName}
                            onCreate={handleCreateList}
                            creating={creatingList}
                            suggestedListName={suggestedListName}
                        />
                    </section>

                    {/* CREATE GROCERY ITEM */}
                    {groceryLists.length > 0 && (
                        <section id="create-grocery-item">

                            <CreateGroceryItem
                                groceryLists={groceryLists}
                                selectedListId={selectedListId}
                                onListChange={setSelectedListId}
                                itemName={newItemName}
                                onItemNameChange={setNewItemName}
                                quantity={newItemQuantity}
                                onQuantityChange={setNewItemQuantity}
                                onCreate={handleCreateItem}
                                creating={creatingItem}
                            />
                        </section>
                    )}

                    {/* DISPLAY GROCERY LISTS */}
                    <section id="grocery-lists">
                        <h2>My Grocery Lists</h2>

                        {groceryLists.length === 0 ? (
                            <p>
                                You do not have any grocery lists yet.
                            </p>
                        ) : (
                            groceryLists.map((list) => (
                                <GroceryList
                                    key={list.id}
                                    list={list}
                                    itemPrices={itemPrices}
                                    onPriceChange={handlePriceChange}
                                    onPurchase={handlePurchaseItem}
                                    purchasingItem={purchasingItem}
                                    editingItem={editingItem}
                                    editName={editName}
                                    editQuantity={editQuantity}
                                    editPrice={editPrice}
                                    onEdit={handleEditItem}
                                    onEditNameChange={setEditName}
                                    onEditQuantityChange={setEditQuantity}
                                    onEditPriceChange={setEditPrice}
                                    onSaveEdit={handleSaveEdit}
                                    onCancelEdit={handleCancelEdit}
                                    savingEdit={savingEdit}
                                    onDelete={handleDeleteItem}
                                    onDeleteList={handleDeleteList}
                                    deletingItem={deletingItem}
                                    deletingList={deletingList}
                                />
                            ))
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default GroceryManager;
