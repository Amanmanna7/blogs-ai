export default function AIFeaturesSection() {
  const aiFeatures = [
    {
      title: "AI Chat Assistant",
      description: "Ask questions about any blog content and get instant, intelligent responses from our AI assistant.",
      icon: "💬",
      features: [
        "Context-aware responses",
        "Multi-language support",
        "24/7 availability",
        "Learning progress tracking"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Personalized AI Quizzes",
      description: "Take AI-generated quizzes tailored to your learning level and track your progress with detailed analytics.",
      icon: "🧠",
      features: [
        "Adaptive difficulty",
        "Instant feedback",
        "Performance analytics",
        "Weakness identification"
      ],
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Progress Tracking & Badges",
      description: "Earn badges and track your learning journey with comprehensive progress reports and achievements.",
      icon: "🏆",
      features: [
        "Achievement badges",
        "Learning streaks",
        "Skill assessments",
        "Progress visualization"
      ],
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Learning Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Harness the power of artificial intelligence to personalize your learning journey and maximize your potential
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
            >
              <div className={`h-1 bg-gradient-to-r ${feature.color}`}></div>
              
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl mr-4`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                    Key Features
                  </h4>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
            </div>
          ))}
        </div>

        {/* Enhanced AI Chat Demo */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 border border-blue-100 relative overflow-hidden">
            {/* Highlighted chat interface */}
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-full shadow-lg border border-blue-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-600 font-semibold">AI Assistant Online</span>
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Try Our AI Assistant
              </h3>
              
              {/* Chat interface */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
                <div className="space-y-4">
                  {/* AI Message */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      AI
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
                        <p className="text-gray-700 leading-relaxed">
                          "Hi there! I'm your AI tutor for <strong>Machine Learning Fundamentals</strong>. I'm here to break down complex topics, clarify your doubts, and help you master this subject step by step. Ready to dive in?"
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Just now
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Availability message */}
              <p className="mt-8 text-center text-base text-gray-600 leading-relaxed">
                <span className="font-semibold text-blue-600">Your AI guide</span> travels with you inside every lesson, ready to explain tough concepts, summarize sections, and answer follow-up questions right where you’re learning.
              </p>
            </div>
            
            {/* Subtle background decoration */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-blue-100 rounded-full opacity-20"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-100 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
