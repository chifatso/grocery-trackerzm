function CreateGroceryList({
    newListName,
    onNameChange,
    onCreate,
    creating,
    suggestedListName,
}) {
    return (
        <form onSubmit={onCreate}>

            <h3>
                Create Grocery List
            </h3>
        

        <input 
           type="text"
           placeholder={`e.g. ${suggestedListName}`}
           value={newListName}
           onChange={(event) => 
               onNameChange(event.target.value)
           }
           required
        />

        <button 
            type="submit"
            disabled={creating}
        >
            {creating
                ? "Creating..."
                : "Create List"
            }
    

        </button>
    </form>
    );
}

export default CreateGroceryList;