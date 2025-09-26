'use client';

export default function FeaturesSection() {
  const features = [
    {
      title: "Free Content Access",
      description: "Access all blog content and courses completely free. Learn at your own pace without any subscription fees.",
      icon: "📚",
      color: "from-blue-500 to-blue-600",
      size: "col-span-1 md:col-span-2 lg:col-span-2",
      animated: true,
      priority: "high"
    },
    {
      title: "AI Chat Assistant",
      description: "Get instant answers to your questions about any blog content with our intelligent AI chatbot.",
      icon: "🤖",
      color: "from-purple-500 to-purple-600",
      size: "col-span-1 md:col-span-1 lg:col-span-1",
      animated: true,
      priority: "high"
    },
    {
      title: "Personalized Learning",
      description: "AI-powered content recommendations and personalized learning paths based on your progress.",
      icon: "🎯",
      color: "from-green-500 to-green-600",
      size: "col-span-1 md:col-span-1 lg:col-span-1",
      animated: true,
      priority: "medium"
    },
    {
      title: "Interactive Quizzes",
      description: "Test your knowledge with AI-generated quizzes and track your learning progress with detailed analytics.",
      icon: "🧠",
      color: "from-orange-500 to-orange-600",
      size: "col-span-1 md:col-span-2 lg:col-span-2",
      animated: true,
      priority: "medium"
    },
    {
      title: "Progress Tracking & Badges",
      description: "Earn achievement badges, track learning streaks, and monitor your progress with detailed analytics. Unlock special badges for completing courses, maintaining streaks, and mastering difficult concepts.",
      icon: "🏆",
      color: "from-indigo-500 to-indigo-600",
      size: "col-span-1 md:col-span-2 lg:col-span-2",
      animated: true,
      priority: "medium"
    },
    {
      title: "Course Structure",
      description: "Well-organized courses with multiple chapters and comprehensive blog content for structured learning.",
      icon: "📖",
      color: "from-pink-500 to-pink-600",
      size: "col-span-1 md:col-span-1 lg:col-span-1",
      animated: true,
      priority: "low"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose KnowvloAI?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of learning with AI-powered features designed to enhance your educational journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.size} group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-100`}
              style={{
                position: 'relative',
              }}
            >
              {/* Subtle animated border light effect */}
              {feature.animated && (
                <>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                    <div 
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: `linear-gradient(45deg, transparent, ${feature.color.includes('blue') ? '#dbeafe' : feature.color.includes('purple') ? '#f3e8ff' : feature.color.includes('green') ? '#dcfce7' : feature.color.includes('orange') ? '#fed7aa' : feature.color.includes('indigo') ? '#e0e7ff' : '#fce7f3'}, transparent)`,
                        backgroundSize: '200% 200%',
                        animation: 'gradientShift 8s ease-in-out infinite',
                      }}
                    />
                  </div>
                  
                  {/* Subtle moving light border */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500">
                    <div 
                      className="absolute inset-0 rounded-2xl border border-opacity-40"
                      style={{
                        borderColor: `${feature.color.includes('blue') ? '#93c5fd' : feature.color.includes('purple') ? '#c4b5fd' : feature.color.includes('green') ? '#86efac' : feature.color.includes('orange') ? '#fdba74' : feature.color.includes('indigo') ? '#a5b4fc' : '#f9a8d4'}`,
                        animation: 'borderGlow 6s linear infinite',
                      }}
                    />
                  </div>
                </>
              )}
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-6 text-2xl group-hover:scale-105 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
              
              {/* Very subtle background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-3 transition-opacity duration-300 rounded-2xl`}></div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
