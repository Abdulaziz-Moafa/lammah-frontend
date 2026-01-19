'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, Input, useToast } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { adminApi } from '@/lib/api';
import {
  ArrowLeft,
  Sparkles,
  Upload,
  FileJson,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface BatchStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalQuestions: number;
  processedQuestions: number;
  failedQuestions: number;
  errors?: string[];
  createdAt: string;
}

const SAMPLE_PAYLOAD = {
  questions: [
    {
      categoryId: 'geography',
      text: 'What is the largest continent by area?',
      options: ['Asia', 'Africa', 'North America', 'Europe'],
      correctAnswer: 'Asia',
      difficulty: 'easy',
      points: 100,
      timeLimit: 30,
    },
    {
      categoryId: 'science',
      text: 'What is the chemical formula for water?',
      options: ['H2O', 'CO2', 'NaCl', 'O2'],
      correctAnswer: 'H2O',
      difficulty: 'easy',
      points: 100,
      timeLimit: 30,
    },
  ],
};

export default function IngestPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated } = useAuthStore();

  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batches, setBatches] = useState<BatchStatus[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async () => {
    try {
      const parsed = JSON.parse(payload);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid payload: must have a "questions" array');
      }

      setIsSubmitting(true);

      try {
        const response = await adminApi.ingestQuestions(parsed);
        toast.success(`Batch ${response.data.batchId} created`);

        // Add to local batches
        setBatches(prev => [
          {
            id: response.data.batchId,
            status: 'pending',
            totalQuestions: parsed.questions.length,
            processedQuestions: 0,
            failedQuestions: 0,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } catch (error) {
        // Demo mode - simulate batch creation
        const demoId = `batch-${Date.now()}`;
        setBatches(prev => [
          {
            id: demoId,
            status: 'processing',
            totalQuestions: parsed.questions.length,
            processedQuestions: 0,
            failedQuestions: 0,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);

        // Simulate processing
        setTimeout(() => {
          setBatches(prev =>
            prev.map(b =>
              b.id === demoId
                ? { ...b, status: 'completed', processedQuestions: parsed.questions.length }
                : b
            )
          );
        }, 3000);

        toast.success('Batch submitted (demo mode)');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid JSON payload');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckStatus = async (batchId: string) => {
    try {
      const response = await adminApi.getBatchStatus(batchId);
      setBatches(prev =>
        prev.map(b => (b.id === batchId ? { ...b, ...response.data } : b))
      );
    } catch (error) {
      // Demo mode - simulate status update
      setBatches(prev =>
        prev.map(b =>
          b.id === batchId
            ? {
                ...b,
                status: b.processedQuestions < b.totalQuestions ? 'processing' : 'completed',
                processedQuestions: Math.min(b.processedQuestions + 1, b.totalQuestions),
              }
            : b
        )
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold gradient-text">AI Ingest</span>
          </div>
          <div className="w-32" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-4">
                <FileJson className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-bold text-gray-900">Batch Import</h2>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Paste a JSON payload with questions to import. Each question should have:
                categoryId, text, options, correctAnswer, difficulty, points, timeLimit
              </p>

              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 resize-none"
                placeholder="Paste JSON payload..."
              />

              <div className="mt-4 flex gap-3">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  leftIcon={<Upload className="w-5 h-5" />}
                >
                  Submit Batch
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPayload(JSON.stringify(SAMPLE_PAYLOAD, null, 2))}
                >
                  Reset
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Batches Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card padding="lg">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Batches</h2>

              {batches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No batches yet</p>
                  <p className="text-sm">Submit a batch to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {batches.map((batch) => (
                    <div
                      key={batch.id}
                      className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(batch.status)}
                          <span className="font-medium text-gray-900">
                            {batch.id.slice(0, 12)}...
                          </span>
                        </div>
                        <button
                          onClick={() => handleCheckStatus(batch.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Refresh status"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{batch.totalQuestions} questions</span>
                        <span>•</span>
                        <span>
                          {batch.processedQuestions}/{batch.totalQuestions} processed
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            batch.status === 'failed'
                              ? 'bg-red-500'
                              : batch.status === 'completed'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${(batch.processedQuestions / batch.totalQuestions) * 100}%`,
                          }}
                        />
                      </div>

                      {batch.errors && batch.errors.length > 0 && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                          {batch.errors[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
