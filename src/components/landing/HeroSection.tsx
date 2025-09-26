import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Radial Gradient Overlay - Intense at edges, normal in center */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-100/40 via-purple-50/20 to-transparent"></div>
        
        {/* Edge Color Intensifiers */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-200/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-200/30 to-transparent"></div>
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-blue-200/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-purple-200/30 to-transparent"></div>
        
        {/* Corner Intensifiers */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-radial from-blue-300/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-purple-300/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-indigo-300/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-blue-300/20 to-transparent"></div>
        
        {/* Floating Geometric Shapes - More intense at edges */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-300/30 to-indigo-300/30 rounded-full blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-indigo-300/30 to-blue-300/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Subtle Grid Pattern - Lighter in center */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: '0 0, 40px 40px'
        }}></div>
        
        {/* Center Grid - Even lighter */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: '0 0, 50px 50px'
        }}></div>
        
        {/* Floating Dots - More intense at edges */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-500/30 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-500/30 rounded-full animate-bounce" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-indigo-500/30 rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-1/4 right-1/5 w-2.5 h-2.5 bg-blue-500/30 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        
        {/* Subtle Lines - Much lighter */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-blue-200/15 via-blue-100/8 to-blue-200/15"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-purple-200/10 via-purple-100/5 to-purple-200/10"></div>
      </div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Logo/Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Blogs with AI Learning
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your learning journey with KnowvloAI - where intelligent blogs meet personalized AI education
          </p>

          {/* Key Features Preview */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              🚀 Free Content Access
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              🤖 AI Chat Assistant
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              📚 Course Structure
            </span>
            <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              🎯 Personalized Quizzes
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer">
              Start Learning Free
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300 cursor-pointer">
              Explore Courses
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
