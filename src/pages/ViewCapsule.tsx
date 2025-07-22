import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Unlock, Calendar, Clock, Play, User, Bot, ArrowLeft } from 'lucide-react';
import { format, isAfter, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { Layout } from '../components/Layout';
import { useCapsules } from '../hooks/useCapsules';
import { Capsule } from '../lib/supabase';

export function ViewCapsulePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCapsule } = useCapsules();
  const [capsule, setCapsule] = useState<Capsule | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (id) {
      fetchCapsule();
    }
  }, [id, getCapsule]);

  useEffect(() => {
    if (capsule) {
      const timer = setInterval(() => {
        updateCountdown();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [capsule]);

  const fetchCapsule = async () => {
    if (!id) return;
    
    try {
      const data = await getCapsule(id);
      setCapsule(data);
    } catch (error) {
      console.error('Error fetching capsule:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!capsule) return;

    const now = new Date();
    const releaseDate = new Date(capsule.release_date);
    
    if (!isAfter(releaseDate, now) || capsule.is_unlocked) {
      setCountdown('');
      return;
    }

    const days = differenceInDays(releaseDate, now);
    const hours = differenceInHours(releaseDate, now) % 24;
    const minutes = differenceInMinutes(releaseDate, now) % 60;

    if (days > 0) {
      setCountdown(`${days} days, ${hours} hours remaining`);
    } else if (hours > 0) {
      setCountdown(`${hours} hours, ${minutes} minutes remaining`);
    } else {
      setCountdown(`${minutes} minutes remaining`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-white/70">Loading capsule...</div>
        </div>
      </Layout>
    );
  }

  if (!capsule) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Capsule Not Found</h2>
          <p className="text-white/70 mb-6">The capsule you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-teal-600 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const isLocked = !capsule.is_unlocked && isAfter(new Date(capsule.release_date), new Date());

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>

        {isLocked ? (
          /* Locked View */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-12 text-center border border-amber-500/30"
          >
            <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Lock className="w-12 h-12 text-amber-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">{capsule.title}</h1>
            
            <div className="max-w-md mx-auto">
              <p className="text-amber-200 text-lg mb-6">
                This time capsule is locked until
              </p>
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-white">
                  <Calendar className="w-5 h-5" />
                  <span className="text-lg font-medium">
                    {format(new Date(capsule.release_date), 'MMMM dd, yyyy')}
                  </span>
                </div>
              </div>
              
              {countdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-500/20 rounded-lg p-4 border border-amber-500/30"
                >
                  <div className="flex items-center justify-center space-x-2 text-amber-200">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{countdown}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Unlocked View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{capsule.title}</h1>
                  <div className="flex items-center space-x-4 text-white/60">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {format(new Date(capsule.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Unlock className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Unlocked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Player */}
              {capsule.file_url && (
                <div className="mb-6">
                  {capsule.file_type?.startsWith('audio/') ? (
                    <audio controls className="w-full" preload="metadata" crossOrigin="anonymous">
                      <source src={capsule.file_url} type={capsule.file_type} />
                      Your browser does not support the audio element.
                    </audio>
                  ) : capsule.file_type?.startsWith('video/') ? (
                    <video controls className="w-full rounded-lg" preload="metadata" crossOrigin="anonymous">
                      <source src={capsule.file_url} type={capsule.file_type} />
                      Your browser does not support the video element.
                    </video>
                  ) : null}
                </div>
              )}

              {/* Original Content */}
              <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-blue-400">Your Past Self</span>
                </div>
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {capsule.content}
                </p>
              </div>
            </div>

            {/* AI Responses */}
            {(capsule.ai_summary || capsule.ai_future_reply) && (
              <div className="space-y-6">
                {/* AI Summary */}
                {capsule.ai_summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 rounded-2xl p-8 border border-white/20"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <Bot className="w-5 h-5 text-purple-400" />
                      <span className="font-medium text-purple-400">AI Summary</span>
                    </div>
                    <p className="text-white/90 leading-relaxed">
                      {capsule.ai_summary}
                    </p>
                  </motion.div>
                )}

                {/* Future Self Response */}
                {capsule.ai_future_reply && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-2xl p-8 border border-teal-500/30"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <User className="w-5 h-5 text-teal-400" />
                      <span className="font-medium text-teal-400">Your Future Self</span>
                    </div>
                    <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                      {capsule.ai_future_reply}
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}