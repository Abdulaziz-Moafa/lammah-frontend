'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, Input, Badge, useToast } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { adminApi } from '@/lib/api';
import {
  ArrowLeft,
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  Flag,
  FileText,
  Upload,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  status: 'pending' | 'approved' | 'rejected';
  reports?: number;
}

// Demo questions for the admin panel
const DEMO_QUESTIONS: Question[] = [
  { id: '1', text: 'What is the capital of France?', category: 'Geography', difficulty: 'easy', status: 'pending' },
  { id: '2', text: 'Who directed The Godfather?', category: 'Movies', difficulty: 'medium', status: 'approved' },
  { id: '3', text: 'What year did World War II end?', category: 'History', difficulty: 'easy', status: 'approved' },
  { id: '4', text: 'What is the chemical symbol for gold?', category: 'Science', difficulty: 'easy', status: 'pending', reports: 2 },
  { id: '5', text: 'Who wrote "1984"?', category: 'Literature', difficulty: 'medium', status: 'rejected' },
];

export default function AdminPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated } = useAuthStore();

  const [questions, setQuestions] = useState<Question[]>(DEMO_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'admin') {
      toast.error('Admin access required');
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router, toast]);

  // Handle moderation action
  const handleModerate = async (questionId: string, action: 'approve' | 'reject' | 'flag') => {
    setIsLoading(true);
    try {
      await adminApi.moderate({ questionId, action });

      // Update local state
      setQuestions(prev =>
        prev.map(q =>
          q.id === questionId
            ? { ...q, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : q.status }
            : q
        )
      );

      toast.success(`Question ${action}ed successfully`);
    } catch (error) {
      // Demo mode - update locally anyway
      setQuestions(prev =>
        prev.map(q =>
          q.id === questionId
            ? { ...q, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : q.status }
            : q
        )
      );
      toast.success(`Question ${action}ed`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold gradient-text">Admin Panel</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center">
              <p className="text-3xl font-bold text-gray-900">{questions.length}</p>
              <p className="text-sm text-gray-500">Total Questions</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {questions.filter(q => q.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-500">Pending Review</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {questions.filter(q => q.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-500">Approved</p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {questions.filter(q => q.reports && q.reports > 0).length}
              </p>
              <p className="text-sm text-gray-500">Reported</p>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                />
              </div>
              <div className="flex gap-2">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Questions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card padding="none">
            <div className="divide-y divide-gray-100">
              {filteredQuestions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No questions found</p>
                </div>
              ) : (
                filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          {question.text}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="default">{question.category}</Badge>
                          <Badge
                            variant={
                              question.difficulty === 'easy'
                                ? 'easy'
                                : question.difficulty === 'hard'
                                ? 'hard'
                                : 'default'
                            }
                          >
                            {question.difficulty}
                          </Badge>
                          <Badge
                            variant={
                              question.status === 'approved'
                                ? 'success'
                                : question.status === 'rejected'
                                ? 'error'
                                : 'warning'
                            }
                          >
                            {question.status}
                          </Badge>
                          {question.reports && question.reports > 0 && (
                            <Badge variant="error">
                              {question.reports} reports
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleModerate(question.id, 'approve')}
                          disabled={isLoading || question.status === 'approved'}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleModerate(question.id, 'reject')}
                          disabled={isLoading || question.status === 'rejected'}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleModerate(question.id, 'flag')}
                          disabled={isLoading}
                          className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 disabled:opacity-50"
                          title="Flag for review"
                        >
                          <Flag className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Batch Ingest Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">AI Question Ingest</h2>
            <p className="text-gray-500 mb-4">
              Upload a batch of AI-generated questions for review
            </p>
            <Button
              variant="outline"
              leftIcon={<Upload className="w-5 h-5" />}
              onClick={() => router.push('/admin/ingest')}
            >
              Batch Import
            </Button>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
