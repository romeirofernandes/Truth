import { useEffect, useState, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, query, orderBy, arrayRemove, arrayUnion } from "firebase/firestore";

const getUserId = () => {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36)}`;
    localStorage.setItem("userId", userId);
  }
  return userId;
};

const OpinionCard = memo(({ op, userVotes, onVote, onDoubleTap }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        layout: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 },
        y: { duration: 0.2 }
      }}
      onTouchStart={() => onDoubleTap(op.id)}
      onDoubleClick={() => onVote(op.id, "upvotes")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full overflow-hidden p-4 sm:p-6 transition-all duration-200 cursor-pointer rounded-xl mb-6 ${
        isHovered ? 'bg-[#252525]' : 'bg-[#1a1a1a]'
      }`}
    >
      <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-2 break-words leading-relaxed">
        {op.feedback}
      </p>
      <p className="text-gray-400 text-xs sm:text-sm mb-1">
        {op.teacherName}
      </p>
      {op.createdAt && (
        <p className="text-gray-500 text-[10px] sm:text-xs mb-2">
          {new Date(op.createdAt.toDate()).toLocaleString()}
        </p>
      )}
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onVote(op.id, "upvotes");
          }}
          className={`flex items-center space-x-1 transition-colors cursor-pointer touch-manipulation ${
            userVotes[op.id] === "upvotes"
              ? "text-green-500"
              : "text-gray-400 hover:text-green-500"
          }`}
        >
          <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm min-w-[16px] sm:min-w-[20px]">
            {op.upvotes}
          </span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onVote(op.id, "downvotes");
          }}
          className={`flex items-center space-x-1 transition-colors cursor-pointer touch-manipulation ${
            userVotes[op.id] === "downvotes"
              ? "text-red-500"
              : "text-gray-400 hover:text-red-500"
          }`}
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm min-w-[16px] sm:min-w-[20px]">
            {op.downvotes}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
});

function Truth() {
  const [opinions, setOpinions] = useState([]);
  const [toast, setToast] = useState(null);
  const [userVotes, setUserVotes] = useState(() => {
    return JSON.parse(localStorage.getItem("userVotes")) || {};
  });
  const lastTapTimeRef = useRef({});

  useEffect(() => {
    const q = query(collection(db, "opinions"), orderBy("upvotes", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOpinions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOpinions(newOpinions);
    });
    return () => unsubscribe();
  }, []);

  const handleVote = useCallback(
    async (id, type) => {
      const userId = getUserId();
      const currentVote = userVotes[id];

      try {
        const opinionRef = doc(db, "opinions", id);
        const opinion = opinions.find((o) => o.id === id);

        if (currentVote === type) {
          // Unlike - remove the vote
          await updateDoc(opinionRef, {
            [type]: opinion[type] - 1,
            votedUsers: arrayRemove(userId)
          });
          const newUserVotes = { ...userVotes };
          delete newUserVotes[id];
          setUserVotes(newUserVotes);
          localStorage.setItem("userVotes", JSON.stringify(newUserVotes));
        } else {
          // Change vote or add new vote
          const updates = {
            [type]: opinion[type] + 1,
            votedUsers: arrayUnion(userId)
          };
          
          if (currentVote) {
            updates[currentVote] = opinion[currentVote] - 1;
          }
          
          await updateDoc(opinionRef, updates);
          const newUserVotes = { ...userVotes, [id]: type };
          setUserVotes(newUserVotes);
          localStorage.setItem("userVotes", JSON.stringify(newUserVotes));
        }
      } catch (error) {
        console.error("Error updating vote:", error);
        setToast("Error updating vote. Please try again.");
        setTimeout(() => setToast(null), 3000);
      }
    },
    [opinions, userVotes]
  );

  const handleDoubleTap = useCallback((id) => {
    const now = Date.now();
    const lastTap = lastTapTimeRef.current[id] || 0;
    const timeDiff = now - lastTap;

    if (timeDiff < 300) {
      handleVote(id, "upvotes");
    }

    lastTapTimeRef.current[id] = now;
  }, [handleVote]);

  return (
    <div className="min-h-screen bg-black pb-8">
      <div className="w-full sm:max-w-xl mx-auto">
        <p className="text-gray-400 text-xs text-center mb-6 italic">
          all opinions are automatically cleared every 2 days
        </p>
        <motion.div 
          layout="position"
          className="w-full space-y-5 sm:space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {opinions.map((op) => (
              <OpinionCard
                key={op.id}
                op={op}
                userVotes={userVotes}
                onVote={handleVote}
                onDoubleTap={handleDoubleTap}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 
                     bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg 
                     flex items-center space-x-2 justify-center w-[90vw] max-w-[400px] z-50"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Truth;
