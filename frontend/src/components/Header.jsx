import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Header({ text }) {
  const navigate = useNavigate();
  
  return (
    <div className="w-full sm:max-w-xl mx-auto mb-6 sm:mb-8">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-200">
          truth or opinions?
        </h1>
        <motion.div
          className="w-[100px] sm:w-[120px]"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        >
          <motion.button
            onClick={() => navigate("/form")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[#313131] text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg hover:bg-[#323232] transition cursor-pointer font-semibold text-xs sm:text-base"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="block"
              >
                {text}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default Header;
