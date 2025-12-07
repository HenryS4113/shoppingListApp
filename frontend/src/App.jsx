import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [important, setImportant] = useState(1);
  const [itemQuantity, setQuantity] = useState("");
  const [itemPurchased, setPurchased] = useState(false);
  const [orderBy, setOrderBy] = useState("name");

  const baseUrl = "http://localhost:3001/api/items";

  // Determines label for each priority level
  const importanceLevel = [
    { value: 1, label: "Low" },
    { value: 2, label: "Medium" },
    { value: 3, label: "High" },
  ];

  // Fetch items from backend on first load
  useEffect(() => {
    axios.get(baseUrl).then((response) => {
      setItems(response.data);
    });
  }, []);

  // Adds a new item to the list
  const addItem = (e) => {
    e.preventDefault();

    const itemObject = {
      content: newItem,
      important: important,
      quantity: itemQuantity,
      purchased: itemPurchased,
      dateAdded: new Date().toISOString(),
    };

    axios.post(baseUrl, itemObject).then((response) => {
      setItems(items.concat(response.data));
      setNewItem("");
      setImportant(1);
      setQuantity("");
      setPurchased(false);
    });
  };

  // Sorting logic depending on dropdown selection
  const sortOrder = (a, b) => {
    switch (orderBy) {
      case "name":
        return a.content.localeCompare(b.content);
      case "priorityLow":
        return a.important - b.important;
      case "priorityHigh":
        return b.important - a.important;
      case "purchased":
        return b.purchased - a.purchased;
      case "date":
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      default:
        return 0;
    }
  };

  // Sorted version of items
  const sortedItems = [...items].sort(sortOrder);

  // Toggle purchased status
  const togglePurchased = (id, currentValue) => {
    axios
      .put(`${baseUrl}/${id}`, {
        purchased: !currentValue,
      })
      .then(() => {
        setItems(
          items.map((item) =>
            item.id === id ? { ...item, purchased: !currentValue } : item
          )
        );
      });
  };

  // Deletes all purchased items
  const deletePurchased = () => {
    setItems(items.filter((item) => !item.purchased));
    items.forEach((item) => {
      if (item.purchased) axios.delete(`${baseUrl}/${item.id}`);
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 font-sans bg-green-800">
      <h1 className="text-3xl font-bold mb-6 text-center">Lets Go Shopping!</h1>

      {/* Shopping List */}
      <ul className="space-y-3 mb-8">
        {sortedItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between bg-gray-200 shadow p-4 rounded-lg border border-gray-200"
          >
            <div>
              <p className="font-medium">{item.content}</p>
              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>

              <p className="text-sm font-semibold italic">
                <span
                  className={
                    item.important === 1
                      ? "text-yellow-500"
                      : item.important === 2
                      ? "text-orange-500"
                      : "text-red-500"
                  }
                >
                  {importanceLevel
                    .find((l) => l.value === item.important)
                    .label.toUpperCase()}
                </span>{" "}
                priority
              </p>
            </div>

            <input
              type="checkbox"
              checked={item.purchased}
              onChange={() => togglePurchased(item.id, item.purchased)}
              className="w-5 h-5 accent-green-600"
            />
          </li>
        ))}
      </ul>

      {/* Sorting Dropdown */}
      <div className="text-xl font-bold mb-3">
        Order By:
        <select
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
          className="ml-2 p-1 border bg-gray-300 hover:bg-gray-400 rounded-md"
        >
          <option value="name">Name</option>
          <option value="priorityLow">Priority Low</option>
          <option value="priorityHigh">Priority High</option>
          <option value="purchased">Purchased</option>
          <option value="date">Date Added</option>
        </select>
      </div>

      {/* Delete purchased items */}
      <div className="text-xl font-bold mb-3">
        Finished your shopping?
        <br />
        <br />
        <button
          onClick={deletePurchased}
          className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition"
        >
          Delete
        </button>
        <br />
        <br />
      </div>

      {/* Add New Item */}
      <h1 className="text-xl font-bold mb-3 bg-green-800">Add a new Item</h1>

      <form
        onSubmit={addItem}
        className="bg-white shadow p-6 rounded-lg border border-gray-200 space-y-4"
      >
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          required
          className="w-full p-2 border rounded-md"
          placeholder="New Item..."
        />

        <input
          type="number"
          value={itemQuantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="w-full p-2 border rounded-md"
          placeholder="How many...?"
        />

        <label>
          Priority:
          <select
            value={important}
            onChange={(e) => setImportant(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          >
            {importanceLevel.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <br />
        </label>
        <br />
        <br />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Save New Item
        </button>
      </form>
    </div>
  );
}

export default App;
