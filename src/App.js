import React, { useState, useEffect } from 'react';
import { ChevronDown, Heart, MessageCircle, Sparkles, Shield, Users, AlertTriangle } from 'lucide-react';

// 🤖 Telegram Bot Configuration
const TELEGRAM_CONFIG = {
  botToken: '7948996488:AAG_5aMk6_OFg22QM411BdZ54TUPzJqvnxA',
  chatId: 6447858148
};

// 💳 Stripe Payment Links - 새로운 링크로 업데이트
const stripePaymentLinks = {
  'Sweet Beginning': 'https://buy.stripe.com/test_9B628kabNbbwc0je7Mbsc03',
  'Growing Close': 'https://buy.stripe.com/dRm6oH5UJbSff1n1Nw8so00',
  'Deep Connection': 'https://buy.stripe.com/fZu5kDfvjg8vdXj0Js8so01',
  'Devoted': 'https://buy.stripe.com/fZu9AT6YNcWj8CZ2RA8so03',
  'Soulmate VIP': 'https://buy.stripe.com/5kQeVdaaZ09xaL7gIq8so04'
};

// Security Utility Functions
const SecurityUtils = {
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .substring(0, 500);
  },

  validateInput: {
    name: (name) => {
      if (!name || name.length < 2 || name.length > 50) return false;
      return /^[a-zA-Z\s\u00C0-\u017F]+$/.test(name);
    },
    age: (age) => {
      const ageNum = parseInt(age);
      return ageNum >= 18 && ageNum <= 120;
    },
    telegram: (telegram) => {
      if (!telegram) return true;
      return /^@[a-zA-Z0-9_]{5,32}$/.test(telegram);
    }
  },

  rateLimiter: {
    attempts: new Map(),
    isAllowed: (key, maxAttempts = 5, windowMs = 900000) => {
      const now = Date.now();
      const attempts = SecurityUtils.rateLimiter.attempts.get(key) || [];
      const validAttempts = attempts.filter(time => now - time < windowMs);
      
      if (validAttempts.length >= maxAttempts) {
        return false;
      }
      
      validAttempts.push(now);
      SecurityUtils.rateLimiter.attempts.set(key, validAttempts);
      return true;
    }
  }
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 to-pink-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">Please refresh the page and try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Simple Privacy Policy Modal
const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4 text-sm text-gray-600">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">What Information We Collect</h3>
            <p>We collect information you provide when you sign up, including your name, age, country, communication preferences, and Telegram username. We also collect payment information through our secure payment processor.</p>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">How We Use Your Information</h3>
            <p>We use your information to provide our companionship matching service, process payments, and communicate with you about your account. We match you with compatible companions based on your preferences.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Information Sharing</h3>
            <p>We don't sell your personal information. We only share your information with your matched companions to facilitate your emotional connection experience and with service providers who help us operate our platform.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Data Security</h3>
            <p>We use industry-standard security measures to protect your personal information. All data is encrypted and stored securely.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Rights</h3>
            <p>You can access, update, or delete your personal information at any time. You can also opt out of communications and cancel your subscription anytime.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Us</h3>
            <p>If you have questions about this Privacy Policy, contact us at zeyasupport@zeyalove.com</p>
            <p className="text-xs text-gray-500 mt-2">Last Updated: December 2024</p>
          </section>
        </div>
      </div>
    </div>
  );
};

// Simple Terms of Service Modal
const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Terms of Service</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4 text-sm text-gray-600">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Description</h3>
            <p>Zeya provides emotional companionship services connecting users with verified companions for friendship and emotional support. Our service is 100% Safe-for-Work (SFW) with no sexual content.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Eligibility</h3>
            <p>You must be at least 18 years old to use our services. By using Zeya, you agree to provide accurate information and follow our community guidelines.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Acceptable Use</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Treat all companions with respect and kindness</li>
              <li>No sexual content, harassment, or inappropriate behavior</li>
              <li>Don't attempt to contact companions outside our platform</li>
              <li>Don't use our service for illegal purposes</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment and Cancellation</h3>
            <p>Our services are subscription-based with monthly billing through Stripe. You can cancel anytime with no cancellation fees. Your subscription will remain active until the end of your current billing period.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Privacy</h3>
            <p>All conversations are private and confidential. We don't monitor your conversations except as required by law.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Termination</h3>
            <p>We may terminate accounts that violate these terms. You can also close your account at any time.</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Us</h3>
            <p>For questions about these Terms, contact us at zeyasupport@zeyalove.com</p>
            <p className="text-xs text-gray-500 mt-2">Last Updated: December 2024</p>
          </section>
        </div>
      </div>
    </div>
  );
};

