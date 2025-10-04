import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Rocket, Clock, Mail, CheckCircle } from 'lucide-react';

interface LocationState {
  planName?: string;
  fromPricing?: boolean;
}

const ComingSoonPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubscribed(true);
    setIsSubmitting(false);

    // Reset form after 3 seconds
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  const planName = state?.planName || 'Premium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => state?.fromPricing ? navigate('/pricing') : navigate(-1)}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
          Back to {state?.fromPricing ? 'Pricing' : 'Previous Page'}
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                <Rocket className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4">
              {planName} Plan Coming Soon! 🚀
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              We're working hard to bring you amazing features. Get notified when we launch!
            </p>
          </div>

          {/* Content Section */}
          <div className="px-8 py-12">
            {/* What's Coming */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-blue-600" />
                What's Coming in {planName}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Enhanced Processing',
                    description: 'Lightning-fast analysis with priority queue access'
                  },
                  {
                    title: 'Advanced Features',
                    description: 'API access, batch processing, and custom prompts'
                  },
                  {
                    title: 'Premium Support',
                    description: '24/7 priority support with dedicated account manager'
                  },
                  {
                    title: 'Exclusive Tools',
                    description: 'Early access to beta features and new AI models'
                  }
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200">
              <div className="text-center mb-6">
                <Mail className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Be the First to Know
                </h3>
                <p className="text-gray-600">
                  Join our waitlist and get exclusive early bird pricing when we launch
                </p>
              </div>

              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isSubmitting ? 'Subscribing...' : 'Notify Me'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              ) : (
                <div className="max-w-md mx-auto text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h4 className="text-lg font-semibold text-green-900 mb-2">
                      You're on the list! 🎉
                    </h4>
                    <p className="text-green-700">
                      We'll notify you as soon as the {planName} plan is available.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Launch Timeline
              </h3>
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-600 to-purple-600 opacity-20"></div>
                <div className="space-y-8">
                  {[
                    { phase: 'Phase 1', title: 'Beta Testing', status: 'In Progress', date: 'Current' },
                    { phase: 'Phase 2', title: 'Feature Completion', status: 'Next', date: 'Q1 2025' },
                    { phase: 'Phase 3', title: 'Public Launch', status: 'Upcoming', date: 'Q2 2025' }
                  ].map((item, index) => (
                    <div key={index} className="relative flex items-center">
                      <div className="flex-1 text-right pr-8">
                        <h4 className="font-semibold text-gray-900">{item.phase}</h4>
                        <p className="text-sm text-gray-600">{item.title}</p>
                      </div>
                      <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full border-4 border-white shadow-lg">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1 pl-8">
                        <p className="text-sm font-medium text-blue-600">{item.status}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/pricing')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View All Plans
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Have questions? <a href="mailto:support@promptdetective.com" className="text-blue-600 hover:underline">Contact our team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
