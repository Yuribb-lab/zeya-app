import React, { useState, useEffect } from 'react';
import { ChevronDown, Heart, MessageCircle, Sparkles, Shield, Users, AlertTriangle } from 'lucide-react';
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_yhvld4q',
  templateId: 'template_p4xs1g7',
  publicKey: 'tm5FWkK5QT0tMftOh'
};

// 🤖 Telegram Bot Configuration
const TELEGRAM_CONFIG = {
  botToken: '7948996488:AAG_5aMk6_OFg22QM411BdZ54TUPzJqvnxA',
  chatId: 6447858148
};

// Stripe Payment Links (Live Production)
const stripePaymentLinks = {
  'Soft Love': 'https://buy.stripe.com/test_9B628kabNbbwc0je7Mbsc03',
  'Romantic': 'https://buy.stripe.com/dRm6oH5UJbSff1n1Nw8so00',
  'Deep Bond': 'https://buy.stripe.com/fZu5kDfvjg8vdXj0Js8so01',
  'Devoted': 'https://buy.stripe.com/fZu9AT6YNcWj8CZ2RA8so03',
  'Soulmate VIP': 'https://buy.stripe.com/5kQeVdaaZ09xaL7gIq8so04'
};

// Plan detection from URL parameters
const detectPlanFromUrl = (urlParams) => {
  const planParam = urlParams.get('plan');
  const planMap = {
    'soft-love': { name: 'Soft Love', price: 149 },
    'romantic': { name: 'Romantic', price: 399 },
    'deep-bond': { name: 'Deep Bond', price: 799 },
    'devoted': { name: 'Devoted', price: 1299 },
    'soulmate-vip': { name: 'Soulmate VIP', price: 1999 }
  };
  return planMap[planParam] || { name: 'Soft Love', price: 149 };
};

// Security Utilities
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
  }
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
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

// Privacy Policy Modal
const PrivacyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
        </div>
        <div className="p-6 space-y-4 text-sm text-gray-600">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">What Information We Collect</h3>
            <p>We collect information you provide when you sign up, including your name, age, country, communication preferences, and Telegram username.</p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">How We Use Your Information</h3>
            <p>We use your information to provide our companionship matching service and process payments.</p>
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

// Terms of Service Modal
const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Terms of Service</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
        </div>
        <div className="p-6 space-y-4 text-sm text-gray-600">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Description</h3>
            <p>Zeya provides emotional companionship services with verified companions for friendship and emotional support. 100% Safe-for-Work.</p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment and Cancellation</h3>
            <p>Monthly billing through Stripe. Cancel anytime with no fees.</p>
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