// Support Modal Component
const SupportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Customer Support</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <Heart className="h-16 w-16 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">We're Here to Help! 💆</h3>
            <p className="text-gray-600">Our support team is dedicated to ensuring you have the best experience with Zeya.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600 mr-3" />
                <h4 className="text-lg font-semibold text-gray-800">Email Support</h4>
              </div>
              <p className="text-gray-600 mb-4">Get help via email. We typically respond within 2-4 hours during business hours.</p>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Contact us:</span>
                  <p className="text-blue-600">zeyasupport@zeyalove.com</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>For all inquiries including:</p>
                  <ul className="list-disc ml-4 mt-1">
                    <li>Account & billing questions</li>
                    <li>Technical support</li>
                    <li>Companion matching</li>
                    <li>General help</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-rose-600 mr-3" />
                <h4 className="text-lg font-semibold text-gray-800">Telegram Support</h4>
              </div>
              <p className="text-gray-600 mb-4">Get instant help through Telegram for quick questions and real-time assistance.</p>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Contact us:</span>
                  <p className="text-rose-600">@ZeyaSupport</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Best for:</p>
                  <ul className="list-disc ml-4 mt-1">
                    <li>Quick questions</li>
                    <li>Urgent issues</li>
                    <li>Real-time chat</li>
                    <li>Community support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Shield className="h-6 w-6 text-green-600 mr-2" />
              Support Hours & Response Times
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Business Hours</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>Monday - Friday: 9:00 AM - 6:00 PM (EST)</li>
                  <li>Saturday: 10:00 AM - 4:00 PM (EST)</li>
                  <li>Sunday: Limited support available</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Response Times</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>Telegram: Usually within 30 minutes</li>
                  <li>Email: 2-4 hours during business hours</li>
                  <li>Urgent issues: Within 1 hour</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-medium text-red-800">Emergency or Safety Concerns</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              For immediate safety concerns, contact local authorities first. 
              For platform safety issues, reach us immediately at zeyasupport@zeyalove.com or @ZeyaSupport
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Zeya App Component
const ZeyaApp = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showDetailedSurvey, setShowDetailedSurvey] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customerNotificationStatus, setCustomerNotificationStatus] = useState('pending');

  const [surveyData, setSurveyData] = useState({
    name: '',
    age: '',
    country: '',
    telegramUsername: '',
    lifeSituation: '',
    communicationStyle: '',
    personalityType: '',
    dailySchedule: '',
    interests: [],
    emotionalSupport: '',
    stressRelief: '',
    emotionalOpenness: '',
    idealRelationship: ''
  });

  // 🔇 Enhanced payment detection with automatic redirect handling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentURL = window.location.href;
    
    // Collect all URL parameters for debugging
    const allParams = Object.fromEntries(urlParams.entries());
    
    // Check for ALL possible Stripe parameters
    const sessionId = urlParams.get('session_id');
    const paymentSuccess = urlParams.get('payment_success');
    const paymentIntent = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
    const checkoutSessionId = urlParams.get('checkout_session_id');
    const success = urlParams.get('success');
    const redirectStatus = urlParams.get('redirect_status');
    
    // Enhanced payment success detection
    const isPaymentSuccess = sessionId || paymentIntent || checkoutSessionId || 
                            paymentSuccess === 'true' || success === 'true' ||
                            redirectStatus === 'succeeded';
    
    console.log('💞 COMPLETE Payment Detection:', {
      currentURL,
      allParams,
      sessionId, 
      paymentSuccess, 
      paymentIntent,
      paymentIntentClientSecret,
      checkoutSessionId,
      success,
      redirectStatus,
      isPaymentSuccess
    });
    
    // Always log localStorage content
    const savedData = localStorage.getItem('zeyaOrderData');
    console.log('🔶 LocalStorage content:', savedData);
    
    if (isPaymentSuccess) {
      console.log('🔩 Payment success detected, restoring data...');
      
      // 저장된 데이터 복원
      const savedData = localStorage.getItem('zeyaOrderData');
      console.log('🔶 Raw saved data:', savedData);
      
      if (savedData) {
        try {
          const orderData = JSON.parse(savedData);
          console.log('🎞 Parsed order data:', orderData);
          
          // 즉시 상태 업데이트
          if (orderData.selectedPlan) {
            setSelectedPlan(orderData.selectedPlan);
            console.log('📄 Plan restored:', orderData.selectedPlan);
          }
          
          if (orderData.surveyData) {
            setSurveyData(orderData.surveyData);
            console.log('📄 Survey data restored:', orderData.surveyData);
          }
          
          // 텔레그램 알림 전송
          const fullCustomerData = {
            ...orderData.surveyData,
            selectedPlan: orderData.selectedPlan
          };
          
          console.log('🎾 Sending notification with full data:', fullCustomerData);
          
          // 즉시 알림 처리
          setTimeout(() => {
            processCustomerNotification(fullCustomerData);
          }, 1000);
          
        } catch (error) {
          console.error('❌ Error parsing saved data:', error);
        }
      } else {
        console.log('⚠️ No saved data found in localStorage');
      }
      
      // Thank you 페이지로 이동
      setShowSurvey(false);
      setShowDetailedSurvey(false);
      setShowPlanSelection(false);
      setShowThankYou(true);
      
      // URL 정리
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const plans = [
    {
      name: 'Sweet Beginning',
      price: 149,
      features: [
        'Unlimited text messaging',
        'Sweet good morning & goodnight messages', 
        'Gentle emotional support and encouragement',
        'Personal interest-based conversations',
        'Basic companionship experience'
      ]
    },
    {
      name: 'Growing Close',
      price: 399,
      features: [
        'Unlimited text messaging',
        'Voice messages to hear her sweet voice',
        'Custom pet names & shared interests',
        'Personalized conversations throughout the week',
        'Photo sharing of special moments'
      ]
    },
    {
      name: 'Deep Connection',
      price: 799,
      features: [
        'Unlimited text messaging',
        'Unlimited voice messages',
        'Regular video clips to see her smile',
        'Weekly personal video calls (15 minutes)',
        'Monthly personalized video messages',
        'Celebration of your special moments'
      ]
    },
    {
      name: 'Devoted',
      price: 1299,
      features: [
        'Unlimited text messaging',
        'Unlimited voice & video messages',
        'Twice weekly video calls (15 minutes each)',
        'Virtual companion experiences together',
        'Special occasion surprises & reminders',
        'Deep personal conversations & support',
        'Priority response to your messages'
      ]
    },
    {
      name: 'Soulmate VIP',
      price: 1999,
      features: [
        'Unlimited text messaging',
        'Unlimited voice & video communication',
        'Frequent personal video messages',
        'Extended video calls (30 minutes, twice weekly)',
        'Monthly friendship milestone videos',
        'Personalized "Our Journey Album" creation',
        '24/7 priority connection anytime',
        'Exclusive companion activities & experiences'
      ]
    }
  ];

  // 🤖 Enhanced Telegram notification with better error handling
  const sendTelegramNotification = async (customerData) => {
    try {
      console.log('🎾 Starting Telegram notification...');
      console.log('Customer Data for notification:', customerData);
      
      const message = `
🦦 *New Zeya Customer Registration!*

👀 *Name:* ${customerData.name || 'N/A'}
🎟 *Age:* ${customerData.age || 'N/A'}
🙇 *Country:* ${customerData.country || 'N/A'}
🎑 *Telegram:* ${customerData.telegramUsername || 'N/A'}

🔥 *Plan:* ${customerData.selectedPlan?.name || 'N/A'}
🔫 *Price:* $${customerData.selectedPlan?.price || 'N/A'}

🎷 *Life Situation:* ${customerData.lifeSituation || 'N/A'}
🔠 *Communication Style:* ${customerData.communicationStyle || 'N/A'}
🭬 *Personality Type:* ${customerData.personalityType || 'N/A'}
🌀 *Daily Schedule:* ${customerData.dailySchedule || 'N/A'}
💞 *Interests:* ${customerData.interests?.join(', ') || 'N/A'}

🔇 *Emotional Support:* ${customerData.emotionalSupport || 'N/A'}
🙵 *Stress Relief:* ${customerData.stressRelief || 'N/A'}
🔆 *Emotional Openness:* ${customerData.emotionalOpenness || 'N/A'}
🫁 *Ideal Relationship:* ${customerData.idealRelationship || 'N/A'}

🌀 *Registration Time:* ${new Date().toLocaleString('en-US')}
🙋 *Website:* https://zeyalove.com
      `.trim();

      console.log('🎷 Message to send:', message);
      
      const telegramURL = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
      console.log('🙋 Telegram URL:', telegramURL);
      
      const requestBody = {
        chat_id: TELEGRAM_CONFIG.chatId,
        text: message,
        parse_mode: 'Markdown'
      };
      
      console.log('🎀 Request body:', requestBody);
      
      const response = await fetch(telegramURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('🎂 Telegram Response:', responseData);
      console.log('🎤 Response status:', response.status);
      console.log('📄 Response ok:', response.ok);

      if (response.ok && responseData.ok) {
        console.log('📄 Telegram notification sent successfully!');
        return { success: true, data: responseData };
      } else {
        console.error('❌ Telegram API error:', responseData);
        return { success: false, error: responseData };
      }
    } catch (error) {
      console.error('❌ Telegram notification failed with exception:', error);
      return { success: false, error: error.message };
    }
  };

  // Process customer notifications with enhanced reliability
  const processCustomerNotification = async (customerData) => {
    console.log('🔒 STARTING NOTIFICATION PROCESS...');
    console.log('🎤 Notification data:', customerData);
    setCustomerNotificationStatus('sending');
    
    try {
      console.log('📄 Sending Telegram notification...');
      const telegramResult = await sendTelegramNotification(customerData);
      
      console.log('🎂 Telegram result:', telegramResult);
      
      if (telegramResult.success) {
        setCustomerNotificationStatus('sent');
        console.log('📄 NOTIFICATION SENT SUCCESSFULLY!');
        
        // 성공 로그를 localStorage에도 저장
        const notificationLog = {
          timestamp: new Date().toISOString(),
          status: 'success',
          customerName: customerData.name,
          plan: customerData.selectedPlan?.name,
          telegramResponse: telegramResult.data
        };
        localStorage.setItem('zeya_notification_log', JSON.stringify(notificationLog));
        
      } else {
        setCustomerNotificationStatus('error');
        console.error('❌ NOTIFICATION FAILED:', telegramResult.error);
        
        // 실패 로그 저장
        const errorLog = {
          timestamp: new Date().toISOString(),
          status: 'failed',
          customerName: customerData.name,
          error: telegramResult.error,
          retryRecommended: true
        };
        localStorage.setItem('zeya_notification_error', JSON.stringify(errorLog));
        
        // 자동 재시도 (1번)
        console.log('🎽 Attempting automatic retry...');
        setTimeout(async () => {
          const retryResult = await sendTelegramNotification(customerData);
          if (retryResult.success) {
            setCustomerNotificationStatus('sent');
            console.log('📄 RETRY SUCCESSFUL!');
          } else {
            console.error('❌ RETRY ALSO FAILED');
          }
        }, 3000);
      }
    } catch (error) {
      setCustomerNotificationStatus('error');
      console.error('❌ CRITICAL ERROR in notification process:', error);
    }
  };

  const handleSecureInputChange = (field, value) => {
    if (!SecurityUtils.rateLimiter.isAllowed(`input_${field}`, 50, 60000)) {
      setErrors(prev => ({ ...prev, [field]: 'Too many input attempts. Please wait a moment and try again.' }));
      return;
    }

    const sanitizedValue = SecurityUtils.sanitizeInput(value);
    
    let error = '';
    switch (field) {
      case 'name':
        if (!SecurityUtils.validateInput.name(sanitizedValue)) {
          error = 'Name must be 2-50 characters long and contain only letters.';
        }
        break;
      case 'age':
        if (!SecurityUtils.validateInput.age(sanitizedValue)) {
          error = 'You must be between 18 and 120 years old to join.';
        }
        break;
      case 'telegramUsername':
        if (!SecurityUtils.validateInput.telegram(sanitizedValue)) {
          error = 'Please enter a valid Telegram username format (@username).';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    setSurveyData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const handleBasicInfoSubmit = () => {
    if (!agreedToTerms) {
      alert('Please agree to our Terms of Service and Privacy Policy to continue.');
      return;
    }
    
    // 기본 정보 검증
    if (!surveyData.name || !surveyData.age || !surveyData.country || !surveyData.telegramUsername) {
      alert('Please fill in all required fields.');
      return;
    }
    
    console.log('📄 Basic info submitted:', surveyData);
    setShowSurvey(false);
    setShowDetailedSurvey(true);
  };

  const handleDetailedSurveySubmit = () => {
    // 상세 설문조사 필수 필드 검증
    const requiredFields = {
      lifeSituation: 'Life Situation',
      communicationStyle: 'Communication Style', 
      personalityType: 'Personality Type',
      dailySchedule: 'Daily Schedule',
      emotionalSupport: 'Emotional Support Style',
      stressRelief: 'Stress Relief Method',
      emotionalOpenness: 'Emotional Openness',
      idealRelationship: 'Ideal Relationship Style'
    };
    
    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!surveyData[field]) {
        missingFields.push(label);
      }
    }
    
    // 관심사 검증 (최소 1개)
    if (!surveyData.interests || surveyData.interests.length === 0) {
      missingFields.push('At least one Interest');
    }
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n\n• ${missingFields.join('\n• ')}`);
      return;
    }
    
    console.log('📄 Detailed survey submitted:', surveyData);
    setShowDetailedSurvey(false);
    setShowPlanSelection(true);
  };

  const handlePayment = (planName, price) => {
    const selectedPlanData = { name: planName, price: price };
    setSelectedPlan(selectedPlanData);
    
    console.log('🔶 STARTING DATA SAVE PROCESS...');
    console.log('🎤 Current Survey Data:', surveyData);
    console.log('🎥 Selected Plan Data:', selectedPlanData);
    
    // 데이터 완전성 검증
    const requiredFields = ['name', 'age', 'country', 'telegramUsername'];
    const missingFields = requiredFields.filter(field => !surveyData[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      alert(`Missing required information: ${missingFields.join(', ')}\nPlease complete the survey first.`);
      return;
    }
    
    // 완전한 데이터 준비
    const completeOrderData = {
      selectedPlan: selectedPlanData,
      surveyData: { 
        ...surveyData,
        completedAt: new Date().toISOString(),
        savedForPayment: true
      },
      timestamp: Date.now(),
      version: '2.0'
    };
    
    console.log('🎀 Complete order data to save:', completeOrderData);
    
    // localStorage에 여러 방식으로 저장 (백업)
    try {
      // 기존 데이터 완전 제거
      localStorage.removeItem('zeyaOrderData');
      localStorage.removeItem('zeya_backup');
      localStorage.removeItem('zeya_survey');
      localStorage.removeItem('zeya_plan');
      
      // 메인 저장
      localStorage.setItem('zeyaOrderData', JSON.stringify(completeOrderData));
      
      // 백업 저장 (여러 경로)
      localStorage.setItem('zeya_backup', JSON.stringify(completeOrderData));
      localStorage.setItem('zeya_survey', JSON.stringify(surveyData));
      localStorage.setItem('zeya_plan', JSON.stringify(selectedPlanData));
      
      // 즉시 검증
      const verification = localStorage.getItem('zeyaOrderData');
      const backupVerification = localStorage.getItem('zeya_backup');
      
      if (!verification || !backupVerification) {
        throw new Error('Failed to save data to localStorage');
      }
      
      const parsedData = JSON.parse(verification);
      console.log('📄 Data saved and verified successfully:', parsedData);
      
      // 추가 검증
      if (!parsedData.surveyData.name || !parsedData.selectedPlan.name) {
        throw new Error('Saved data is incomplete');
      }
      
    } catch (error) {
      console.error('❌ Failed to save order data:', error);
      alert('Error saving your information. Please try again or contact support.');
      return;
    }
    
    // Stripe 결제로 리다이렉트
    const stripeUrl = stripePaymentLinks[planName];
    
    console.log('🔕 Available Stripe Links:', stripePaymentLinks);
    console.log(`💞 Selected plan: ${planName}`);
    console.log(`🔩 Stripe URL for ${planName}:`, stripeUrl);
    
    if (stripeUrl) {
      console.log(`📄 Redirecting to ${planName} payment...`);
      console.log(`🎧 Full redirect URL: ${stripeUrl}`);
      
      // 리다이렉트 전 마지막 확인
      setTimeout(() => {
        const finalCheck = localStorage.getItem('zeyaOrderData');
        console.log('🔇 Final check before redirect:', finalCheck ? 'Data exists' : 'Data missing');
        window.location.href = stripeUrl;
      }, 500);
      
    } else {
      console.error('❌ No Stripe URL found for plan:', planName);
      alert(`⚠️ Payment link for ${planName} is not configured yet. Please contact support at zeyasupport@zeyalove.com`);
    }
  };

  // Survey Component
  if (showSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-rose-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-4">
              AI Personality Assessment 🔟
            </h2>
            <p className="text-gray-600">Help our advanced AI understand your unique personality to find your perfect companion match</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100">
              <h3 className="text-lg font-semibold text-rose-800 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                About You
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    placeholder="What should we call you?"
                    className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-rose-200'} rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all`}
                    value={surveyData.name}
                    onChange={(e) => handleSecureInputChange('name', e.target.value)}
                    required
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    placeholder="Your age"
                    className={`w-full px-4 py-3 border ${errors.age ? 'border-red-300' : 'border-rose-200'} rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all`}
                    value={surveyData.age}
                    onChange={(e) => handleSecureInputChange('age', e.target.value)}
                    required
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country/Region *</label>
                  <select 
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.country}
                    onChange={(e) => handleSecureInputChange('country', e.target.value)}
                    required
                  >
                    <option value="">Choose your country...</option>
                    <option value="US">United States 🇺🇸</option>
                    <option value="CA">Canada 🇨🇦</option>
                    <option value="UK">United Kingdom 🇬🇧</option>
                    <option value="AU">Australia 🇦🇺</option>
                    <option value="DE">Germany 🇩🇪</option>
                    <option value="FR">France 🇫🇷</option>
                    <option value="JP">Japan 🇯🇵</option>
                    <option value="SG">Singapore 🇸🇬</option>
                    <option value="NL">Netherlands 🇳🇱</option>
                    <option value="SE">Sweden 🇸🇪</option>
                    <option value="NO">Norway 🇳🇴</option>
                    <option value="OTHER">Other 🌍</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telegram Username *</label>
                  <input
                    type="text"
                    placeholder="@your_username"
                    className={`w-full px-4 py-3 border ${errors.telegramUsername ? 'border-red-300' : 'border-rose-200'} rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all`}
                    value={surveyData.telegramUsername}
                    onChange={(e) => handleSecureInputChange('telegramUsername', e.target.value)}
                    required
                  />
                  {errors.telegramUsername && <p className="text-red-500 text-xs mt-1">{errors.telegramUsername}</p>}
                  <p className="text-xs text-rose-600 mt-1">Required: This is how your companion will reach you 💄</p>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-500 rounded focus:ring-blue-300"
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setShowSurvey(false)}
                className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Maybe Later 🤺
              </button>
              <button
                onClick={handleBasicInfoSubmit}
                disabled={!agreedToTerms || !surveyData.name || !surveyData.age || !surveyData.country || !surveyData.telegramUsername}
                className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white px-8 py-4 rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Continue to AI Analysis 🭬
              </button>
            </div>
          </div>
        </div>
        
        {/* Modals */}
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      </div>
    );
  };