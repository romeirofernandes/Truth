import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { cleanupDatabase } from './utils/cleanupDb';
import Header from './components/Header';

const Form = lazy(() => import("./components/Form"));
const Truth = lazy(() => import("./components/Truth"));

function App() {
  const [text, setText] = useState("truth");

  useEffect(() => {
    const interval = setInterval(() => {
      setText((prev) => (prev === "truth" ? "opinion" : "truth"));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    cleanupDatabase();
    const cleanupInterval = setInterval(() => {
      cleanupDatabase();
    }, 2 * 24 * 60 * 60 * 1000);
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white w-full">
      <div className="w-full min-h-screen px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="w-full max-w-4xl mx-auto">
          <Header text={text} />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-200"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Truth />} />
              <Route path="/form" element={<Form />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default App;
