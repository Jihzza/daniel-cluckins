// src/pages/SchedulingFormPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getProfile, signInWithGoogle } from '../services/authService';
import { createPitchRequest } from '../services/pitchDeckServices';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// COMPONENT IMPORTS
import ServiceSelectionStep from '../components/scheduling/ServiceSelectionStep';
import ConsultationScheduleStep from '../components/scheduling/consultations/ConsultationScheduleStep';
import CoachingPlanStep from '../components/scheduling/coaching/CoachingPlanStep';
import PitchDeckStep from '../components/scheduling/pitchdeck/PitchDeckStep';
import ContactInfoStep from '../components/scheduling/ContactInfoStep';
import PaymentStep from '../components/scheduling/PaymentStep';
import ConfirmationStep from '../components/scheduling/ConfirmationStep';
import FormTitle from '../components/common/FormsTitle'; // unified step titles
import ChatbotStep from '../components/scheduling/ChatbotStep';

// COMPONENT DEFINITION
export default function SchedulingFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // Get user and sign-in method from context
  const { user } = useAuth();

  // Get initial service from URL parameters
  const serviceFromUrl = searchParams.get('service');       // consultation | coaching | pitchdeck
  const coachingPlanFromUrl = searchParams.get('plan');     // basic | standard | premium

  // Global form state (single source of truth)
  const [formData, setFormData] = useState({
    serviceType: serviceFromUrl || null,
    consultation: { date: null, duration: null, time: null },
    coaching: { plan: coachingPlanFromUrl || null },
    pitchdeck: { type: null },
    contactInfo: { name: '', email: '', phone: '' },
  });

  // Flow state
  const [profile, setProfile] = useState(null);
  const [currentStep, setCurrentStep] = useState(serviceFromUrl ? 2 : 1); // start at step 1 if no service, step 2 if service provided
  const [paymentStatus, setPaymentStatus] = useState('awaiting'); // 'awaiting' | 'success' | 'cancelled'
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch profile on auth
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await getProfile(user.id);
        setProfile(data);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdateField = (formSection, fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [formSection]: {
        ...prev[formSection],
        [fieldName]: value,
      },
    }));
  };

  // NEXT: includes pitchdeck create request at step 3
  const handleNext = async () => {
    const { serviceType } = formData;
    if (serviceType === 'pitchdeck' && currentStep === 3) {
      try {
        setIsProcessing(true);
        const { error } = await createPitchRequest({
          project: formData.pitchdeck.type,
          name: formData.contactInfo.name,
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone,
          user_id: user?.id || null,
        });
        if (error) throw error;
      } catch (e) {
        console.error('Pitch request insert failed:', e);
        alert('Sorry, we could not submit your request. Please try again.');
        setIsProcessing(false);
        return; // stay on step 3 if it fails
      }
      setIsProcessing(false);
    }
    setCurrentStep(prev => prev + 1);
  };

  // BACK: if at step 1, go to home; if at step 2, go to step 1; otherwise go to previous step
  const handleBack = () => {
    if (currentStep === 1) {
      // Go to home when at step 1
      navigate('/');
      return;
    }
    if (currentStep === 2) {
      // Go to step 1 (service selection) when at step 2
      setCurrentStep(1);
      return;
    }
    setCurrentStep(prev => prev - 1);
  };

  const handleCoachingPlanSelect = (planId) => {
    handleUpdateField('coaching', 'plan', planId);
    handleNext();
  };

  const handlePitchDeckSelect = (deckId) => {
    handleUpdateField('pitchdeck', 'type', deckId);
    handleNext();
  };

  const handleServiceSelect = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      serviceType: serviceId,
    }));
    handleNext();
  };

  // Price calculation (kept as in original logic)
  const price = useMemo(() => {
    const { serviceType, consultation, coaching } = formData;
    if (serviceType === 'consultation' && consultation.duration) {
      const pricePerHour = 90;
      return (consultation.duration / 60) * pricePerHour;
    }
    if (serviceType === 'coaching' && coaching.plan) {
      const prices = { basic: 40, standard: 90, premium: 230 };
      return prices[coaching.plan];
    }
    return 0;
  }, [formData]);

  // Checkout initiation (unchanged)
  const handleInitiateCheckout = async () => {
    setIsProcessing(true);
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('User is not authenticated.');

      // Build dynamic return targets back to the scheduling flow
      const svc = formData.serviceType;
      const plan = formData.coaching?.plan;
      const successParams = new URLSearchParams({ payment_status: 'success' });
      const cancelParams = new URLSearchParams({ payment_status: 'cancelled' });
      if (svc) {
        successParams.set('service', svc);
        cancelParams.set('service', svc);
      }
      if (svc === 'coaching' && plan) {
        successParams.set('plan', plan);
        cancelParams.set('plan', plan);
      }
      const successReturnPath = `/schedule?${successParams.toString()}`;
      const cancelReturnPath = `/schedule?${cancelParams.toString()}`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          formData,
          userId: user.id,
          userEmail: user.email,
          returnTo: successReturnPath,
          cancelReturnTo: cancelReturnPath,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to create checkout session.');
      }

      const { url: checkoutUrl } = await response.json();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Did not receive a checkout URL.');
      }
    } catch (error) {
      console.error('Checkout initiation failed:', error);
      setIsProcessing(false);
    }
  };

  // Preserve page state and sign in with Google
  const handleGoogleSignIn = async () => {
    const stateToPreserve = {
      formData,
      currentStep,
      scrollPosition: window.scrollY,
    };
    try {
      sessionStorage.setItem('schedulingState', JSON.stringify(stateToPreserve));
    } catch (error) {
      console.error('Could not save scheduling state to sessionStorage:', error);
    }
    await signInWithGoogle();
  };

  // Flow definitions
  const flowConfig = {
    consultation: { totalSteps: 6 }, // 1 select -> 2 schedule -> 3 contact -> 4 payment -> 5 confirmation -> 6 chatbot
    coaching: { totalSteps: 6 },     // 1 select -> 2 plan -> 3 contact -> 4 payment -> 5 confirmation -> 6 chatbot
    pitchdeck: { totalSteps: 5 },    // 1 select -> 2 deck -> 3 contact -> 4 confirmation -> 5 chatbot
  };

  // Read payment status from URL and clean it
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const p = query.get('payment_status');
    if (p === 'success') {
      setPaymentStatus('success');
      // Jump to final Chatbot step for all flows after successful payment
      setCurrentStep(() => {
        const st = formData.serviceType;
        if (!st) return 1;
        return flowConfig[st].totalSteps;
      });
      window.history.replaceState(null, '', '/schedule');
    } else if (p === 'cancelled') {
      setPaymentStatus('cancelled');
      window.history.replaceState(null, '', '/schedule');
    }
  }, [formData.serviceType]);

  // Prefill contact info at step 3 for logged-in users
  useEffect(() => {
    if (user && profile && currentStep === 3) {
      if (!formData.contactInfo.name && !formData.contactInfo.email) {
        setFormData(prev => ({
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            name: profile.full_name || '',
            email: user.email || '',
            phone: profile.phone || '',
          },
        }));
      }
    }
  }, [user, profile, currentStep]); // keep dependencies as original intent

  // Get total steps for current flow
  const totalSteps = formData.serviceType ? flowConfig[formData.serviceType].totalSteps : 0;

  // Handle initial URL preselection for service/plan
  useEffect(() => {
    if (serviceFromUrl && serviceFromUrl !== formData.serviceType) {
      setFormData(prev => ({
        ...prev,
        serviceType: serviceFromUrl,
        coaching: {
          ...prev.coaching,
          plan: coachingPlanFromUrl || prev.coaching.plan,
        },
      }));
    }
  }, [serviceFromUrl, coachingPlanFromUrl]);

  // Step title (per-step, shown above content)
  const stepTitle = useMemo(() => {
    const st = formData.serviceType;

    // Step 1: Service selection (always the same)
    if (currentStep === 1) return t('scheduling.selectServiceTitle', { defaultValue: 'Choose a service' });

    if (!st) return t('scheduling.selectServiceTitle', { defaultValue: 'Service Selection' });

    if (st === 'consultation') {
      if (currentStep === 2) return t('scheduling.consultation.title', { defaultValue: 'Schedule your consultation' });
      if (currentStep === 3) return t('scheduling.contactInfo.title', { defaultValue: 'Your contact info' });
      if (currentStep === 4) return t('scheduling.paymentStep.summaryTitle', { defaultValue: 'Payment' });
      if (currentStep === 5) return t('scheduling.confirmation.title', { defaultValue: 'Confirmation' });
      if (currentStep === 6) return t('scheduling.chatbot.title', { defaultValue: "Let's chat" });
    }

    if (st === 'coaching') {
      if (currentStep === 2) return t('scheduling.coachingPlan.title', { defaultValue: 'Choose your coaching plan' });
      if (currentStep === 3) return t('scheduling.contactInfo.title', { defaultValue: 'Your contact info' });
      if (currentStep === 4) return t('scheduling.paymentStep.summaryTitle', { defaultValue: 'Payment' });
      if (currentStep === 5) return t('scheduling.confirmation.title', { defaultValue: 'Confirmation' });
      if (currentStep === 6) return t('scheduling.chatbot.title', { defaultValue: "Let's chat" });
    }

    if (st === 'pitchdeck') {
      if (currentStep === 2) return t('scheduling.pitchDeck.title', { defaultValue: 'Pitch deck options' });
      if (currentStep === 3) return t('scheduling.contactInfo.title', { defaultValue: 'Your contact info' });
      if (currentStep === 4) return t('scheduling.confirmation.title', { defaultValue: 'Confirmation' });
      if (currentStep === 5) return t('scheduling.chatbot.title', { defaultValue: "Let's chat" });
    }

    return t('scheduling.title', { defaultValue: 'Scheduling' });
  }, [currentStep, formData.serviceType, t]);

  // Step indicator text (Step X / Y)
  const stepIndicator = useMemo(() => {
    const st = formData.serviceType;
    const totalSteps = (st && flowConfig[st]) ? flowConfig[st].totalSteps : 5;

    return (
      <>
        <div className="text-white">Step</div>
        <div className="text-white">
          <span className="text-[#bfa200]">{currentStep}</span> / {totalSteps}
        </div>
      </>
    );
  }, [currentStep, formData.serviceType, flowConfig]);

  // Centralized disabled logic so we can style and remove motion when disabled
  const isNextDisabled = useMemo(() => {
    if (isProcessing) return true;

    const st = formData.serviceType;

    // Step 1: Service selection
    if (currentStep === 1) {
      if (!st) return true;
    }

    // Step 2 per-flow requirements
    if (currentStep === 2) {
      if (st === 'consultation') {
        const c = formData.consultation || {};
        if (!c.date || !c.duration || !c.time) return true;
      }
      if (st === 'coaching') {
        if (!formData.coaching?.plan) return true;
      }
      if (st === 'pitchdeck') {
        if (!formData.pitchdeck?.type) return true;
      }
    }

    // Step 3 contact info
    if (currentStep === 3) {
      const ci = formData.contactInfo || {};
      if (!ci.name || !ci.email) return true;
    }

    // Step 4 payment must be success for consultation/coaching
    if (
      currentStep === 4 &&
      (st === 'consultation' || st === 'coaching') &&
      paymentStatus !== 'success'
    ) {
      return true;
    }

    return false;
  }, [currentStep, formData, isProcessing, paymentStatus]);

  // If no service is selected and we're not on step 1, show service selection step
  if (!formData.serviceType && currentStep !== 1) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 w-full flex items-center justify-center p-4">
          <div className="w-full max-w-2xl p-8 space-y-4 bg-[#002147] rounded-2xl shadow-xl transition-shadow duration-200">
            <FormTitle title={stepTitle} />
            <ServiceSelectionStep />
          </div>
        </main>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="min-h-full flex flex-col">
      {/* Content area */}
      <main className="flex-1 w-full flex items-start">
        <div className="w-full max-w-2xl mx-auto px-4 py-4">
          <div className="w-full rounded-2xl  p-4 md:p-6 flex-shrink-0">
              {/* Step title */}
              <FormTitle title={stepTitle} />

              {/* Step content */}
              {currentStep === 1 && (
                <ServiceSelectionStep
                  selectedService={formData.serviceType}
                  onSelectService={handleServiceSelect}
                  showSelectedState={false}
                />
              )}

              {currentStep === 2 && formData.serviceType === 'consultation' && (
                <ConsultationScheduleStep
                  consultationData={formData.consultation}
                  onUpdateField={(fieldName, value) => handleUpdateField('consultation', fieldName, value)}
                />
              )}

              {currentStep === 2 && formData.serviceType === 'coaching' && (
                <CoachingPlanStep
                  selectedPlan={formData.coaching.plan}
                  onSelectPlan={handleCoachingPlanSelect}
                />
              )}

              {currentStep === 2 && formData.serviceType === 'pitchdeck' && (
                <PitchDeckStep
                  selectedDeck={formData.pitchdeck.type}
                  onSelectDeck={handlePitchDeckSelect}
                />
              )}

              {currentStep === 3 && (
                <ContactInfoStep
                  isLoggedIn={!!user}
                  contactInfoData={formData.contactInfo}
                  onUpdateField={(e) => handleUpdateField('contactInfo', e.target.name, e.target.value)}
                  onGoogleSignIn={handleGoogleSignIn}
                />
              )}

              {currentStep === 4 && (formData.serviceType === 'consultation' || formData.serviceType === 'coaching') && (
                <PaymentStep
                  formData={formData}
                  price={price}
                  onInitiateCheckout={handleInitiateCheckout}
                  isProcessing={isProcessing}
                />
              )}

              {(formData.serviceType === 'pitchdeck' && currentStep === 4) && (
                <div className="text-white/80">{t('scheduling.confirmation.title', { defaultValue: 'Confirmation' })}</div>
              )}
              {(formData.serviceType !== 'pitchdeck' && currentStep === 5) && (
                <div className="text-white/80">{t('scheduling.confirmation.title', { defaultValue: 'Confirmation' })}</div>
              )}

              {/* Final Chatbot step across all flows */}
              {((formData.serviceType === 'pitchdeck' && currentStep === 5) ||
                ((formData.serviceType === 'consultation' || formData.serviceType === 'coaching') && currentStep === 6)) && (
                <ChatbotStep 
                  mode="intake"
                  paymentStatus={paymentStatus}
                  serviceType={formData.serviceType}
                  consultation={formData.consultation}
                  coaching={formData.coaching}
                  pitchdeck={formData.pitchdeck}
                  contactInfo={formData.contactInfo}
                />
              )}

            </div>
          
        </div>
      </main>

      {/* Sticky controls at bottom (always visible) */}
      {formData.serviceType && (
        <div
          className="sticky bottom-0 left-0 right-0"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
        >
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            {/* Back */}
            <motion.button
              onClick={handleBack}
              type="button"
              className="px-6 py-2 text-sm md:text-base font-semibold text-white bg-black rounded-md shadow-xl cursor-pointer hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.98] transition"
              whileHover={{ scale: 1.06, transition: { duration: 0.08 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.08 } }}
            >
              {t('scheduling.backButton')}
            </motion.button>

            {/* Step indicator */}
            <div className="flex-1 flex justify-center">
              <span className="text-lg font-bold text-white">
                {stepIndicator}
              </span>
            </div>

            {/* Next or Finish */}
            {currentStep < totalSteps ? (
              <div className="flex flex-col items-end">
                <motion.button
                  onClick={handleNext}
                  type="button"
                  disabled={isNextDisabled}
                  aria-disabled={isNextDisabled}
                  aria-describedby={isNextDisabled ? 'next-hint' : undefined}
                  className={[
                    'px-6 py-2 text-sm md:text-base font-semibold rounded-md transition',
                    isNextDisabled
                      ? 'bg-[#bfa200]/30 text-gray-300 cursor-not-allowed shadow-none ring-1 ring-gray-400/30'
                      : 'bg-[#BFA200] text-black shadow-xl hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA200]/40 active:scale-[0.98]',
                  ].join(' ')}
                  // Remove hover/tap motion when disabled so it doesn't feel interactive
                  whileHover={isNextDisabled ? undefined : { scale: 1.06, transition: { duration: 0.08 } }}
                  whileTap={isNextDisabled ? undefined : { scale: 0.95, transition: { duration: 0.08 } }}
                >
                  {t('scheduling.nextButton')}
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => alert(t('scheduling.flowFinished'))}
                type="button"
                className="px-6 py-2 text-sm md:text-base font-semibold text-black bg-[#BFA200] rounded-md shadow-xl cursor-pointer hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA200]/40 active:scale-[0.98] transition"
                whileHover={{ scale: 1.06, transition: { duration: 0.08 } }}
                whileTap={{ scale: 0.95, transition: { duration: 0.08 } }}
              >
                {t('scheduling.finishButton')}
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}