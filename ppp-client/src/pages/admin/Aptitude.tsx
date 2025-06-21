import { useState } from "react";
import AptitudeQuestions from "./AptitudeQuestions";
import AptitudeResponses from "./AptitudeResponses";

const Aptitude = () => {
  const [tab, setTab] = useState(1);

  return (
    <div className="container mx-auto px-2 py-5">
      {/* Tab Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg border-2 transition-colors duration-300 ${
            tab === 1
              ? "bg-primary text-gray-700 font-bold border-primary"
              : "bg-white text-gray-400  border-gray-200 hover:border-gray-400"
          }`}
          onClick={() => setTab(1)}
          aria-selected={tab === 1}
          role="tab"
        >
          Questions
        </button>
        <button
          className={`px-4 py-2 rounded-lg border-2 transition-colors duration-300 ${
            tab === 2
              ? "bg-primary text-gray-700 font-bold border-primary"
              : "bg-white text-gray-400  border-gray-200 hover:border-gray-400"
          }`}
          onClick={() => setTab(2)}
          aria-selected={tab === 2}
          role="tab"
        >
          Responses
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {tab === 1 && (
          <div className="block transition-opacity duration-300 opacity-100">
            <AptitudeQuestions />
          </div>
        )}
        {tab === 2 && (
          <div className="block transition-opacity duration-300 opacity-100">
            <AptitudeResponses />
          </div>
        )}
      </div>
    </div>
  );
};

export default Aptitude;
