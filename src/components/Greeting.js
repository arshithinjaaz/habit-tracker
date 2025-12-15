import React, { useState } from "react";

function Greeting() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="p-4 bg-white shadow rounded mb-4">
      {submitted ? (
        <h2 className="text-lg font-medium">
          Hello, {name}! Let's start tracking your day.
        </h2>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-bold">Your Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded px-3 py-2 w-full mb-2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Submit
          </button>
        </form>
      )}
    </div>
  );
}

export default Greeting;