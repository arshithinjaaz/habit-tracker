import React from "react";

function Questionnaire() {
  const questions = [
    "Did you have coffee more than three times today?",
    "Did you do any dirty work today?",
    "Did you clean your room?",
    "Were you angry today?",
    "Were you kind to someone today?",
  ];

  const handleSubmit = () => {
    alert("Responses submitted!");
  };

  return (
    <div className="p-4 bg-white shadow rounded mb-4">
      <h2 className="text-lg font-medium mb-2">Habit Tracker</h2>
      {questions.map((question, index) => (
        <div key={index} className="mb-2">
          <label className="block text-sm">{question}</label>
          <select className="border rounded px-3 py-2 w-full">
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      >
        Submit
      </button>
    </div>
  );
}

export default Questionnaire;