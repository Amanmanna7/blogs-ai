'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRole } from '@/hooks/useRole';

export default function DashboardDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, hasPermission, isAdmin, isEditor, isAuthor } = useRole();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Don't show dashboard for regular users
  if (!isAdmin && !isEditor && !isAuthor) {
    return null;
  }

  const dashboardItems = [
    // Content Management - Available to Admin, Editor, Author
    {
      title: 'Content Management',
      items: [
        {
          name: 'All Blog Content',
          href: '/admin/blog-contents',
          icon: '📝',
          description: 'Manage all blog content',
          roles: ['ADMIN', 'EDITOR', 'AUTHOR']
        },
        {
          name: 'Create New Blog Content',
          href: '/admin/blog-contents/create',
          icon: '➕',
          description: 'Create new blog content',
          roles: ['ADMIN', 'EDITOR', 'AUTHOR']
        }
      ]
    },
    // User Management - Admin only
    ...(isAdmin ? [{
      title: 'User Management',
      items: [
        {
          name: 'All Users',
          href: '/admin/users',
          icon: '👥',
          description: 'Manage all users and roles',
          roles: ['ADMIN']
        },
        {
          name: 'Role Management',
          href: '/admin/roles',
          icon: '🔐',
          description: 'Manage user roles and permissions',
          roles: ['ADMIN']
        }
      ]
    }] : []),
    // Analytics & Reports - Admin and Editor
    ...(isAdmin || isEditor ? [{
      title: 'Analytics & Reports',
      items: [
        {
          name: 'Content Analytics',
          href: '/admin/analytics',
          icon: '📊',
          description: 'View content performance metrics',
          roles: ['ADMIN', 'EDITOR']
        },
        {
          name: 'User Activity',
          href: '/admin/activity',
          icon: '📈',
          description: 'Monitor user activity and engagement',
          roles: ['ADMIN', 'EDITOR']
        }
      ]
    }] : []),
    // Media Management - Available to all roles
    {
      title: 'Media Management',
      items: [
        {
          name: 'Media Library',
          href: '/admin/media',
          icon: '📁',
          description: 'Upload and manage media files',
          roles: ['ADMIN', 'EDITOR', 'AUTHOR']
        }
      ]
    },
    // Course Management - Available to all roles
    {
      title: 'Course Management',
      items: [
        {
          name: 'All Courses',
          href: '/admin/courses',
          icon: '📚',
          description: 'View and manage all courses',
          roles: ['ADMIN', 'EDITOR', 'AUTHOR']
        },
        {
          name: 'Create Course',
          href: '/admin/courses/create',
          icon: '➕',
          description: 'Create a new course',
          roles: ['ADMIN', 'EDITOR', 'AUTHOR']
        },
        {
          name: 'Chapter Topics',
          href: '/admin/chapter-topics',
          icon: '📖',
          description: 'Manage chapter topics across all courses',
          roles: ['ADMIN', 'EDITOR', 'AUTHOR']
        }
      ]
    },
    // System Management - Admin only
    ...(isAdmin ? [{
      title: 'System Management',
      items: [
        {
          name: 'System Settings',
          href: '/admin/settings',
          icon: '⚙️',
          description: 'Configure system settings',
          roles: ['ADMIN']
        },
        {
          name: 'Backup & Restore',
          href: '/admin/backup',
          icon: '💾',
          description: 'Manage system backups',
          roles: ['ADMIN']
        }
      ]
    }] : [])
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-700 font-medium transition-all duration-300 hover:bg-white/60 rounded-lg group"
      >
        <span className="relative z-10 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>Dashboard</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/80 to-purple-100/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"></div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-blue-100/50 z-50 overflow-hidden">
          <div className="p-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-600">
                  {isAdmin ? 'Administrator' : isEditor ? 'Editor' : 'Author'}
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {dashboardItems.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border-b border-gray-100 last:border-b-0">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <h3 className="text-sm font-semibold text-gray-700">{section.title}</h3>
                </div>
                <div className="py-2">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.description}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-t border-blue-100/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Quick Actions</span>
              <div className="flex space-x-2">
                <Link
                  href="/admin/blog-contents/create"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  New Blog
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-purple-600 hover:text-purple-800 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
