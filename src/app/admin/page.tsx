'use client';

import { useRole } from '@/hooks/useRole';
import Link from 'next/link';

export default function AdminDashboard() {
  const { isAdmin, isEditor, isAuthor } = useRole();

  // Check if user has admin access
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

  const dashboardCards = [
    // Content Management - Available to all roles
    {
      title: 'Content Management',
      description: 'Manage blog content and articles',
      icon: '📝',
      color: 'blue',
      items: [
        {
          name: 'All Blog Content',
          href: '/admin/blog-contents',
          description: 'View and manage all blog content'
        },
        {
          name: 'Create New Blog Content',
          href: '/admin/blog-contents/create',
          description: 'Create new blog content'
        }
      ]
    },
    // Blog Management - Available to all roles
    {
      title: 'Blog Management',
      description: 'Manage complete blog posts',
      icon: '📰',
      color: 'indigo',
      items: [
        {
          name: 'All Blogs',
          href: '/admin/blogs',
          description: 'View and manage all blogs'
        },
        {
          name: 'Create New Blog',
          href: '/admin/blogs/create',
          description: 'Create new blog post'
        }
      ]
    },
    // User Management - Admin only
    ...(isAdmin ? [{
      title: 'User Management',
      description: 'Manage users and their roles',
      icon: '👥',
      color: 'red',
      items: [
        {
          name: 'All Users',
          href: '/admin/users',
          description: 'View and manage all users'
        },
        {
          name: 'Role Management',
          href: '/admin/roles',
          description: 'Manage user roles and permissions'
        }
      ]
    }] : []),
    // Content Organization - Available to all roles
    {
      title: 'Content Organization',
      description: 'Organize content with categories',
      icon: '🏷️',
      color: 'orange',
      items: [
        {
          name: 'Categories',
          href: '/admin/categories',
          description: 'Manage blog categories'
        }
      ]
    },
    // Media Management - Available to all roles
    {
      title: 'Media Management',
      description: 'Upload and manage media files',
      icon: '📁',
      color: 'purple',
      items: [
        {
          name: 'Media Library',
          href: '/admin/media',
          description: 'Upload and manage media files'
        }
      ]
    },
    // Course Management - Available to all roles
    {
      title: 'Course Management',
      description: 'Create and manage courses and chapters',
      icon: '📚',
      color: 'indigo',
      items: [
        {
          name: 'All Courses',
          href: '/admin/courses',
          description: 'View and manage all courses'
        },
        {
          name: 'Create New Course',
          href: '/admin/courses/create',
          description: 'Create a new course'
        },
        {
          name: 'Chapter Topics',
          href: '/admin/chapter-topics',
          description: 'Manage chapter topics across all courses'
        }
      ]
    },
    // Analytics - Admin and Editor
    ...(isAdmin || isEditor ? [{
      title: 'Analytics & Reports',
      description: 'View system analytics and reports',
      icon: '📊',
      color: 'green',
      items: [
        {
          name: 'Content Analytics',
          href: '/admin/analytics',
          description: 'View content performance metrics'
        },
        {
          name: 'User Activity',
          href: '/admin/activity',
          description: 'Monitor user activity and engagement'
        }
      ]
    }] : []),
    // System Management - Admin only
    ...(isAdmin ? [{
      title: 'System Management',
      description: 'Configure system settings',
      icon: '⚙️',
      color: 'purple',
      items: [
        {
          name: 'System Settings',
          href: '/admin/settings',
          description: 'Configure system settings'
        },
        {
          name: 'Backup & Restore',
          href: '/admin/backup',
          description: 'Manage system backups'
        }
      ]
    }] : [])
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getHoverColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'hover:bg-blue-100';
      case 'red':
        return 'hover:bg-red-100';
      case 'green':
        return 'hover:bg-green-100';
      case 'purple':
        return 'hover:bg-purple-100';
      default:
        return 'hover:bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-gray-600">
                  Welcome back, {isAdmin ? 'Administrator' : isEditor ? 'Editor' : 'Author'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-lg">
                {isAdmin ? 'Administrator' : isEditor ? 'Editor' : 'Author'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">156</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blog Content</p>
                <p className="text-3xl font-bold text-gray-900">89</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-3xl font-bold text-gray-900">234</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {dashboardCards.map((card, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${getColorClasses(card.color)}`}>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {card.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className="group block p-4 rounded-xl bg-white/50 hover:bg-white/80 border border-white/30 hover:border-white/50 transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/blog-contents/create"
                className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="font-medium">New Content</span>
              </Link>
              
              <Link
                href="/admin/blog-contents"
                className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium">View Content</span>
              </Link>
              
              {isAdmin && (
                <Link
                  href="/admin/users"
                  className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Manage Users</span>
                </Link>
              )}
              
              <Link
                href="/admin/blogs"
                className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium">Blogs</span>
              </Link>
              
              <Link
                href="/admin/categories"
                className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="font-medium">Categories</span>
              </Link>
              
              {isAdmin && (
                <Link
                  href="/admin/analytics"
                  className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="font-medium">Analytics</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}