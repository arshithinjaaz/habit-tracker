import React from "react";
import Greeting from "./components/Greeting";
import MemoryLogger from "./components/MemoryLogger";
import Questionnaire from "./components/Questionnaire";
import Graph from "./components/Graph";

function App() {
  return (
    <div className="App bg-gray-50 min-h-screen p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Habit Tracker</h1>
      <Greeting />
      <MemoryLogger />
      <Questionnaire />
      <Graph />
    </div>
  );
}

export default App;