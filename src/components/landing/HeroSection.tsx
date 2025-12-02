import Image from "next/image";

const squareBlocks = [
  { top: '-12%', left: '-10%', size: '320px', color: 'bg-blue-300/30', opacity: 0.45 },
  { top: '-14%', left: '18%', size: '280px', color: 'bg-blue-200/40', opacity: 0.4 },
  { top: '-10%', left: '48%', size: '300px', color: 'bg-cyan-200/35', opacity: 0.38 },
  { top: '-8%', left: '78%', size: '260px', color: 'bg-teal-200/35', opacity: 0.42 },
  { top: '12%', left: '-12%', size: '300px', color: 'bg-blue-200/35', opacity: 0.35 },
  { top: '18%', left: '12%', size: '280px', color: 'bg-blue-100/60', opacity: 0.3 },
  { top: '22%', left: '40%', size: '340px', color: 'bg-slate-100/80', opacity: 0.18 },
  { top: '18%', left: '70%', size: '280px', color: 'bg-cyan-100/60', opacity: 0.24 },
  { top: '44%', left: '-8%', size: '300px', color: 'bg-blue-200/35', opacity: 0.32 },
  { top: '48%', left: '18%', size: '300px', color: 'bg-blue-100/60', opacity: 0.25 },
  { top: '52%', left: '46%', size: '300px', color: 'bg-cyan-100/60', opacity: 0.2 },
  { top: '48%', left: '76%', size: '260px', color: 'bg-teal-100/60', opacity: 0.28 }
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Radial Overlay */}
        <div className="absolute inset-0 bg-blue-50/40"></div>
        
        {/* Border Grid Squares */}
        {squareBlocks.map((block, index) => (
          <div
            key={index}
            className={`absolute rounded-[48px] ${block.color} shadow-[0_25px_80px_rgba(15,23,42,0.08)]`}
            style={{
              top: block.top,
              left: block.left,
              width: block.size,
              height: block.size,
              opacity: block.opacity
            }}
          ></div>
        ))}
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: '0 0, 40px 40px'
        }}></div>
        
        {/* Center Grid */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          backgroundPosition: '0 0, 50px 50px'
        }}></div>
        
        {/* Floating Dots - More intense at edges */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-500/30 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-500/30 rounded-full animate-bounce" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-teal-500/30 rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute bottom-1/4 right-1/5 w-2.5 h-2.5 bg-blue-500/30 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        
        {/* Subtle Lines */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-blue-200/15"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-cyan-200/10"></div>
        
        {/* Center Fade */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(248, 250, 252, 0.85) 0%, rgba(248, 250, 252, 0.45) 40%, rgba(248, 250, 252, 0.08) 70%, rgba(15, 23, 42, 0.05) 100%)'
          }}
        ></div>
      </div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Logo/Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-blue-700">
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
            <span className="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
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
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer">
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
