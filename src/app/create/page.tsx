'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button, Card, Input, useToast } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { useMatchStore } from '@/store/match';
import { matchesApi } from '@/lib/api';
import { ArrowLeft, Sparkles, Sliders, Play } from 'lucide-react';
import Link from 'next/link';

const matchConfigSchema = z.object({
  categoriesCount: z.number().min(2).max(6).default(6),
  questionsPerCategory: z.number().min(3).max(10).default(6),
  questionTimer: z.number().min(10).max(60).default(30),
  categorySelectionTimer: z.number().min(10).max(30).default(15),
  breakTimer: z.number().min(3).max(10).default(5),
});

type MatchConfigFormData = z.infer<typeof matchConfigSchema>;

export default function CreateMatchPage() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const { setMatch, setIsHost, setMyPlayerId } = useMatchStore();

  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<MatchConfigFormData>({
    resolver: zodResolver(matchConfigSchema),
    defaultValues: {
      categoriesCount: 6,
      questionsPerCategory: 6,
      questionTimer: 30,
      categorySelectionTimer: 15,
      breakTimer: 5,
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: MatchConfigFormData) => {
    setIsCreating(true);
    try {
      const response = await matchesApi.create({
        categoriesCount: data.categoriesCount,
        questionsPerCategory: data.questionsPerCategory,
        questionTimer: data.questionTimer,
        categorySelectionTimer: data.categorySelectionTimer,
        breakTimer: data.breakTimer,
      });

      const match = response.data;
      setMatch(match);
      setIsHost(true);
      if (user) {
        setMyPlayerId(user.id);
      }

      toast.success('Match created!');
      router.push(`/match/${match.id}/lobby`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create match');
    } finally {
      setIsCreating(false);
    }
  };

  const categoriesCount = watch('categoriesCount');
  const questionsPerCategory = watch('questionsPerCategory');
  const totalQuestions = categoriesCount * questionsPerCategory;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
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
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Match</h1>
            <p className="text-gray-600">Configure your game settings</p>
          </div>

          <Card padding="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Quick Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Categories
                  </label>
                  <Controller
                    name="categoriesCount"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        {[2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => field.onChange(num)}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                              field.value === num
                                ? 'bg-primary-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Questions per Category
                  </label>
                  <Controller
                    name="questionsPerCategory"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        {[3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => field.onChange(num)}
                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                              field.value === num
                                ? 'bg-primary-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                {/* Total Questions Info */}
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 w-full justify-center"
              >
                <Sliders className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </button>

              {/* Advanced Settings */}
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-4 border-t border-gray-100"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Timer (seconds)
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      step={5}
                      {...register('questionTimer', { valueAsNumber: true })}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>10s</span>
                      <span className="font-medium text-primary-600">
                        {watch('questionTimer')}s
                      </span>
                      <span>60s</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Selection Timer (seconds)
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={30}
                      step={5}
                      {...register('categorySelectionTimer', { valueAsNumber: true })}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>10s</span>
                      <span className="font-medium text-primary-600">
                        {watch('categorySelectionTimer')}s
                      </span>
                      <span>30s</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Break Timer (seconds)
                    </label>
                    <input
                      type="range"
                      min={3}
                      max={10}
                      {...register('breakTimer', { valueAsNumber: true })}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>3s</span>
                      <span className="font-medium text-primary-600">
                        {watch('breakTimer')}s
                      </span>
                      <span>10s</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="xl"
                fullWidth
                isLoading={isCreating}
                leftIcon={<Play className="w-6 h-6" />}
              >
                Create Match
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
