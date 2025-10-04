import React from 'react';
import { Check } from 'lucide-react';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out our service',
      features: [
        '5 analyses per month',
        'Basic image support',
        'Standard processing speed',
        'Email support'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Basic',
      price: '$9.99',
      period: 'month',
      description: 'Great for casual creators',
      features: [
        '50 analyses per month',
        'Image & video support',
        'Priority processing',
        'Email support',
        'Download results'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Pro',
      price: '$29.99',
      period: 'month',
      description: 'For professional content creators',
      features: [
        '200 analyses per month',
        'All file formats',
        'Fastest processing',
        'Priority support',
        'API access',
        'Batch processing',
        'Custom prompts'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
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
        'Custom training'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Start with our free tier and upgrade as you grow
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 ${
                plan.popular
                  ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-2 rounded-t-lg">
                  <span className="text-sm font-medium">Most Popular</span>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {plan.name}
                </h3>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-base font-medium text-gray-500">
                      /{plan.period}
                    </span>
                  )}
                </p>
                <button
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
              
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  What file formats do you support?
                </h4>
                <p className="mt-2 text-gray-600">
                  We support most common video formats (MP4, AVI, MOV, MKV, etc.) and image formats (JPG, PNG, BMP, TIFF, WebP).
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  How accurate are the generated prompts?
                </h4>
                <p className="mt-2 text-gray-600">
                  Our AI models achieve high accuracy rates, typically 85-95% depending on the content complexity. Results improve with higher resolution inputs.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Can I cancel my subscription anytime?
                </h4>
                <p className="mt-2 text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Do you offer API access?
                </h4>
                <p className="mt-2 text-gray-600">
                  API access is available for Pro and Enterprise plans. Check our documentation for integration details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;