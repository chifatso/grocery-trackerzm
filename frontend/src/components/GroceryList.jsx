
import { useState } from "react";
import GroceryItem from "./GroceryItem";

function GroceryList({
    list,
    itemPrices,
    onPriceChange,
    onPurchase,
    purchasingItem,
    editingItem,
    editName,
    editQuantity,
    editPrice,
    onEdit,
    onEditNameChange,
    onEditQuantityChange,
    onEditPriceChange,
    onSaveEdit,
    onCancelEdit,
    savingEdit,
    onDelete,
    onDeleteList,
    deletingList,
    onRenameList,
    renamingList,
}) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState("");

    if (!list) {
        return null;
    }

    const createdDate = new Date(list.created_at);
    const today = new Date();

    const isPreviousMonth =
        createdDate.getFullYear() !== today.getFullYear() ||
        createdDate.getMonth() !== today.getMonth();

    function handleStartRename() {
        setNewName(list.name);
        setIsEditingName(true);
    }

    async function handleSaveRename() {
        const name = newName.trim();

        if (!name || name === list.name) {
            if (name === list.name) {
                setIsEditingName(false);
            }
            return;
        }

        const success = await onRenameList(list.id, name);

        if (success) {
            setIsEditingName(false);
        }
    }

    return (
        <div className="grocery-list-card">

            {/* GROCERY LIST HEADER */}
            <div className="grocery-list-header">

                {isEditingName ? (
                    <div className="grocery-list-rename">

                        <input
                            type="text"
                            value={newName}
                            onChange={(e) =>
                                setNewName(e.target.value)
                            }
                            maxLength={100}
                            aria-label="Grocery list name"
                        />

                        <button
                            type="button"
                            className="grocery-save-btn"
                            onClick={handleSaveRename}
                            disabled={
                                renamingList === list.id ||
                                !newName.trim()
                            }
                        >
                            {renamingList === list.id
                                ? "Saving..."
                                : "Save"}
                        </button>

                        <button
                            type="button"
                            className="grocery-cancel-btn"
                            onClick={() => setIsEditingName(false)}
                            disabled={renamingList === list.id}
                        >
                            Cancel
                        </button>

                    </div>
                ) : (
                    <div className="grocery-list-title-row">

                        <h3>{list.name}</h3>

                        
<div className="grocery-list-actions">
    <button
        type="button"
        className="grocery-edit-btn"
        onClick={handleStartRename}
        title="Rename grocery list"
        aria-label={`Rename ${list.name}`}
    >
        <i className="bi bi-pencil-square"></i>
    </button>

    <button
        type="button"
        className="grocery-delete-btn"
        onClick={() => onDeleteList(list)}
        disabled={deletingList === list.id}
        title="Delete grocery list"
        aria-label={`Delete ${list.name}`}
    >
        {deletingList === list.id ? (
            "Deleting..."
        ) : (
            <i className="bi bi-trash3"></i>
        )}
    </button>
</div>

                    </div>
                )}

            </div>

            {/* LIST MONTH STATUS */}
            {isPreviousMonth ? (
                <p>
                    This list is from a previous month.
                    You cannot add new items to it.
                </p>
            ) : (
                <p>Current month's list</p>
            )}

            {/* GROCERY ITEMS */}
            {list.items && list.items.length > 0 ? (
                <ul>
                    {list.items.map((item) => (
                        <GroceryItem
                            key={item.id}
                            item={item}
                            listId={list.id}
                            price={itemPrices[item.id]}
                            onPriceChange={onPriceChange}
                            onPurchase={onPurchase}
                            purchasing={
                                purchasingItem === item.id
                            }
                            editingItem={editingItem}
                            editName={editName}
                            editQuantity={editQuantity}
                            editPrice={editPrice}
                            onEdit={onEdit}
                            onEditNameChange={onEditNameChange}
                            onEditQuantityChange={
                                onEditQuantityChange
                            }
                            onEditPriceChange={onEditPriceChange}
                            onSaveEdit={onSaveEdit}
                            onCancelEdit={onCancelEdit}
                            savingEdit={savingEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            ) : (
                <p>No items in this list yet.</p>
            )}

        </div>
    );
}

export default GroceryList;
