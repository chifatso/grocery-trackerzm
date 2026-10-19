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
 }) {

    // Make sure the grocery list exists
    if(!list) {
        return null;
    }

    return (
        <div>

            <h3>
                {list.name}
            </h3>

            {/* Show whether this list belongs to an earlier month */}
            {(() => {
                const createDate = new Date(list.created_at);
                const today = new Date();

                const isPreviousMonth = 
                     createdDate.getFullYear() !== today.getFullYear() ||
                     createdDate.getMonth() !== today.getMonth();

                return isPreviousMonth ? (
                    <p>
                        This list is from a previous month.
                        You cannot add new items to it.
                    </p>
                ): (
                    <p>Current month's list</p>
                );
            })}

            {/* Display items belonging to this grocery list. */}

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
                           onEditQuantityChange={onEditQuantityChange}
                           onEditPriceChange={onEditPriceChange}
                           onSaveEdit={onSaveEdit}
                           onCancelEdit={onCancelEdit}
                           savingEdit={savingEdit}
                           onDelete={onDelete}
                         />
                    ))}
                </ul>
            ) : (
                <p>
                    No items in this list yet.
                </p>
            )}
        </div>
    );
}

export default GroceryList;