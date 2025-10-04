import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Shield, Crown } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>('Basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out our service',
      features: [
        '5 analyses per month',
        'Basic image support',
        'Standard processing speed',
        'Email support',
        'Community forum access'
      ],
      cta: 'Get Started Free',
      popular: false,
      icon: <Star className="w-6 h-6" />,
      color: 'gray',
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: billingCycle === 'monthly' ? '$9.99' : '$99',
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'Great for casual creators',
      features: [
        '50 analyses per month',
        'Image & video support',
        'Priority processing',
        'Email support',
        'Download results',
        'Basic analytics',
        '48-hour response time'
      ],
      cta: 'Start Free Trial',
      popular: true,
      icon: <Zap className="w-6 h-6" />,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? '$29.99' : '$299',
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'For professional content creators',
      features: [
        '200 analyses per month',
        'All file formats',
        'Fastest processing',
        'Priority support',
        'API access',
        'Batch processing',
        'Custom prompts',
        'Advanced analytics',
        '24-hour response time'
      ],
      cta: 'Start Free Trial',
      popular: false,
      icon: <Shield className="w-6 h-6" />,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For teams and businesses',
      features: [
        'Unlimited analyses',
        'Dedicated infrastructure',
        'Custom integrations',
        '24/7 phone support',
        'SLA guarantee',
        'On-premise deployment',
        'Custom training',
        'Dedicated account manager',
        'White-label options'
      ],
      cta: 'Contact Sales',
      popular: false,
      icon: <Crown className="w-6 h-6" />,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleCTAClick = (plan: PricingPlan) => {
    if (plan.id === 'free') {
      navigate('/signup');
    } else if (plan.id === 'enterprise') {
      navigate('/coming-soon', { 
        state: { 
          planName: plan.name,
          fromPricing: true 
        } 
      });
    } else {
      navigate('/coming-soon', { 
        state: { 
          planName: plan.name,
          fromPricing: true 
        } 
      });
    }
  };

  const getCardStyles = (plan: PricingPlan) => {
    const isSelected = selectedPlan === plan.id;
    const baseStyles = 'border rounded-2xl shadow-sm transition-all duration-300 cursor-pointer transform hover:scale-105';
    
    if (plan.popular) {
      return `${baseStyles} ${
        isSelected
          ? 'border-blue-500 ring-4 ring-blue-200 shadow-xl scale-105'
          : 'border-blue-300 ring-2 ring-blue-100 shadow-lg hover:shadow-xl'
      }`;
    }
    
    return `${baseStyles} ${
      isSelected
        ? `border-${plan.color}-500 ring-4 ring-${plan.color}-200 shadow-xl scale-105`
        : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
    }`;
  };

  const getButtonStyles = (plan: PricingPlan) => {
    const isSelected = selectedPlan === plan.id;
    
    if (plan.popular) {
      return isSelected
        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
        : 'bg-blue-600 text-white hover:bg-blue-700';
    }
    
    return isSelected
      ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg`
      : `bg-${plan.color}-50 text-${plan.color}-700 hover:bg-${plan.color}-100 border border-${plan.color}-200`;
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Start with our free tier and upgrade as you grow. All plans include a 14-day money-back guarantee.
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'
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
              Save 17%
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className={getCardStyles(plan)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 rounded-t-2xl">
                  <span className="text-sm font-semibold flex items-center justify-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}
              
              {/* Card Content */}
              <div className="p-6">
                {/* Icon and Name */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.gradient} text-white`}>
                    {plan.icon}
                  </div>
                  {selectedPlan === plan.id && (
                    <div className="flex items-center text-green-600">
                      <Check className="w-5 h-5 mr-1" />
                      <span className="text-sm font-semibold">Selected</span>
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 mb-6 h-12">{plan.description}</p>
                
                {/* Pricing */}
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-base font-medium text-gray-500 ml-1">
                      /{plan.period}
                    </span>
                  )}
                  {billingCycle === 'yearly' && plan.price !== 'Custom' && plan.price !== '$0' && (
                    <p className="text-sm text-green-600 mt-1">
                      Save {plan.id === 'basic' ? '$20' : '$60'} per year
                    </p>
                  )}
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
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Feature Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Monthly Analyses', values: ['5', '50', '200', 'Unlimited'] },
                  { feature: 'Video Support', values: ['❌', '✅', '✅', '✅'] },
                  { feature: 'API Access', values: ['❌', '❌', '✅', '✅'] },
                  { feature: 'Batch Processing', values: ['❌', '❌', '✅', '✅'] },
                  { feature: 'Priority Support', values: ['❌', '✅', '✅', '✅'] },
                  { feature: 'SLA Guarantee', values: ['❌', '❌', '❌', '✅'] },
                  { feature: 'Custom Integration', values: ['❌', '❌', '❌', '✅'] },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                    {row.values.map((value, i) => (
                      <td key={i} className="px-6 py-4 text-center text-sm text-gray-700">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
                  question: 'What file formats do you support?',
                  answer: 'We support most common video formats (MP4, AVI, MOV, MKV, etc.) and image formats (JPG, PNG, BMP, TIFF, WebP). Pro and Enterprise plans include support for all formats.'
                },
                {
                  question: 'How accurate are the generated prompts?',
                  answer: 'Our AI models achieve high accuracy rates, typically 85-95% depending on the content complexity. Results improve with higher resolution inputs and our Pro/Enterprise models.'
                },
                {
                  question: 'Can I cancel my subscription anytime?',
                  answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period, and we offer a 14-day money-back guarantee.'
                },
                {
                  question: 'Do you offer API access?',
                  answer: 'API access is available for Pro and Enterprise plans. Check our documentation for integration details and rate limits.'
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for Enterprise plans, we can arrange invoice billing.'
                },
                {
                  question: 'Is there a free trial?',
                  answer: 'Yes! All paid plans include a 14-day free trial. No credit card required for the Free plan, and you can cancel anytime during the trial period.'
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

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/coming-soon', { state: { fromPricing: true, planName: 'Support' } })}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Contact Sales
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-3 bg-blue-500 text-white border-2 border-white rounded-lg font-semibold hover:bg-blue-400 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;