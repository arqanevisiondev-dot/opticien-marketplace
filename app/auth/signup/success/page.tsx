'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Clock, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SignupSuccessPage() {
  const { t } = useLanguage();

  useEffect(() => {
    // Confetti or celebration animation could be added here
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EEE9DF] to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white p-8 md:p-12 shadow-2xl rounded-2xl">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B2632] mb-4">
            {t.registrationSuccess}
          </h1>

          {/* Success Message */}
          <p className="text-lg text-gray-600 mb-8">
            {t.registrationSuccessMessage}
          </p>

          {/* Info Boxes */}
          <div className="space-y-4 mb-8 text-left">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <Clock className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-[#1B2632] mb-2">
                    {t.pendingApproval}
                  </h3>
                  <p className="text-gray-700">
                    {t.pendingApprovalMessage}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-[#f56a24] mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-[#1B2632] mb-2">
                    {t.adminNotified}
                  </h3>
                  <p className="text-gray-700">
                    {t.adminNotifiedMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-[#1B2632] mb-4">
              {t.whatHappensNext}
            </h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="bg-[#f56a24] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">
                  1
                </span>
                <span>{t.step1AdminReview}</span>
              </li>
              <li className="flex items-start">
                <span className="bg-[#f56a24] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">
                  2
                </span>
                <span>{t.step2EmailNotification}</span>
              </li>
              <li className="flex items-start">
                <span className="bg-[#f56a24] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">
                  3
                </span>
                <span>{t.step3AccessCatalog}</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                {t.backToHome}
              </Button>
            </Link>
            <Link href="/catalogue">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-[#f56a24] text-[#f56a24]">
                {t.browseCatalog}
              </Button>
            </Link>
          </div>

          {/* Support Contact */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {t.questionsContact}{' '}
              <a href="mailto:support@arqanevision.com" className="text-[#f56a24] hover:underline font-medium">
                support@arqanevision.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
