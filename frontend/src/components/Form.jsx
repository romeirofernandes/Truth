import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function Form() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    teacherName: "",
    feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = formData.teacherName.trim();
    const trimmedFeedback = formData.feedback.trim();

    if (!trimmedName || !trimmedFeedback || isLoading) return;

    if (trimmedFeedback.length < 10) {
      setError("Feedback must be at least 10 characters long");
      return;
    }

    setIsLoading(true);
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "opinions"), {
        createdAt: serverTimestamp(),
        teacherName: trimmedName,
        feedback: trimmedFeedback,
        upvotes: 0,
        downvotes: 0,
        votedUsers: [],
        userId: localStorage.getItem("userId") || "guest",
      });

      setFormData({ teacherName: "", feedback: "" });
      navigate("/");
    } catch (error) {
      setIsSubmitting(false);
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  }, [formData, navigate, isLoading]);

  const handleInputChange = useCallback((e, field) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value.trimStart()
    }));
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 min-h-[100dvh]"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-[#313131] text-white p-2 rounded-lg hover:bg-[#3a3a3a] transition cursor-pointer shadow-lg"
        >
          <X className="w-5 h-5" />
        </motion.button>

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-[#313131] p-6 rounded-xl shadow-xl w-full max-w-[95vw] sm:max-w-md border border-gray-700/50"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-200 flex items-center">
            <span className="bg-gradient-to-r from-[#4a7eff] to-[#3a6eff] text-transparent bg-clip-text">Share Your Truth</span>
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm sm:text-base text-red-400 mb-4 p-3 bg-red-900/20 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm sm:text-base text-gray-300 font-medium">
                Your Opinion
              </label>
              <textarea
                value={formData.feedback}
                onChange={(e) => handleInputChange(e, 'feedback')}
                className="w-full p-3 border rounded-lg bg-[#3a3a3a] text-white border-gray-700 text-sm sm:text-base focus:ring-2 focus:ring-[#4a7eff]/50 focus:border-transparent resize-none transition duration-200"
                placeholder="Share your thoughts..."
                rows={4}
                style={{ minHeight: '120px' }}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm sm:text-base text-gray-300 font-medium">
                Your Name
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => handleInputChange(e, 'teacherName')}
                className="w-full p-3 border rounded-lg bg-[#3a3a3a] text-white border-gray-700 text-sm sm:text-base focus:ring-2 focus:ring-[#4a7eff]/50 focus:border-transparent transition duration-200"
                placeholder="Enter name"
                disabled={isLoading}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting || !formData.teacherName.trim() || !formData.feedback.trim() || isLoading}
              className="w-full bg-gradient-to-r from-[#4a7eff] to-[#3a6eff] text-white p-3 rounded-lg transition cursor-pointer text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                "Share Truth"
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Form;
