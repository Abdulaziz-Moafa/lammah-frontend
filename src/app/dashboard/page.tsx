'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, Avatar, useToast } from '@/components/ui';
import { InviteLinkModal } from '@/components/game';
import { useAuthStore } from '@/store/auth';
import { authApi, referralsApi } from '@/lib/api';
import { formatPhone, getShareUrl } from '@/lib/utils';
import {
  Play,
  Users,
  Share2,
  LogOut,
  Coins,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated, logout: storeLogout } = useAuthStore();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [isLoadingReferral, setIsLoadingReferral] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API fails
    } finally {
      storeLogout();
      router.push('/');
      toast.success('Logged out successfully');
    }
  };

  const handleInvite = async () => {
    if (referralCode) {
      setShowInviteModal(true);
      return;
    }

    setIsLoadingReferral(true);
    try {
      const response = await referralsApi.invite({ channel: 'link' });
      setReferralCode(response.data.code);
      setReferralLink(response.data.link);
      setShowInviteModal(true);
    } catch (error) {
      // Generate fallback link if API fails
      const fallbackCode = `REF${user?.id?.slice(0, 6).toUpperCase() || 'LAMMA'}`;
      setReferralCode(fallbackCode);
      setReferralLink(`${process.env.NEXT_PUBLIC_APP_URL}/join?ref=${fallbackCode}`);
      setShowInviteModal(true);
    } finally {
      setIsLoadingReferral(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Lamma</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8">
            <div className="flex items-center gap-4">
              <Avatar name={user.username} src={user.avatar} size="xl" />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-500">{formatPhone(user.phone)}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-bold text-yellow-600">
                  <Coins className="w-6 h-6" />
                  {user.credits}
                </div>
                <p className="text-sm text-gray-500">Credits</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className="h-full bg-gradient-to-br from-primary-500 to-primary-600 text-white cursor-pointer"
              hover
              onClick={() => router.push('/create')}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Play className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Host a Game</h2>
                  <p className="text-white/80">Create a new match and invite players</p>
                </div>
                <ChevronRight className="w-6 h-6 opacity-60" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card
              className="h-full bg-gradient-to-br from-secondary-500 to-secondary-600 text-white cursor-pointer"
              hover
              onClick={() => router.push('/join')}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Join a Game</h2>
                  <p className="text-white/80">Enter a code to join an existing match</p>
                </div>
                <ChevronRight className="w-6 h-6 opacity-60" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Invite Friends Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center">
                <Share2 className="w-8 h-8 text-accent-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">Invite Friends</h2>
                <p className="text-gray-500">Share Lamma and earn bonus credits</p>
              </div>
              <Button
                variant="primary"
                onClick={handleInvite}
                isLoading={isLoadingReferral}
              >
                Invite
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Recent Games - Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Games</h2>
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No recent games</p>
            <p className="text-sm text-gray-400 mt-1">Start your first game to see your history here</p>
          </Card>
        </motion.div>

        {/* Admin Link */}
        {user.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Button
              variant="ghost"
              fullWidth
              onClick={() => router.push('/admin')}
              leftIcon={<Settings className="w-5 h-5" />}
            >
              Admin Panel
            </Button>
          </motion.div>
        )}
      </main>

      {/* Invite Modal */}
      <InviteLinkModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        matchCode={referralCode}
        inviteLink={referralLink}
      />
    </div>
  );
}
