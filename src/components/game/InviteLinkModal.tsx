'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal, Button, useToast } from '@/components/ui';
import { copyToClipboard } from '@/lib/utils';
import { Copy, Check, Share2, MessageCircle, Mail } from 'lucide-react';

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchCode: string;
  inviteLink: string;
}

export function InviteLinkModal({
  isOpen,
  onClose,
  matchCode,
  inviteLink,
}: InviteLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await copyToClipboard(inviteLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Lamma game!',
          text: `Join my game with code: ${matchCode}`,
          url: inviteLink,
        });
      } catch (error) {
        // User cancelled or share failed silently
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Join my Lamma game! Use code: ${matchCode} or click this link: ${inviteLink}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleSMS = () => {
    const message = encodeURIComponent(`Join my Lamma game with code: ${matchCode} - ${inviteLink}`);
    window.open(`sms:?body=${message}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Players" size="md">
      <div className="flex flex-col items-center gap-6">
        {/* Match Code */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Match Code</p>
          <div className="bg-gray-100 rounded-2xl px-8 py-4">
            <span className="text-4xl font-bold tracking-[0.3em] text-gray-900">
              {matchCode}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <QRCodeSVG
            value={inviteLink}
            size={180}
            level="M"
            includeMargin
            bgColor="#ffffff"
            fgColor="#1f2937"
          />
        </div>

        {/* Link */}
        <div className="w-full">
          <p className="text-sm text-gray-500 mb-2">Or share this link</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-4 py-2 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-200"
            />
            <Button
              variant={copied ? 'success' : 'outline'}
              size="md"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-3 w-full">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleShare}
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Share
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleWhatsApp}
            className="!bg-green-50 !border-green-200 !text-green-700 hover:!bg-green-100"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleSMS}
            className="!bg-blue-50 !border-blue-200 !text-blue-700 hover:!bg-blue-100"
          >
            <Mail className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
