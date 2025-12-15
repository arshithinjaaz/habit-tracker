import React, { useState } from "react";

function MemoryLogger() {
  const [memory, setMemory] = useState("");

  const handleSave = () => {
    alert(`Memory saved: ${memory}`);
    setMemory("");
  };

  return (
    <div className="p-4 bg-white shadow rounded mb-4">
      <label className="block mb-2 text-sm font-bold">Valuable Memory:</label>
      <textarea
        value={memory}
        onChange={(e) => setMemory(e.target.value)}
        className="border rounded px-3 py-2 w-full"
        placeholder="What was the highlight of your day?"
        rows="3"
      />
      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
      >
        Save
      </button>
    </div>
  );
}

export default MemoryLogger;