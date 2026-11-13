import { AnimatePresence, motion } from 'framer-motion';
import { useReplayStore } from './store/index';
import { RaceSelection, RaceReplay } from './components/index';

export default function App() {
  const selectedSession = useReplayStore(
    (s: ReturnType<typeof useReplayStore.getState>) => s.selectedSession,
  );

  return (
    <div className="w-full overflow-y-auto">
      <AnimatePresence mode="wait">
        {!selectedSession ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <RaceSelection />
          </motion.div>
        ) : (
          <motion.div
            key="replay"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full overflow-y-auto"
          >
            <RaceReplay />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}