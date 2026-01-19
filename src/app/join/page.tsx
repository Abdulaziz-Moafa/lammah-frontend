'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button, Card, Input, useToast } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { useMatchStore } from '@/store/match';
import { matchesApi } from '@/lib/api';
import { ArrowLeft, Sparkles, Users, Hash } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

const joinSchema = z.object({
  code: z
    .string()
    .min(4, 'Match code is required')
    .max(10, 'Invalid code')
    .transform((val) => val.toUpperCase().replace(/\s/g, '')),
  username: z.string().optional(),
});

type JoinFormData = z.infer<typeof joinSchema>;

function JoinMatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const { setMatch, setMyPlayerId } = useMatchStore();

  const [isJoining, setIsJoining] = useState(false);

  // Get code from URL if provided (invitation link)
  const urlCode = searchParams.get('code') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      code: urlCode,
      username: user?.username || '',
    },
  });

  const onSubmit = async (data: JoinFormData) => {
    setIsJoining(true);
    try {
      const response = await matchesApi.join({
        code: data.code,
        username: data.username || undefined,
      });

      const match = response.data;
      setMatch(match);
      if (user) {
        setMyPlayerId(user.id);
      }

      toast.success('Joined the match!');
      router.push(`/match/${match.id}/lobby`);
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to join match';
      toast.error(message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link
            href={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold gradient-text">Lamma</span>
            </div>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-secondary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join a Match</h1>
            <p className="text-gray-600">Enter the match code to join</p>
          </div>

          <Card padding="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Match Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Code
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="ABCD12"
                  className="w-full text-center text-3xl tracking-[0.3em] font-bold py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none uppercase"
                  {...register('code')}
                />
                {errors.code && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.code.message}</p>
                )}
              </div>

              {/* Username (if not logged in or want to change) */}
              {!isAuthenticated && (
                <Input
                  label="Your Nickname"
                  placeholder="Enter a nickname"
                  hint="How other players will see you"
                  leftIcon={<Hash className="w-5 h-5" />}
                  error={errors.username?.message}
                  {...register('username')}
                />
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="secondary"
                size="xl"
                fullWidth
                isLoading={isJoining}
                leftIcon={<Users className="w-6 h-6" />}
              >
                Join Match
              </Button>

              {/* Or create match */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => router.push(isAuthenticated ? '/create' : '/auth/login')}
              >
                {isAuthenticated ? 'Create Your Own Match' : 'Sign In to Host'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default function JoinMatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <JoinMatchContent />
    </Suspense>
  );
}