// Support Modal
const SupportModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Customer Support</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <Heart className="h-16 w-16 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">We're Here to Help! 💕</h3>
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
              </div>
            </div>
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
  const [showDataRecovery, setShowDataRecovery] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState('pending');

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
    emotionalSupportStyle: '',
    stressReliefStyle: '',
    emotionalOpenness: '',
    idealRelationshipStyle: ''
  });

  // Payment detection and processing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const paymentSuccess = urlParams.get('payment_success');
    const success = urlParams.get('success');
    
    const isPaymentSuccess = sessionId || paymentSuccess === 'true' || success === 'true';
    
    console.log('Payment Detection:', { sessionId, paymentSuccess, success, isPaymentSuccess });
    
    if (isPaymentSuccess) {
      const savedData = localStorage.getItem('zeyaOrderData');
      
      if (savedData) {
        const orderData = JSON.parse(savedData);
        setSelectedPlan(orderData.selectedPlan);
        setSurveyData(orderData.surveyData);
        
        // Send notifications
        processNotifications({
          ...orderData.surveyData,
          selectedPlan: orderData.selectedPlan
        });
        
        localStorage.removeItem('zeyaOrderData');
        setShowThankYou(true);
      } else {
        // Show data recovery
        const detectedPlan = detectPlanFromUrl(urlParams);
        setSelectedPlan(detectedPlan);
        setShowDataRecovery(true);
      }
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const plans = [
    {
      name: 'Soft Love',
      price: 149,
      features: ['Unlimited text messaging', 'Pure conversation focus', 'Basic emotional support', 'Daily connection']
    },
    {
      name: 'Romantic',
      price: 399,
      features: ['Unlimited text messaging', 'Voice messages twice per week', 'Custom nicknames & interests', 'Personalized conversations']
    },
    {
      name: 'Deep Bond',
      price: 799,
      features: ['Unlimited text messaging', 'Voice messages 3x per week', 'Video clips included', 'Weekly 15-minute video call', 'Monthly personalized video message']
    },
    {
      name: 'Devoted',
      price: 1299,
      features: ['Unlimited text messaging', 'Voice messages 5x per week', 'Video clips included', 'Two 15-minute video calls weekly', 'Virtual date scenario experiences', 'Special occasion gift reminders']
    },
    {
      name: 'Soulmate VIP',
      price: 1999,
      features: ['Unlimited text messaging', 'Unlimited voice messaging', 'Daily video clips', 'Two 30-minute video calls weekly', 'Monthly welcome video', 'Personalized "Emotion Album"', 'Priority connection anytime']
    }
  ];

  // Send Telegram notification
  const sendTelegramNotification = async (customerData) => {
    try {
      const message = `
🎉 *New Zeya Customer Registration!*

👤 *Name:* ${customerData.name || 'N/A'}
📅 *Age:* ${customerData.age || 'N/A'}
🌍 *Country:* ${customerData.country || 'N/A'}
📱 *Telegram:* ${customerData.telegramUsername || 'N/A'}

💰 *Plan:* ${customerData.selectedPlan?.name || 'N/A'}
💵 *Price:* $${customerData.selectedPlan?.price || 'N/A'}

📝 *Life Situation:* ${customerData.lifeSituation || 'N/A'}
💬 *Communication Style:* ${customerData.communicationStyle || 'N/A'}
🧠 *Personality Type:* ${customerData.personalityType || 'N/A'}
⏰ *Daily Schedule:* ${customerData.dailySchedule || 'N/A'}
🎯 *Interests:* ${customerData.interests?.join(', ') || 'N/A'}

💖 *Emotional Support:* ${customerData.emotionalSupportStyle || 'N/A'}
🌸 *Stress Relief:* ${customerData.stressReliefStyle || 'N/A'}
💕 *Emotional Openness:* ${customerData.emotionalOpenness || 'N/A'}
👥 *Ideal Relationship:* ${customerData.idealRelationshipStyle || 'N/A'}

⏰ *Registration Time:* ${new Date().toLocaleString('en-US')}
🌐 *Website:* https://zeyalove.com
      `.trim();

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      return { success: response.ok };
    } catch (error) {
      console.error('Telegram notification failed:', error);
      return { success: false };
    }
  };

  // Send email notification
  const sendEmailNotification = async (customerData) => {
    try {
      const templateParams = {
        user_name: customerData.name,
        user_age: customerData.age,
        user_country: customerData.country,
        telegram_username: customerData.telegramUsername,
        life_situation: customerData.lifeSituation || 'Not specified',
        communication_style: customerData.communicationStyle || 'Not specified',
        personality_type: customerData.personalityType || 'Not specified',
        daily_schedule: customerData.dailySchedule || 'Not specified',
        interests: customerData.interests?.join(', ') || 'Not specified',
        emotional_support_style: customerData.emotionalSupportStyle || 'Not specified',
        stress_relief_style: customerData.stressReliefStyle || 'Not specified',
        emotional_openness: customerData.emotionalOpenness || 'Not specified',
        ideal_relationship_style: customerData.idealRelationshipStyle || 'Not specified',
        selected_plan: customerData.selectedPlan?.name || 'Not specified',
        plan_price: customerData.selectedPlan?.price || 'Not specified',
        submission_time: new Date().toLocaleString()
      };

      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );

      return { success: true };
    } catch (error) {
      console.error('Email notification failed:', error);
      return { success: false };
    }
  };

  // Process notifications
  const processNotifications = async (customerData) => {
    setNotificationStatus('sending');
    
    try {
      const telegramResult = await sendTelegramNotification(customerData);
      const emailResult = await sendEmailNotification(customerData);
      
      if (telegramResult.success || emailResult.success) {
        setNotificationStatus('sent');
      } else {
        setNotificationStatus('error');
      }
    } catch (error) {
      setNotificationStatus('error');
    }
  };

  const handleSecureInputChange = (field, value) => {
    const sanitizedValue = SecurityUtils.sanitizeInput(value);
    
    let error = '';
    switch (field) {
      case 'name':
        if (!SecurityUtils.validateInput.name(sanitizedValue)) {
          error = 'Name must be 2-50 characters and contain only letters.';
        }
        break;
      case 'age':
        if (!SecurityUtils.validateInput.age(sanitizedValue)) {
          error = 'Age must be between 18 and 120.';
        }
        break;
      case 'telegramUsername':
        if (!SecurityUtils.validateInput.telegram(sanitizedValue)) {
          error = 'Please enter a valid Telegram username (@username).';
        }
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
    setShowSurvey(false);
    setShowDetailedSurvey(true);
  };

  const handleDetailedSurveySubmit = () => {
    setShowDetailedSurvey(false);
    setShowPlanSelection(true);
  };

  const handlePayment = (planName, price) => {
    const selectedPlanData = { name: planName, price: price };
    
    // Validate required data
    const requiredFields = ['name', 'age', 'country', 'telegramUsername'];
    const missingFields = requiredFields.filter(field => !surveyData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }
    
    // Save order data
    const orderData = {
      selectedPlan: selectedPlanData,
      surveyData: { ...surveyData },
      timestamp: Date.now()
    };
    
    localStorage.setItem('zeyaOrderData', JSON.stringify(orderData));
    
    // Redirect to Stripe
    const stripeUrl = stripePaymentLinks[planName];
    if (stripeUrl) {
      window.location.href = stripeUrl;
    } else {
      alert('Payment link not found. Please contact support.');
    }
  };

  // Data Recovery Component
  if (showDataRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-green-200">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-4">
              Payment Successful! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              We detected your successful payment. Please provide your information to complete your companion matching.
            </p>
            {selectedPlan && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
                <p className="text-blue-800 font-medium">
                  💰 <strong>Plan:</strong> {selectedPlan.name} (${selectedPlan.price}/month)
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Quick Registration
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.name}
                    onChange={(e) => handleSecureInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    placeholder="Your age"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.age}
                    onChange={(e) => handleSecureInputChange('age', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country/Region *</label>
                  <select 
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.country}
                    onChange={(e) => handleSecureInputChange('country', e.target.value)}
                  >
                    <option value="">Choose your country...</option>
                    <option value="US">United States 🇺🇸</option>
                    <option value="CA">Canada 🇨🇦</option>
                    <option value="UK">United Kingdom 🇬🇧</option>
                    <option value="AU">Australia 🇦🇺</option>
                    <option value="DE">Germany 🇩🇪</option>
                    <option value="FR">France 🇫🇷</option>
                    <option value="JP">Japan 🇯🇵</option>
                    <option value="OTHER">Other ✨</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telegram Username *</label>
                  <input
                    type="text"
                    placeholder="@your_username"
                    className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.telegramUsername}
                    onChange={(e) => handleSecureInputChange('telegramUsername', e.target.value)}
                  />
                  <p className="text-xs text-green-600 mt-1">Required: This is how your companion will reach you ✨</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => {
                  setShowDataRecovery(false);
                  setShowSurvey(true);
                }}
                className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Take Full Survey 📋
              </button>
              <button
                onClick={() => {
                  if (!surveyData.name || !surveyData.age || !surveyData.country || !surveyData.telegramUsername) {
                    alert('Please fill in all required fields');
                    return;
                  }
                  
                  const recoveryData = {
                    ...surveyData,
                    selectedPlan: selectedPlan
                  };
                  
                  processNotifications(recoveryData);
                  setShowDataRecovery(false);
                  setShowThankYou(true);
                }}
                disabled={!surveyData.name || !surveyData.age || !surveyData.country || !surveyData.telegramUsername}
                className="flex-1 bg-gradient-to-r from-green-400 to-blue-400 text-white px-8 py-4 rounded-2xl hover:from-green-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Complete Registration ✨
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Survey Component
  if (showSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-rose-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-4">
              AI Personality Assessment 💫
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="What should we call you?"
                    className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-rose-200'} rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all`}
                    value={surveyData.name}
                    onChange={(e) => handleSecureInputChange('name', e.target.value)}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    placeholder="Your age"
                    className={`w-full px-4 py-3 border ${errors.age ? 'border-red-300' : 'border-rose-200'} rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all`}
                    value={surveyData.age}
                    onChange={(e) => handleSecureInputChange('age', e.target.value)}
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country/Region</label>
                  <select 
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.country}
                    onChange={(e) => handleSecureInputChange('country', e.target.value)}
                  >
                    <option value="">Choose your country...</option>
                    <option value="US">United States 🇺🇸</option>
                    <option value="CA">Canada 🇨🇦</option>
                    <option value="UK">United Kingdom 🇬🇧</option>
                    <option value="AU">Australia 🇦🇺</option>
                    <option value="DE">Germany 🇩🇪</option>
                    <option value="FR">France 🇫🇷</option>
                    <option value="JP">Japan 🇯🇵</option>
                    <option value="OTHER">Other ✨</option>
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
                  />
                  {errors.telegramUsername && <p className="text-red-500 text-xs mt-1">{errors.telegramUsername}</p>}
                  <p className="text-xs text-rose-600 mt-1">Required: This is how your companion will reach you ✨</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-500 rounded focus:ring-blue-300"
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
                Maybe Later 🤔
              </button>
              <button
                onClick={handleBasicInfoSubmit}
                disabled={!agreedToTerms || !surveyData.name || !surveyData.age || !surveyData.country || !surveyData.telegramUsername}
                className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white px-8 py-4 rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Continue to AI Analysis 🧠
              </button>
            </div>
          </div>
        </div>
        
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      </div>
    );
  }

  // Detailed Survey Component
  if (showDetailedSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-h-[90vh] overflow-y-auto border border-rose-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-4">
              Deep Emotional Compatibility Analysis, {surveyData.name} 🧠
            </h2>
            <p className="text-gray-600">Our AI analyzes your emotional patterns to find your perfect soulmate match with 95% precision</p>
          </div>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Your Life's Beautiful Rhythm
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What fills your days?</label>
                  <select
                    className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.lifeSituation}
                    onChange={(e) => handleSecureInputChange('lifeSituation', e.target.value)}
                  >
                    <option value="">Your current chapter...</option>
                    <option value="student">📚 Student (learning & growing)</option>
                    <option value="working">💼 Working Professional</option>
                    <option value="entrepreneur">🚀 Entrepreneur (chasing dreams)</option>
                    <option value="between-jobs">🌟 Between Adventures</option>
                    <option value="retired">🌺 Enjoying Life's Rewards</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">When do you shine brightest?</label>
                  <select
                    className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.dailySchedule}
                    onChange={(e) => handleSecureInputChange('dailySchedule', e.target.value)}
                  >
                    <option value="">Your natural rhythm...</option>
                    <option value="early-bird">🌅 Early Bird (sunrise energy)</option>
                    <option value="regular">☀️ Regular Hours (steady flow)</option>
                    <option value="night-owl">🌙 Night Owl (moonlight magic)</option>
                    <option value="irregular">🎭 Irregular (spontaneous soul)</option>
                    <option value="flexible">🌈 Flexible (adaptable heart)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                How Your Soul Speaks
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your conversation style</label>
                  <select
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.communicationStyle}
                    onChange={(e) => handleSecureInputChange('communicationStyle', e.target.value)}
                  >
                    <option value="">How do you love to connect?</option>
                    <option value="deep-meaningful">💭 Deep & Meaningful (soul-searching)</option>
                    <option value="light-casual">🌸 Light & Casual (easy-going)</option>
                    <option value="humorous-playful">😄 Humorous & Playful (joyful spirit)</option>
                    <option value="mix-all">🎨 Mix of All (colorful conversations)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your beautiful energy</label>
                  <select
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.personalityType}
                    onChange={(e) => handleSecureInputChange('personalityType', e.target.value)}
                  >
                    <option value="">What describes your spirit?</option>
                    <option value="introverted">🌙 Introverted (gentle & thoughtful)</option>
                    <option value="extroverted">☀️ Extroverted (bright & social)</option>
                    <option value="balanced">⚖️ Balanced (harmonious blend)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Your Emotional Compass
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How do you prefer emotional support?</label>
                  <select
                    className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.emotionalSupportStyle}
                    onChange={(e) => handleSecureInputChange('emotionalSupportStyle', e.target.value)}
                  >
                    <option value="">Choose your support style...</option>
                    <option value="warm-empathy">🤗 Warm comfort & empathy</option>
                    <option value="practical-advice">💡 Practical advice & solutions</option>
                    <option value="quiet-listening">👂 Quiet listening & presence</option>
                    <option value="humor-energy">🌈 Humor & positive energy</option>
                    <option value="companionship">🤝 Simply being there together</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How do you heal from stress?</label>
                  <select
                    className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.stressReliefStyle}
                    onChange={(e) => handleSecureInputChange('stressReliefStyle', e.target.value)}
                  >
                    <option value="">Your healing method...</option>
                    <option value="alone-time">🛋️ Alone time to recharge</option>
                    <option value="social-connection">👫 Talking with people</option>
                    <option value="physical-activity">🏃‍♀️ Exercise & movement</option>
                    <option value="mindful-arts">🧘‍♀️ Meditation, music, arts</option>
                    <option value="new-environment">🎪 New places & experiences</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-100">
              <h3 className="text-lg font-semibold text-pink-800 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Your Heart's Desires
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How quickly do you open your heart?</label>
                  <select
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.emotionalOpenness}
                    onChange={(e) => handleSecureInputChange('emotionalOpenness', e.target.value)}
                  >
                    <option value="">Your emotional timing...</option>
                    <option value="immediate">🌅 Naturally open from the start</option>
                    <option value="few-days">🌤️ After a few days of chatting</option>
                    <option value="few-weeks">🌙 After weeks of building trust</option>
                    <option value="few-months">🌌 Slowly over several months</option>
                    <option value="situational">🎭 Depends on the feeling & situation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your ideal relationship dynamic?</label>
                  <select
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-transparent bg-white/70 transition-all"
                    value={surveyData.idealRelationshipStyle}
                    onChange={(e) => handleSecureInputChange('idealRelationshipStyle', e.target.value)}
                  >
                    <option value="">Your perfect connection...</option>
                    <option value="devoted-priority">👑 Being each other's top priority</option>
                    <option value="growth-partnership">🌱 Growing & evolving together</option>
                    <option value="stable-comfort">🏠 Comfortable, stable daily sharing</option>
                    <option value="passionate-romantic">🎭 Passionate & deeply romantic</option>
                    <option value="independent-support">🤝 Independent yet supportive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                What Makes Your Heart Dance
              </h3>
              <p className="text-sm text-gray-600 mb-4">Choose all the beautiful things that bring you joy</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Music', 'Movies', 'Books', 'Sports', 'Gaming', 'Art', 'Travel', 'Cooking', 'Technology', 'Fitness', 'Photography', 'Nature'].map((interest) => (
                  <label key={interest} className="flex items-center space-x-3 p-3 rounded-xl border-2 border-transparent hover:border-orange-200 hover:bg-white/50 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-300"
                      checked={surveyData.interests.includes(interest)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSurveyData({...surveyData, interests: [...surveyData.interests, interest]});
                        } else {
                          setSurveyData({...surveyData, interests: surveyData.interests.filter(i => i !== interest)});
                        }
                      }}
                    />
                    <span className="text-sm font-medium">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => {
                  setShowDetailedSurvey(false);
                  setShowSurvey(true);
                }}
                className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Back to Basic Info
              </button>
              <button
                onClick={handleDetailedSurveySubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white px-8 py-4 rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'AI Processing Your Emotional Profile...' : 'Complete Soulmate Matching 💕'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Plan Selection Component
  if (showPlanSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-6">
              Your AI Match is Ready! 🎯
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI has analyzed your personality and found your perfect companion match, {surveyData.name}! Choose your preferred connection level to begin.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-8 mb-12">
            {plans.map((plan, index) => (
              <div key={index} className={`rounded-3xl p-8 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-3 ${
                index === 2 
                  ? 'ring-4 ring-rose-300 bg-gradient-to-br from-rose-50 to-pink-50 transform scale-105' 
                  : 'bg-white/90 backdrop-blur-lg hover:bg-rose-50/50'
              } border border-rose-100`}>

                <div className="text-center mb-8">
                  <Heart className={`h-10 w-10 mx-auto mb-4 ${index === 2 ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}`} />
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{plan.name}</h3>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-2">
                    ${plan.price}
                  </div>
                  <div className="text-gray-600">per month</div>
                  {index === 2 && (
                    <div className="mt-3">
                      <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                        Most Popular ✨
                      </span>
                    </div>
                  )}
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Heart className="h-5 w-5 text-rose-400 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePayment(plan.name, plan.price)}
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    index === 2 
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-xl hover:shadow-2xl'
                      : 'bg-gray-100 text-gray-800 hover:bg-gradient-to-r hover:from-rose-400 hover:to-pink-400 hover:text-white'
                  }`}
                >
                  Choose This Plan ✨
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => {
                setShowPlanSelection(false);
                setShowDetailedSurvey(true);
              }}
              className="px-8 py-3 border-2 border-gray-300 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-medium"
            >
              Back to Survey
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Thank You Component
  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 text-center border border-rose-200">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-6">
            Payment Successful, {surveyData.name}!
          </h1>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-500 rounded-full p-3">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-3">✅ Your Payment is Complete!</h2>
            <p className="text-green-700 text-lg">
              🤖 Our AI matching system is now preparing your perfect companion match!
            </p>
            
            <div className="mt-4 p-3 bg-white rounded-xl border border-green-200">
              {notificationStatus === 'sending' && (
                <div className="flex items-center justify-center text-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                  Processing order confirmation...
                </div>
              )}
              {notificationStatus === 'sent' && (
                <div className="space-y-2">
                  <div className="text-green-700">✅ Order confirmation processed successfully</div>
                  <div className="text-sm text-gray-600">Customer service team has been notified of your registration</div>
                </div>
              )}
              {notificationStatus === 'error' && (
                <div className="text-red-700">⚠️ Notification processing delayed - Please contact support if needed</div>
              )}
              {notificationStatus === 'pending' && (
                <div className="text-gray-600">🔄 Preparing order confirmation...</div>
              )}
            </div>
          </div>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            🎯 <strong>Next Steps:</strong> Our advanced AI has analyzed your personality profile and is finalizing your perfect companion match. 
            You'll receive a private Telegram message within 12 hours to begin your emotional journey.
          </p>

          {selectedPlan && (
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl mb-8 border border-rose-100">
              <h3 className="text-lg font-bold text-rose-800 mb-2">
                ✨ Your Active {selectedPlan.name} Plan
              </h3>
              <p className="text-rose-600">Monthly subscription: ${selectedPlan.price}</p>
              <p className="text-sm text-rose-700 mt-2">🎯 Compatibility Score: 95%+ • Perfect Match Guaranteed</p>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-2xl mb-8 border border-blue-100">
            <h4 className="font-bold text-blue-800 mb-3">📱 Your Companion Will Contact You At:</h4>
            <div className="space-y-2 text-blue-700">
              <p><strong>Telegram:</strong> {surveyData.telegramUsername}</p>
              <p><strong>Plan:</strong> {selectedPlan?.name}</p>
              <p><strong>Location:</strong> {surveyData.country}</p>
              <p className="text-sm mt-3 text-blue-600">
                💬 <strong>Expected Contact Time:</strong> Within 12 hours of payment confirmation
              </p>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowThankYou(false);
              setShowSurvey(false);
              setShowDetailedSurvey(false);
              setShowPlanSelection(false);
              setShowDataRecovery(false);
              setSelectedPlan(null);
              setNotificationStatus('pending');
              setSurveyData({
                name: '',
                age: '',
                country: '',
                telegramUsername: '',
                lifeSituation: '',
                communicationStyle: '',
                personalityType: '',
                dailySchedule: '',
                interests: [],
                emotionalSupportStyle: '',
                stressReliefStyle: '',
                emotionalOpenness: '',
                idealRelationshipStyle: ''
              });
            }}
            className="bg-gradient-to-r from-rose-400 to-pink-400 text-white px-10 py-4 rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium text-lg"
          >
            Explore More About Zeya 🌟
          </button>
        </div>
      </div>
    );
  }

  // Main Homepage
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-rose-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Heart className="h-10 w-10 text-rose-500" />
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                  Zeya
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSurvey(true)}
                  className="bg-gradient-to-r from-rose-400 to-pink-400 text-white px-6 py-3 rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
                >
                  Begin Your Journey 💖
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 mb-8 leading-tight">
              Where Hearts Find <br/>
              <span className="text-rose-500">Real Connection</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Experience genuine friendship and emotional support with real verified companions matched by our advanced AI algorithm. 
              Our sophisticated matching system analyzes 50+ personality dimensions to find your perfect emotional companion.
            </p>
            <button
              onClick={() => setShowSurvey(true)}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-10 py-5 rounded-3xl text-xl font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-2xl transform hover:-translate-y-2"
            >
              Find Your Perfect Companion ✨
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white/60 backdrop-blur relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Zeya?</h2>
              <p className="text-xl text-gray-600">Experience authentic emotional connections with real people</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-rose-100 hover:bg-white/90 transition-all duration-300 shadow-lg">
                <Sparkles className="w-12 h-12 text-pink-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">AI-Powered Matching</h3>
                <p className="text-gray-600">Our advanced AI analyzes 50+ personality dimensions, communication styles, and emotional needs to find your perfect companion match with 95% compatibility.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-purple-100 hover:bg-white/90 transition-all duration-300 shadow-lg">
                <Shield className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">100% Safe-for-Work</h3>
                <p className="text-gray-600">Pure emotional intimacy with no sexual content. Focus on meaningful conversations and personal growth through authentic friendship.</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-indigo-100 hover:bg-white/90 transition-all duration-300 shadow-lg">
                <Users className="w-12 h-12 text-indigo-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Verified Companions</h3>
                <p className="text-gray-600">Connect with carefully screened, real women who specialize in emotional support and are trained in active listening and empathetic communication.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about your beautiful journey with Zeya
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "How does your AI matching algorithm work? 🤖",
                  answer: "Our proprietary AI analyzes 50+ data points including personality traits, communication styles, emotional needs, values, lifestyle preferences, and relationship goals. Using advanced machine learning, we calculate compatibility scores and match you with companions who complement your unique psychological profile. Our algorithm has a 95% satisfaction rate."
                },
                {
                  question: "How is Zeya different from platforms like OnlyFans? 🌟",
                  answer: "Zeya is a 100% Safe-for-Work (SFW) platform focused exclusively on emotional connection and meaningful relationships. Unlike adult platforms, we offer no sexual content whatsoever. Instead, we provide deeper emotional intimacy through genuine conversation, personal growth support, and authentic companionship that goes beyond surface-level interactions."
                },
                {
                  question: "What type of conversations can I have? 💬",
                  answer: "All conversations focus on emotional support, friendship, life advice, motivation, and meaningful companionship. Think of it like having a caring friend who's always there to listen, encourage, and support you through life's journey. We maintain strict SFW guidelines to ensure deep, meaningful connections."
                },
                {
                  question: "Are these real people or AI? 👥",
                  answer: "All our companions are real, verified women who specialize in providing emotional support and friendship. We use AI only for the initial matching process to ensure compatibility based on personality and communication style. Your conversations are always with real humans."
                },
                {
                  question: "What happens after I make a payment? ⏰",
                  answer: "Within 12 hours of payment confirmation, you'll receive a private Telegram message from your AI-matched companion. She'll introduce herself and begin providing emotional support and friendship according to your chosen plan and compatibility profile."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-rose-50/50 transition-all duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 pr-4">{faq.question}</h3>
                    <ChevronDown 
                      className={`h-6 w-6 text-rose-500 transform transition-transform duration-300 flex-shrink-0 ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="px-8 pb-6">
                      <div className="border-t border-rose-100 pt-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100">
                <h3 className="text-2xl font-bold text-rose-800 mb-4">Still Have Questions? 💖</h3>
                <p className="text-gray-600 mb-6">
                  Our team is here to help you find the perfect companion for your emotional journey.
                </p>
                <button 
                  onClick={() => setShowSurvey(true)}
                  className="bg-gradient-to-r from-rose-400 to-pink-400 text-white px-8 py-3 rounded-2xl hover:from-rose-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
                >
                  Start Your Journey Today ✨
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Heart className="h-12 w-12 text-rose-400" />
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
                  Zeya
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg max-w-2xl mx-auto">
                Creating meaningful connections through authentic friendship with real companions who care. 
                100% Safe-for-Work platform dedicated to emotional support and genuine relationships.
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-8">
              <p className="text-gray-400 mb-4 md:mb-0">© 2024 Zeya. Made with ❤️ for meaningful connections.</p>
              <div className="flex items-center space-x-6 text-gray-400">
                <button onClick={() => setShowPrivacyModal(true)} className="hover:text-rose-400 transition-colors">Privacy Policy</button>
                <button onClick={() => setShowTermsModal(true)} className="hover:text-rose-400 transition-colors">Terms of Service</button>
                <button onClick={() => setShowSupportModal(true)} className="hover:text-rose-400 transition-colors">Support</button>
              </div>
            </div>
          </div>
        </footer>
        
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
        <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
      </div>
    </ErrorBoundary>
  );
};

export default ZeyaApp;