'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';

interface PlanFeature {
  id?: string;
  feature: string;
  description: string;
  featureSlug: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price_per_month: number;
  status: 'ACTIVE' | 'INACTIVE';
  features: PlanFeature[];
}

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isAdmin, isEditor, isAuthor } = useRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  
  // Unwrap the params Promise
  const { id } = use(params);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_month: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const [features, setFeatures] = useState<PlanFeature[]>([]);
  const [newFeature, setNewFeature] = useState({
    feature: '',
    description: '',
    featureSlug: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/plans/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plan');
      }
      const data = await response.json();
      setPlan(data.plan);
      setFormData({
        name: data.plan.name,
        description: data.plan.description,
        price_per_month: data.plan.price_per_month,
        status: data.plan.status
      });
      setFeatures(data.plan.features);
    } catch (error) {
      console.error('Error fetching plan:', error);
      setError('Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.feature.trim() || !newFeature.description.trim()) {
      alert('Please fill in feature name and description');
      return;
    }

    const featureSlug = newFeature.featureSlug.trim() || generateSlug(newFeature.feature);
    
    // Check for duplicate feature names
    if (features.some(f => f.feature.toLowerCase() === newFeature.feature.toLowerCase())) {
      alert('A feature with this name already exists');
      return;
    }

    // Check for duplicate slugs
    if (features.some(f => f.featureSlug === featureSlug)) {
      alert('A feature with this slug already exists');
      return;
    }

    setFeatures([...features, { ...newFeature, featureSlug }]);
    setNewFeature({
      feature: '',
      description: '',
      featureSlug: '',
      status: 'ACTIVE'
    });
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          features
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      router.push('/admin/plans');
    } catch (error) {
      console.error('Error updating plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [id]);

  // Check if user has permission after all hooks are called
  if (!isAdmin && !isEditor && !isAuthor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
          <p className="text-gray-600 mb-6">The plan you're looking for doesn't exist.</p>
          <Link
            href="/admin/plans"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                      <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      <span className="sr-only">Home</span>
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                      <Link href="/admin/plans" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                        Plans
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                      <span className="ml-4 text-sm font-medium text-gray-500">Edit Plan</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Edit Plan</h1>
              <p className="mt-2 text-gray-600">Update plan details and features</p>
            </div>
            <Link
              href="/admin/plans"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Plan Details</h2>
            <p className="text-gray-600 mt-1">Basic information about the subscription plan</p>
          </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Plan Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter plan name"
              required
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter plan description"
              rows={4}
              required
              disabled={saving}
            />
          </div>

          {/* Price and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price per Month */}
            <div>
              <label htmlFor="price_per_month" className="block text-sm font-medium text-gray-700 mb-2">
                Price per Month (₹) *
              </label>
              <input
                type="number"
                id="price_per_month"
                min="0"
                step="0.01"
                value={formData.price_per_month}
                onChange={(e) => setFormData({ ...formData, price_per_month: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
                disabled={saving}
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={saving}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Status Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Active:</strong> Plan is available for subscription</p>
              <p><strong>Inactive:</strong> Plan is not available for new subscriptions</p>
            </div>
          </div>

          {/* Features Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Features</h3>
            <p className="text-sm text-gray-600 mb-6">Manage features that are included in this plan</p>
            
            {/* Add Feature Form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Add New Feature</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Name *
                  </label>
                  <input
                    type="text"
                    value={newFeature.feature}
                    onChange={(e) => {
                      const feature = e.target.value;
                      setNewFeature({ 
                        ...newFeature, 
                        feature,
                        featureSlug: generateSlug(feature)
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Unlimited Access, Priority Support"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Slug *
                  </label>
                  <input
                    type="text"
                    value={newFeature.featureSlug}
                    onChange={(e) => setNewFeature({ ...newFeature, featureSlug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., unlimited-access, priority-support"
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this feature provides..."
                  disabled={saving}
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newFeature.status}
                    onChange={(e) => setNewFeature({ ...newFeature, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' })}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={saving}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Feature
                </button>
              </div>
            </div>

            {/* Features List */}
            {features.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2">No features added yet</p>
                <p className="text-sm">Add features using the form above</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900">Current Features ({features.length})</h4>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h5 className="text-sm font-medium text-gray-900">{feature.feature}</h5>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          feature.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : feature.status === 'INACTIVE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {feature.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Slug: {feature.featureSlug}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-900 text-sm font-medium ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || !formData.description.trim() || saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Update Plan
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
