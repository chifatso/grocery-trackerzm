
function GroceryItem({
    item,
    listId,
    price,
    onPriceChange,
    onPurchase,
    purchasing,
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
}) {

    // Display the edit form.
    if (editingItem === item.id) {
        return (
            <li className="grocery-item grocery-item-editing">
                <div className="grocery-edit-form">
                    <input
                        type="text"
                        aria-label="Item name"
                        value={editName}
                        onChange={(event) =>
                            onEditNameChange(event.target.value)
                        }
                    />

                    <input
                        type="number"
                        min="1"
                        aria-label="Quantity"
                        value={editQuantity}
                        onChange={(event) =>
                            onEditQuantityChange(event.target.value)
                        }
                    />

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        aria-label="Price"
                        value={editPrice}
                        onChange={(event) =>
                            onEditPriceChange(event.target.value)
                        }
                    />

                    <div className="grocery-item-actions">
                        <button
                            className="grocery-save-btn"
                            onClick={() => onSaveEdit(item)}
                            disabled={savingEdit}
                        >
                            {savingEdit ? "Saving..." : "Save"}
                        </button>

                        <button
                            className="grocery-cancel-btn"
                            onClick={onCancelEdit}
                            disabled={savingEdit}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </li>
        );
    }

    // Display a purchased item.
    if (item.purchased) {
        return (
            <li className="grocery-item grocery-item-purchased">
                <div className="grocery-item-info">
                    <div className="grocery-item-name">
                        <i
                            className="bi bi-check-circle-fill purchase-check-icon"
                            title="Purchased"
                            role="img"
                            aria-label="Purchased"
                        ></i>

                        <strong>{item.name}</strong>
                    </div>

                    <span className="grocery-item-details">
                        Quantity: {item.quantity}
                    </span>

                    <span className="grocery-item-price">
                        ZMW {item.price}
                    </span>
                </div>

                <div className="grocery-item-actions">
                    <button
                        className="grocery-edit-btn"
                        onClick={() => onEdit(item)}
                        title="Edit item"
                        aria-label={`Edit ${item.name}`}
                    >
                        <i className="bi bi-pencil-square"></i>
                    </button>

                    <button
                        className="grocery-delete-btn"
                        onClick={() => onDelete(item.id)}
                        title="Delete item"
                        aria-label={`Delete ${item.name}`}
                    >
                        <i className="bi bi-trash3"></i>
                    </button>
                </div>
            </li>
        );
    }

    // Display an item that has not been purchased.
    return (
        <li className="grocery-item grocery-item-pending">
            <div className="grocery-item-info">
                <strong>{item.name}</strong>

                <span className="grocery-item-details">
                    Quantity: {item.quantity}
                </span>

                <span className="grocery-pending-status">
                    Pending
                </span>
            </div>

            <div className="grocery-item-controls">
                <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Enter price"
                    aria-label={`Price for ${item.name}`}
                    value={price ?? ""}
                    onChange={(event) =>
                        onPriceChange(
                            item.id,
                            event.target.value
                        )
                    }
                />

                <button
    className="grocery-purchase-btn"
    onClick={() => onPurchase(item)}
    disabled={purchasing}
>
    {purchasing
        ? "Purchasing..."
        : "Mark Purchased"}
</button>
            </div>

            <div className="grocery-item-actions">
                <button
                    className="grocery-edit-btn"
                    onClick={() => onEdit(item)}
                    title="Edit item"
                    aria-label={`Edit ${item.name}`}
                >
                    <i className="bi bi-pencil-square"></i>
                </button>

                <button
                    className="grocery-delete-btn"
                    onClick={() => onDelete(item.id)}
                    title="Delete item"
                    aria-label={`Delete ${item.name}`}
                >
                    <i className="bi bi-trash3"></i>
                </button>
            </div>
        </li>
    );
}

export default GroceryItem;
