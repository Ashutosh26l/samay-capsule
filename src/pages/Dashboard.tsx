import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Lock, Unlock, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isAfter } from 'date-fns';
import { Layout } from '../components/Layout';
import { useCapsules } from '../hooks/useCapsules';

export function DashboardPage() {
  const { capsules, loading } = useCapsules();

  if (loading) {
    return (
      <Layout title="Your Time Capsules">
        <div className="flex items-center justify-center py-20">
          <div className="text-white/70">Loading your capsules...</div>
        </div>
      </Layout>
    );
  }

  const now = new Date();
  const lockedCapsules = capsules.filter(c => !c.is_unlocked && isAfter(new Date(c.release_date), now));
  const unlockedCapsules = capsules.filter(c => c.is_unlocked || !isAfter(new Date(c.release_date), now));

  return (
    <Layout title="Your Time Capsules">
      <div className="space-y-8">
        {/* Create New Capsule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Create a New Time Capsule</h2>
              <p className="text-white/70">Capture your thoughts and memories for the future</p>
            </div>
            <Link to="/create">
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-teal-600 transition-all flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>Create</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{capsules.length}</p>
                <p className="text-white/70 text-sm">Total Capsules</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{lockedCapsules.length}</p>
                <p className="text-white/70 text-sm">Locked</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Unlock className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{unlockedCapsules.length}</p>
                <p className="text-white/70 text-sm">Unlocked</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Capsules */}
        {capsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Clock className="w-16 h-16 text-white/30 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-white mb-2">No Time Capsules Yet</h3>
            <p className="text-white/70 mb-6">Create your first capsule to get started on your journey through time</p>
            <Link to="/create">
              <motion.button
                className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-teal-600 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Capsule
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules.map((capsule, index) => {
              const isLocked = !capsule.is_unlocked && isAfter(new Date(capsule.release_date), now);
              
              return (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/capsule/${capsule.id}`}>
                    <motion.div
                      className="bg-white/10 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all group"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                          {capsule.title}
                        </h3>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isLocked ? 'bg-amber-500/20' : 'bg-green-500/20'
                        }`}>
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Unlock className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                      </div>

                      <p className="text-white/70 text-sm mb-4 line-clamp-3">
                        {capsule.content}
                      </p>

                      <div className="flex items-center justify-between text-sm text-white/60">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {isLocked ? 'Unlocks' : 'Created'}{' '}
                            {format(new Date(isLocked ? capsule.release_date : capsule.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        {capsule.file_url && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}