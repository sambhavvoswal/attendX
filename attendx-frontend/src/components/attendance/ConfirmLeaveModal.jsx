import { motion, AnimatePresence } from 'framer-motion';

export function ConfirmLeaveModal({ isOpen, onStay, onLeave }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onStay}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Warning Icon */}
          <div className="pt-8 pb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 text-center">
            <h3 className="text-lg font-bold text-text-primary mb-2">Active Session</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You have an active session running. Leaving will <span className="text-red-400 font-semibold">discard all unsaved</span> attendance data.
            </p>
          </div>

          {/* Buttons */}
          <div className="px-6 pb-6 flex flex-col gap-3">
            <button
              onClick={onStay}
              className="w-full py-3 px-4 rounded-xl bg-accent text-black font-black text-sm uppercase tracking-wide hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] transition-all"
            >
              No, wait!!!
            </button>
            <button
              onClick={onLeave}
              className="w-full py-3 px-4 rounded-xl bg-transparent border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/10 active:scale-[0.98] transition-all"
            >
              Yes, data is useless
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
