import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Shield, Crown, Users, Sparkles, TrendingUp, Clock, Gift } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  launchPriceMonthly?: number;
  launchPriceYearly?: number;
  dailyLimit: number;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  badge?: string;
}

interface CreditPack {
  name: string;
  price: number;
  analyses: number;
  validity: number;
  perAnalysis: number;
}

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showLaunchPricing, setShowLaunchPricing] = useState(true);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      priceMonthly: 0,
      priceYearly: 0,
      dailyLimit: 5,
      description: 'Perfect for trying out our service',
      features: [
        '5 analyses per day (resets daily)',
        'Image-to-prompt only',
        'Standard processing (30-60 seconds)',
        'Basic prompt output',
        'Community forum access',
        'Watermarked results',
        'Max file size: 5MB',
        'Email support'
      ],
      cta: 'Get Started Free',
      popular: false,
      icon: <Star className="w-6 h-6" />,
      color: 'gray',
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      id: 'starter',
      name: 'Starter',
      priceMonthly: 299,
      priceYearly: 2990,
      launchPriceMonthly: 199,
      launchPriceYearly: 1990,
      dailyLimit: 15,
      description: 'Individual creators & YouTubers',
      features: [
        '15 analyses per day (resets daily)',
        'Image & video support (videos up to 30 seconds)',
        'Priority processing (15-30 seconds)',
        'Enhanced prompt details (style, lighting, mood)',
        'Download as TXT/JSON',
        'Email support (48-hour response)',
        'No watermark',
        'Max file size: 20MB'
      ],
      cta: 'Start Free Trial',
      popular: false,
      icon: <Zap className="w-6 h-6" />,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      badge: '33% OFF'
    },
    {
      id: 'pro',
      name: 'Pro',
      priceMonthly: 699,
      priceYearly: 6990,
      launchPriceMonthly: 499,
      launchPriceYearly: 4990,
      dailyLimit: 50,
      description: 'Freelancers, developers & power users',
      features: [
        '50 analyses per day (resets daily)',
        'All video lengths supported (up to 5 minutes)',
        'Fastest processing (10-20 seconds)',
        'Advanced prompt breakdown + model suggestions',
        'REST API access (5,000 calls/month)',
        'Batch processing (upload 10 images at once)',
        'Download as TXT/JSON/CSV',
        'Custom prompt templates',
        'Usage analytics dashboard',
        'Priority email support (24-hour response)',
        'Max file size: 100MB',
        'Webhook notifications'
      ],
      cta: 'Start Free Trial',
      popular: true,
      icon: <Shield className="w-6 h-6" />,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      badge: '29% OFF'
    },
    {
      id: 'business',
      name: 'Business',
      priceMonthly: 1299,
      priceYearly: 12990,
      launchPriceMonthly: 999,
      launchPriceYearly: 9990,
      dailyLimit: 150,
      description: 'Small agencies, content teams & startups',
      features: [
        '150 analyses per day (resets daily)',
        'Unlimited video length',
        'Ultra-fast processing (5-15 seconds)',
        'Everything in Pro +',
        'API access (20,000 calls/month)',
        'Batch processing (50 images/videos at once)',
        'Team workspace (5 user seats)',
        'Shared prompt library',
        'Advanced analytics & reporting',
        'Priority support (12-hour response)',
        'Custom integrations support',
        'Max file size: 500MB',
        'Rate limit customization'
      ],
      cta: 'Start Free Trial',
      popular: false,
      icon: <Crown className="w-6 h-6" />,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
      badge: '23% OFF'
    }
  ];

  const creditPacks: CreditPack[] = [
    { name: 'Mini', price: 99, analyses: 20, validity: 15, perAnalysis: 4.95 },
    { name: 'Standard', price: 249, analyses: 60, validity: 30, perAnalysis: 4.15 },
    { name: 'Power', price: 499, analyses: 150, validity: 60, perAnalysis: 3.33 }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleCTAClick = (plan: PricingPlan) => {
    if (plan.id === 'free') {
      navigate('/signup');
    } else {
      navigate('/signup', { 
        state: { 
          planName: plan.name,
          planId: plan.id,
          fromPricing: true 
        } 
      });
    }
  };

  const getPrice = (plan: PricingPlan) => {
    if (plan.priceMonthly === 0) return 0;
    
    const basePrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
    const launchPrice = billingCycle === 'monthly' ? plan.launchPriceMonthly : plan.launchPriceYearly;
    
    return showLaunchPricing && launchPrice ? launchPrice : basePrice;
  };

  const getSavings = (plan: PricingPlan) => {
    if (billingCycle === 'yearly' && plan.priceYearly > 0) {
      const monthlyTotal = plan.priceMonthly * 12;
      const yearlySavings = monthlyTotal - plan.priceYearly;
      const percentage = Math.round((yearlySavings / monthlyTotal) * 100);
      return { amount: yearlySavings, percentage };
    }
    return null;
  };

  const getCardStyles = (plan: PricingPlan) => {
    const isSelected = selectedPlan === plan.id;
    const baseStyles = 'relative border rounded-2xl shadow-sm transition-all duration-300 cursor-pointer transform hover:scale-105';
    
    if (plan.popular) {
      return `${baseStyles} ${
        isSelected
          ? 'border-purple-500 ring-4 ring-purple-200 shadow-2xl scale-105'
          : 'border-purple-300 ring-2 ring-purple-100 shadow-lg hover:shadow-xl'
      }`;
    }
    
    return `${baseStyles} ${
      isSelected
        ? `border-${plan.color}-500 ring-4 ring-${plan.color}-200 shadow-xl scale-105`
        : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
    }`;
  };

  const getButtonStyles = (plan: PricingPlan) => {
    if (plan.popular) {
      return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg';
    }
    
    return `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90`;
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-sm font-semibold mb-4">
            <Gift className="w-4 h-4 mr-2" />
            First 500 Users - Lock in Launch Pricing Forever! 
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Pricing That Makes Sense for India
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Daily limits that feel unlimited. Video + Image support. API access at ₹699. 
            <span className="text-purple-600 font-semibold"> Save 40-60% vs US tools.</span>
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                billingCycle === 'yearly' ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
              <TrendingUp className="w-3 h-3 mr-1" />
              Save 17%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const savings = getSavings(plan);
            const isLaunchPrice = showLaunchPricing && plan.launchPriceMonthly && plan.id !== 'free';
            
            return (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={getCardStyles(plan)}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1.5 rounded-full shadow-lg flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span className="text-xs font-bold uppercase">Most Popular</span>
                    </div>
                  </div>
                )}

                {/* Launch Offer Badge */}
                {isLaunchPrice && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
                      <div className="text-center -rotate-12">
                        <div className="text-xs font-bold">{plan.badge}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Card Content */}
                <div className="p-6">
                  {/* Icon and Name */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.gradient} text-white`}>
                      {plan.icon}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 h-10">{plan.description}</p>
                  
                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-gray-900">
                        ₹{price}
                      </span>
                      <span className="text-base font-medium text-gray-500 ml-1">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    
                    {/* Original Price Strikethrough for Launch Offers */}
                    {isLaunchPrice && (
                      <div className="mt-1">
                        <span className="text-lg text-gray-400 line-through">
                          ₹{billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                        </span>
                        <span className="ml-2 text-sm text-green-600 font-semibold">
                          Lock in forever!
                        </span>
                      </div>
                    )}

                    {/* Yearly Savings */}
                    {savings && !isLaunchPrice && (
                      <p className="text-sm text-green-600 font-medium mt-1 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Save ₹{savings.amount} ({savings.percentage}% off)
                      </p>
                    )}

                    {/* Daily Limit Highlight */}
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      <Clock className="w-3 h-3 mr-1" />
                      {plan.dailyLimit} analyses/day
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCTAClick(plan);
                    }}
                    className={`w-full py-3 px-6 rounded-xl text-center font-semibold transition-all duration-200 ${getButtonStyles(plan)}`}
                  >
                    {plan.cta}
                  </button>
                </div>
                
                {/* Features */}
                <div className="px-6 pb-8 border-t border-gray-100 pt-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
                    What's included
                  </h4>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="flex-shrink-0 h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credit Packs Section */}
        <div className="mt-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Sachet Pricing - Pay As You Go
            </h3>
            <p className="text-lg text-gray-600">
              No subscription? No problem. Buy credits that work for you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {creditPacks.map((pack) => (
              <div key={pack.name} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-300">
                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{pack.name}</h4>
                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-gray-900">₹{pack.price}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {pack.analyses} analyses
                    </p>
                    <p className="flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      Valid for {pack.validity} days
                    </p>
                    <p className="text-xs text-purple-600 font-semibold mt-3">
                      ₹{pack.perAnalysis.toFixed(2)} per analysis
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/signup', { state: { creditPack: pack.name } })}
                    className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            💡 Credits don't expire by day - total count is valid for the entire period!
          </p>
        </div>

        {/* Student Discount Banner */}
        <div className="mt-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Student/Educational Discount
              </h3>
              <p className="text-green-50">
                Get 40% off with your .edu email address! 
                Starter: ₹179/mo • Pro: ₹419/mo • Business: ₹779/mo
              </p>
            </div>
            <button
              onClick={() => navigate('/signup', { state: { studentDiscount: true } })}
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Claim Discount
            </button>
          </div>
        </div>

        {/* Comparison with US Tools */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Why Prompt Detective? Compare & Save
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-purple-100 to-blue-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-purple-700">
                    Prompt Detective
                    <div className="text-xs font-normal text-purple-600 mt-1">🇮🇳 India Optimized</div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">ImagePrompt.org</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Flux1.ai</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">VideoToPrompt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-purple-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">India Pricing</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">✅ ₹299 - ₹1,299</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">❌ $14.99+ (₹1,329+)</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">❌ USD only</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">❌ USD only</td>
                </tr>
                <tr className="hover:bg-purple-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Daily Limits</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">✅ 5-150/day</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">❌ Monthly caps</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">✅ Unlimited</td>
                  <td className="px-6 py-4 text-center text-sm text-yellow-600">⚠️ Limited</td>
                </tr>
                <tr className="hover:bg-purple-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Video Support</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">✅ All tiers</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">❌ Pro only</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">❌ None</td>
                  <td className="px-6 py-4 text-center text-sm text-yellow-600">✅ Limited</td>
                </tr>
                <tr className="hover:bg-purple-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">API Access</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">✅ At ₹699</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">❌ Higher tiers</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">❌ None</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">❌ None</td>
                </tr>
                <tr className="hover:bg-purple-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Sachet Pricing</td>
                  <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">✅ ₹99-₹499</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">❌ No</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">❌ No</td>
                  <td className="px-6 py-4 text-center text-sm text-red-600">❌ No</td>
                </tr>
                <tr className="hover:bg-purple-50 transition-colors bg-purple-100">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">Your Savings</td>
                  <td className="px-6 py-4 text-center text-lg text-green-700 font-bold">Save 40-60%</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
            <Users className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-purple-900 font-semibold">
              Join 2,000+ Indian creators already using Prompt Detective
            </span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  question: 'How does the daily limit work?',
                  answer: 'Your daily limit resets every day at midnight IST. This means you get fresh analyses every day - it never runs out! Unlike monthly caps that force you to wait 30 days, our daily reset ensures consistent access.'
                },
                {
                  question: 'Can I use UPI/Paytm/Razorpay?',
                  answer: 'Yes! We accept UPI, Paytm, Razorpay, credit/debit cards, and net banking. Payment is 100% secure and processed in INR.'
                },
                {
                  question: 'What if I run out of analyses?',
                  answer: 'You can upgrade your plan anytime, or purchase a credit pack for immediate access. Credit packs are perfect for occasional bursts of work!'
                },
                {
                  question: 'Is the launch pricing really locked in forever?',
                  answer: 'Yes! First 500 users who subscribe during our launch period will lock in their pricing forever. Even if we increase prices later, you keep your discounted rate as long as you stay subscribed.'
                },
                {
                  question: 'Do you offer refunds?',
                  answer: 'Absolutely! We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, we\'ll refund you - no questions asked.'
                },
                {
                  question: 'How does the referral program work?',
                  answer: 'Refer a friend who becomes a paying user, and you both get ₹150 credit! Credits can be used toward your subscription or add-ons. There\'s no limit on referrals - the more you refer, the more you save.'
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept UPI, Paytm, Razorpay, all major credit/debit cards, and net banking. For Business plans, we can also arrange invoice billing.'
                },
                {
                  question: 'Can I get support in Hindi?',
                  answer: 'Yes! Our email support team can assist you in both English and Hindi during IST business hours (9 AM - 6 PM IST).'
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Workflow?
            </h3>
            <p className="text-xl text-purple-100 mb-4 max-w-2xl mx-auto">
              Join thousands of Indian creators who've made the switch
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-purple-100 mb-8">
              <span className="flex items-center">
                <Check className="w-4 h-4 mr-1" /> 14-day free trial
              </span>
              <span className="flex items-center">
                <Check className="w-4 h-4 mr-1" /> No credit card required
              </span>
              <span className="flex items-center">
                <Check className="w-4 h-4 mr-1" /> Cancel anytime
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Free Trial →
              </button>
              <button
                onClick={() => navigate('/signup', { state: { creditPack: 'Mini' } })}
                className="px-8 py-4 bg-purple-500 text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-purple-400 transition-colors shadow-lg"
              >
                Buy Credit Pack
              </button>
            </div>
            <p className="mt-6 text-sm text-purple-200">
              🎉 Launch offer ends soon - Lock in your pricing today!
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex items-center justify-center space-x-8 text-gray-400">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            <span className="text-sm">Secure Payments</span>
          </div>
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span className="text-sm">14-Day Guarantee</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            <span className="text-sm">2000+ Users</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
