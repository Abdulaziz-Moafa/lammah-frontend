'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import {
  Play,
  Users,
  Trophy,
  Zap,
  Share2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Play',
      description: 'Compete in teams with friends and family',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Power-Ups',
      description: 'Use special abilities to gain an advantage',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Categories',
      description: 'Choose from various fun categories',
      color: 'bg-green-100 text-green-600',
    },
  ];

  const steps = [
    { step: 1, title: 'Create or Join', description: 'Host a new game or join with a code' },
    { step: 2, title: 'Pick Categories', description: 'Teams take turns selecting categories' },
    { step: 3, title: 'Answer & Win', description: 'Answer questions to score points!' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Lamma</span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard')}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/auth/login')}>
                  Login
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push('/auth/login')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-display-lg md:text-display-xl mb-6">
              <span className="gradient-text">Fun Trivia Games</span>
              <br />
              <span className="text-gray-900">for Everyone</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Challenge your friends and family to exciting team-based trivia battles.
              Pick categories, answer questions, and use power-ups to win!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                variant="primary"
                size="xl"
                onClick={() => router.push(isAuthenticated ? '/create' : '/auth/login')}
                leftIcon={<Play className="w-6 h-6" />}
                className="min-w-[200px]"
              >
                Host a Game
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => router.push('/join')}
                leftIcon={<Users className="w-6 h-6" />}
                className="min-w-[200px]"
              >
                Join a Game
              </Button>
            </div>

            {/* Demo Categories Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-2xl mx-auto"
            >
              {['🎬', '🎵', '⚽', '🌍', '🔬', '📚'].map((emoji, i) => (
                <div
                  key={i}
                  className="aspect-square bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-3xl hover:scale-105 transition-transform cursor-default"
                >
                  {emoji}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-display-sm text-center mb-12">Why Play Lamma?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center" hover>
                  <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-display-sm text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <Share2 className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-display-sm mb-4">Invite Friends & Earn Credits</h2>
          <p className="text-xl opacity-90 mb-8">
            Share Lamma with friends and get bonus credits when they join!
          </p>
          <Button
            variant="outline"
            size="lg"
            className="!bg-white/10 !border-white !text-white hover:!bg-white/20"
            onClick={() => router.push(isAuthenticated ? '/dashboard' : '/auth/login')}
          >
            {isAuthenticated ? 'Invite Friends' : 'Sign Up to Invite'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Lamma</span>
          </div>
          <p className="text-sm">© 2024 Lamma. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
