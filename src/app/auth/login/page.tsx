'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card, useToast } from '@/components/ui';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Phone, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
});

const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only numbers'),
  username: z.string().optional(),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { login, setLoading } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: '', username: '' },
  });

  // Demo login - bypass OTP for development
  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      phone: '+966500000000',
      username: 'DemoPlayer',
      avatar: null,
      credits: 100,
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        totalPoints: 0,
        winRate: 0,
      },
      createdAt: new Date().toISOString(),
    };
    login(demoUser, 'demo-access-token', 'demo-refresh-token');
    toast.success('Welcome to Lamma! (Demo Mode)');
    router.push('/dashboard');
  };

  const handlePhoneSubmit = async (data: PhoneFormData) => {
    setIsSubmitting(true);
    try {
      await authApi.requestOTP({ phone: data.phone });
      setPhone(data.phone);
      setStep('otp');
      toast.success('OTP sent to your phone');
    } catch (error: any) {
      // If API fails, offer demo mode
      toast.error('Backend unavailable. Use Demo Login to continue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPSubmit = async (data: OTPFormData) => {
    setIsSubmitting(true);
    setLoading(true);
    try {
      const response = await authApi.verifyOTP({
        phone,
        code: data.code,
        username: data.username || undefined,
      });

      const { user, tokens } = response.data;
      login(user, tokens.accessToken, tokens.refreshToken);
      toast.success('Welcome to Lamma!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsSubmitting(true);
    try {
      await authApi.requestOTP({ phone });
      toast.success('New OTP sent');
    } catch (error: any) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Lamma</span>
        </Link>

        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card padding="lg">
                <h1 className="text-2xl font-bold text-center mb-2">Welcome!</h1>
                <p className="text-gray-600 text-center mb-8">
                  Enter your phone number to get started
                </p>

                <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6">
                  <Input
                    label="Phone Number"
                    placeholder="+966 5XX XXX XXXX"
                    type="tel"
                    leftIcon={<Phone className="w-5 h-5" />}
                    error={phoneForm.formState.errors.phone?.message}
                    {...phoneForm.register('phone')}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                  >
                    Continue
                  </Button>

                  <div className="relative my-4">
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
                    size="lg"
                    fullWidth
                    onClick={handleDemoLogin}
                  >
                    Demo Login (Skip OTP)
                  </Button>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card padding="lg">
                <button
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <h1 className="text-2xl font-bold text-center mb-2">Enter OTP</h1>
                <p className="text-gray-600 text-center mb-8">
                  We sent a 6-digit code to
                  <br />
                  <span className="font-semibold text-gray-900">{phone}</span>
                </p>

                <form onSubmit={otpForm.handleSubmit(handleOTPSubmit)} className="space-y-6">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                      {...otpForm.register('code')}
                    />
                    {otpForm.formState.errors.code && (
                      <p className="mt-1.5 text-sm text-red-500">
                        {otpForm.formState.errors.code.message}
                      </p>
                    )}
                  </div>

                  {/* Optional Username */}
                  <Input
                    label="Username (Optional)"
                    placeholder="Enter a nickname"
                    hint="Leave blank for a generated username"
                    {...otpForm.register('username')}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                  >
                    Verify & Continue
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isSubmitting}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                    >
                      Didn't receive code? Resend
                    </button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
