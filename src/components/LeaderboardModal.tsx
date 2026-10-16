import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  X,
  Medal,
  Flame,
  CloudOff,
  CloudCheck,
  Send,
  RefreshCw,
  Sparkles,
  Smartphone
} from 'lucide-react';
import {
  subscribeToLeaderboard,
  submitScoreToFirebase,
  LeaderboardRecord,
  testFirestoreConnection,
} from '../firebase';
import {
  getOfflineScores,
  queueOfflineScore,
  syncOfflineScoresToFirebase,
} from '../utils/gameLogic';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore: number;
  highestTile: number;
  movesCount: number;
  themeName: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentScore,
  highestTile,
  movesCount,
  themeName,
}) => {
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('2048_player_name') || 'Android Master';
    } catch {
      return 'Android Master';
    }
  });
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [offlinePendingCount, setOfflinePendingCount] = useState<number>(0);

  const refreshOfflineCount = () => {
    setOfflinePendingCount(getOfflineScores().length);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSyncOffline();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refreshOfflineCount();

    // Verify Firestore connection
    testFirestoreConnection().then((connected) => {
      if (!connected) setIsOnline(false);
    });

    setIsLoading(true);
    const unsubscribe = subscribeToLeaderboard(
      (data) => {
        setRecords(data);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Leaderboard subscription fallback:', err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const handleSyncOffline = async () => {
    const synced = await syncOfflineScoresToFirebase();
    if (synced > 0) {
      setStatusMessage(`Synced ${synced} offline score${synced > 1 ? 's' : ''} to Firebase!`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
    refreshOfflineCount();
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentScore <= 0) {
      setStatusMessage('Play a game first to score points!');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    const cleanName = playerName.trim().slice(0, 30) || 'Anonymous';
    try {
      localStorage.setItem('2048_player_name', cleanName);
    } catch {}

    setIsSubmitting(true);
    setStatusMessage(null);

    const recordData = {
      playerName: cleanName,
      score: currentScore,
      highestTile,
      movesCount,
      devicePlatform: 'Android Compose',
      themeUsed: themeName,
    };

    if (!navigator.onLine) {
      queueOfflineScore(recordData);
      refreshOfflineCount();
      setIsSubmitting(false);
      setHasSubmittedCurrent(true);
      setStatusMessage('Saved to local offline queue. Will sync when back online!');
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    try {
      await submitScoreToFirebase(recordData);
      setHasSubmittedCurrent(true);
      setStatusMessage('Score published to global leaderboard!');
      setTimeout(() => setStatusMessage(null), 4000);
      refreshOfflineCount();
    } catch (err) {
      console.warn('Error submitting score, queuing offline:', err);
      queueOfflineScore(recordData);
      refreshOfflineCount();
      setHasSubmittedCurrent(true);
      setStatusMessage('Network issue - saved locally! Will retry sync.');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-md bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md max-h-[90vh] bg-[#1d1b20] text-[#e6e0e9] rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Global Leaderboard</h3>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CloudCheck className="w-3.5 h-3.5" /> Firebase Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <CloudOff className="w-3.5 h-3.5" /> Offline Mode
                  </span>
                )}
                <span>•</span>
                <span>Cross-Device</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast Banner */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-indigo-600/30 border-b border-indigo-500/30 px-4 py-2 text-xs text-indigo-200 text-center font-medium"
            >
              {statusMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Offline Queue Notice */}
        {offlinePendingCount > 0 && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <span>{offlinePendingCount} score{offlinePendingCount > 1 ? 's' : ''} queued locally offline</span>
            <button
              onClick={handleSyncOffline}
              className="flex items-center gap-1 text-amber-300 underline font-semibold hover:text-white"
            >
              <RefreshCw className="w-3 h-3" /> Sync Now
            </button>
          </div>
        )}

        {/* Submit Active Score Card */}
        <div className="p-4 mx-4 mt-3 rounded-2xl bg-[#2b2930] border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-purple-300">
              Current Run Score
            </span>
            <span className="text-base font-black text-amber-400">{currentScore.toLocaleString()}</span>
          </div>

          <form onSubmit={handleSubmitScore} className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your Android Player Tag"
              maxLength={25}
              disabled={isSubmitting || hasSubmittedCurrent}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSubmitting || hasSubmittedCurrent || currentScore === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-gray-500 active:scale-95 transition-all text-white flex items-center gap-1.5 shrink-0"
            >
              {isSubmitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : hasSubmittedCurrent ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Submitted
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit
                </>
              )}
            </button>
          </form>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
              <span className="text-xs">Fetching rankings from Firebase...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Trophy className="w-10 h-10 mx-auto text-gray-600 mb-2" />
              <p className="text-sm font-semibold">No scores recorded yet!</p>
              <p className="text-xs text-gray-500 mt-1">Be the first to claim the #1 spot on Firebase.</p>
            </div>
          ) : (
            records.map((entry, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const medalColor =
                rank === 1
                  ? 'text-yellow-400 bg-yellow-400/20 ring-yellow-400/40'
                  : rank === 2
                  ? 'text-slate-300 bg-slate-300/20 ring-slate-300/40'
                  : 'text-amber-600 bg-amber-600/20 ring-amber-600/40';

              return (
                <div
                  key={entry.id || index}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition-colors ${
                    isTop3
                      ? 'bg-[#2b2930] border border-white/10'
                      : 'bg-black/20 hover:bg-[#26242a]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Indicator */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        isTop3 ? `ring-1 ${medalColor}` : 'text-gray-400 bg-white/5'
                      }`}
                    >
                      {isTop3 ? <Medal className="w-4 h-4" /> : rank}
                    </div>

                    {/* Player Info */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white tracking-tight">
                          {entry.playerName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 text-gray-300 flex items-center gap-0.5">
                          <Smartphone className="w-2.5 h-2.5 text-purple-300" />
                          Android
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span>Max Tile: <strong className="text-amber-300">{entry.highestTile}</strong></span>
                        <span>•</span>
                        <span>{entry.movesCount} moves</span>
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-amber-400">
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      pts
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#16141a] flex items-center justify-between text-[11px] text-gray-400">
          <span>Synced with Firebase Firestore</span>
          <button
            onClick={onClose}
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
