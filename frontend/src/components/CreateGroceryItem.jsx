function CreateGroceryItem({
    groceryLists,
    selectedListId,
    onListChange,
    itemName,
    onItemNameChange,
    quantity,
    onQuantityChange,
    onCreate,
    creating,
}) {

    // Don't show the form if there are no
    // grocery lists to add an item to.
    if(groceryLists.length === 0){
        return null;
    }

    return (

        <form onSubmit={onCreate}>

            <h3>
                Add Grocery Item
            </h3>

            {/* Select the grocery list. */}

            <select 
                value={selectedListId}
                onChange={(event) => 
                    onListChange(event.target.value)
                }
                required
            >
                <option value="">
                    Select a grocery list
                </option>

                {groceryLists.map((list) => {
                    const createdDate = new Date(list.created_at);
                    const today = new Date();

                    const isPreviousMonth = 
                        createdDate.getFullYear() !== today.getFullYear() ||
                        createdDate.getMonth() !== today.getMonth();

                    return (
                        <option 
                           key={list.id}
                           value={list.id}
                           disabled={isPreviousMonth}
                           >
                            {list.name}
                            {isPreviousMonth ? "(Closed)": ""}
                        </option>
                    );
                })}

            </select>

            {/* Enter the item name. */}

            <input 

                type="text" 
                placeholder="Item name"
                value={itemName}
                onChange={(event) => 
                    onItemNameChange(event.target.value)
                }
                required
            />

            {/* Enter the quantity. */}

            <input 
                type="text"
                min="1"
                value={quantity}
                onChange={(event) => 
                    onQuantityChange(event.target.value)
                }
                required
            />

            <button
                type="submit"
                disabled={creating}
            >
                {creating
                    ? "Adding..."
                    : "Add Item"

                }

            </button>
        </form>
    );
}

export default CreateGroceryItem;