export default function ComingSoonSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Coming Soon
          </div>
          
          {/* Main Title */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Speech-to-Speech AI Chat
          </h2>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
            Experience the future of learning with our revolutionary speech-to-speech AI chat feature. 
            Have natural conversations with our AI assistant using just your voice.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-bold text-white mb-3">Voice Input</h3>
              <p className="text-white/80 text-sm">
                Speak naturally to ask questions about any blog content or course material
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-3">AI Processing</h3>
              <p className="text-white/80 text-sm">
                Advanced AI processes your speech and generates intelligent responses
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🔊</div>
              <h3 className="text-xl font-bold text-white mb-3">Voice Output</h3>
              <p className="text-white/80 text-sm">
                Listen to AI responses in natural, human-like speech
              </p>
            </div>
          </div>
          
          {/* Benefits */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Why Speech-to-Speech?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-white/90">Hands-free learning while multitasking</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-white/90">Natural conversation flow</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-white/90">Accessibility for all learners</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-white/90">Faster information processing</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-white/90">Multilingual support</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-white/90">Enhanced engagement</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-12">
            <div className="flex items-center justify-center space-x-4 text-white/80 text-sm">
              <span>Development Progress</span>
              <div className="w-32 bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2 w-1/3 animate-pulse"></div>
              </div>
              <span>30%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
