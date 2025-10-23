'use client';

import { useState, useEffect } from 'react';
import { RazorpayOptions, RazorpayResponse, CreateOrderResponse } from '@/types/razorpay';

interface PlanFeature {
  id: string;
  feature: string;
  description: string;
  featureSlug: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price_per_month: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  features: PlanFeature[];
}

interface ActivePlan {
  id: string;
  planName: string;
  planDescription: string;
  startDate: string;
  endDate: string;
  paidAmount: number;
  features: PlanFeature[];
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available plans
        const plansResponse = await fetch('/api/plans');
        if (!plansResponse.ok) {
          throw new Error('Failed to fetch plans');
        }
        const plansData = await plansResponse.json();
        
        // Sort plans by price (low to high)
        const sortedPlans = plansData.plans
          .filter((plan: Plan) => plan.status === 'ACTIVE')
          .sort((a: Plan, b: Plan) => a.price_per_month - b.price_per_month);
        
        setPlans(sortedPlans);

        // Fetch active subscription
        const activeResponse = await fetch('/api/user-plans/active');
        if (activeResponse.ok) {
          const activeData = await activeResponse.json();
          if (activeData.hasActivePlan) {
            setActivePlan(activeData.activePlan);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    try {
      setProcessingPayment(planId);
      
      // Create Razorpay order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const orderData: CreateOrderResponse = await response.json();

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: orderData.key,
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency,
        name: 'Blog AI Learning Platform',
        description: 'Subscription Plan Payment',
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Send payment details to callback API
            const callbackResponse = await fetch('/api/razorpay/callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userPlanId: orderData.userPlanId,
              }),
            });

            const result = await callbackResponse.json();
            if (result.success && result.status === 'COMPLETED') {
              alert('Payment successful! Your subscription is now active.');
              // Optionally refresh the page or update UI
              window.location.reload();
            } else {
              alert('Payment failed. Please try again.');
            }
          } catch (error) {
            console.error('Error processing payment:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'User', // You can get this from user profile
          email: 'user@example.com', // You can get this from user profile
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(null);
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Failed to initiate payment. Please try again.');
      setProcessingPayment(null);
    }
  };

  const isPopular = (planName: string) => {
    return planName.toLowerCase().includes('popular');
  };

  const cleanPlanName = (planName: string) => {
    return planName
      .replace(/\s*\([Mm]ost\s+[Pp]opular\)/g, '')
      .replace(/\s*\([Pp]opular\)/g, '')
      .replace(/\s*[Mm]ost\s+[Pp]opular/gi, '')
      .replace(/\s*[Pp]opular/gi, '')
      .trim();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium">Error loading plans</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-lg font-medium">No subscription plans available</p>
          <p className="text-gray-500">Please check back later for available plans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {activePlan ? 'Your Subscription' : 'Choose Your Plan'}
        </h2>
        <p className="text-gray-600 text-lg">
          {activePlan 
            ? '' 
            : 'Select the perfect plan for your learning journey'
          }
        </p>
      </div>

      {/* Active Subscription Display */}
      {activePlan && (
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-violet-200/60">
            {/* Glass effect overlay with violet tint */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 via-white/20 to-purple-50/20"></div>
            {/* Violet border glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-400/10 via-transparent to-purple-400/10"></div>
            
            {/* Content */}
            <div className="relative p-8 md:p-12">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600  mb-1">{cleanPlanName(activePlan.planName)}</h3>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full border border-green-200 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Active</span>
                  </span>
                </div>
              </div>
              
              {/* Features Section */}
              <div className="mb-8">
                <h4 className="text-gray-700 font-semibold text-sm uppercase tracking-wider mb-6">Your Plan Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePlan.features.map((feature) => (
                    <div key={feature.id} className="flex items-start space-x-3 group">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-gray-900 font-medium text-sm">{feature.feature}</span>
                        {feature.description && (
                          <p className="text-gray-600 text-xs mt-1 leading-relaxed">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-violet-200/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="text-gray-600 text-sm mb-2 sm:mb-0">
                    <span className="font-medium">Started:</span>
                    <span className="text-gray-900 font-semibold ml-1">{new Date(activePlan.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gray-600 text-sm">
                    <span className="font-medium">Amount Paid:</span>
                    <span className="text-gray-900 font-semibold ml-1">₹{activePlan.paidAmount}</span>
                  </div>
                </div>
                
                {/* Active until section at bottom - styled as a card within card */}
                <div className="bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-2xl p-4 border border-violet-200/30">
                  <div className="text-center">
                    <p className="text-violet-700 text-sm font-medium mb-2">Active until</p>
                    <p className="text-violet-900 text-lg font-bold">
                      {new Date(activePlan.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!activePlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col ${
              isPopular(plan.name)
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {/* Popular Badge */}
            {isPopular(plan.name) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex flex-col flex-grow">
              {/* Header Section - Name & Pricing */}
              <div className={`p-6 text-center ${
                isPopular(plan.name) 
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50' 
                  : 'bg-gray-50'
              }`}>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{cleanPlanName(plan.name)}</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900">₹{plan.price_per_month}</span>
                  <span className="text-gray-600 ml-1 text-lg">/month</span>
                </div>
                <p className="text-sm text-gray-500">Billed monthly</p>
              </div>

              {/* Features Section - Different Background */}
              <div className="flex-grow p-6 bg-white">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">What's Included</h4>
                <ul className="space-y-3">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature.id} className="flex items-start space-x-3">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <span className="text-gray-900 font-medium text-sm">{feature.feature}</span>
                        {feature.description && (
                          <p className="text-gray-600 text-xs mt-1">{feature.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-gray-500 text-sm ml-7">
                      +{plan.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Select Button - Always at bottom */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={processingPayment === plan.id}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                    processingPayment === plan.id
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : isPopular(plan.name)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {processingPayment === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    isPopular(plan.name) ? 'Get Started' : 'Choose Plan'
                  )}
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Additional Info - Only show when no active plan */}
      {!activePlan && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            All plans include 24/7 support and can be cancelled anytime.
          </p>
        </div>
      )}
    </div>
  );
}
