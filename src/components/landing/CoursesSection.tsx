export default function CoursesSection() {
  const courses = [
    {
      title: "Web Development Fundamentals",
      chapters: 8,
      blogs: 24,
      description: "Master the basics of HTML, CSS, and JavaScript with hands-on projects",
      progress: 0,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "AI & Machine Learning",
      chapters: 12,
      blogs: 36,
      description: "Explore artificial intelligence concepts and practical implementations",
      progress: 0,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Data Science Essentials",
      chapters: 10,
      blogs: 30,
      description: "Learn data analysis, visualization, and statistical modeling",
      progress: 0,
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Structured Learning Paths
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our courses are organized into chapters with multiple blog posts, creating a comprehensive learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className={`h-2 bg-gradient-to-r ${course.color}`}></div>
              
              <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {course.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                    <span>📚</span>
                    <span>{course.chapters} chapters</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {course.description}
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                    <span>📝 {course.blogs} blog posts</span>
                    <span>⏱️ ~{Math.ceil(course.blogs * 0.5)} hours</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 group-hover:bg-gray-300 transition-colors duration-300">
                    <div 
                      className={`h-2 bg-gradient-to-r ${course.color} rounded-full transition-all duration-500 group-hover:shadow-lg`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                      {course.progress === 0 ? 'Not started' : `${course.progress}% complete`}
                    </span>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 text-sm font-medium transform hover:scale-105 hover:shadow-lg border border-gray-200 hover:border-blue-600 cursor-pointer">
                      {course.progress === 0 ? 'Start Course' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Subtle hover overlay that doesn't interfere with content */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
            </div>
          ))}
        </div>

        {/* Course Structure Explanation */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How Our Course Structure Works
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Course</h4>
                <p className="text-sm text-gray-600">
                  Each course covers a specific topic with multiple chapters
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📖</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Chapters</h4>
                <p className="text-sm text-gray-600">
                  Chapters break down the course into manageable sections
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Blog Posts</h4>
                <p className="text-sm text-gray-600">
                  Each chapter contains multiple detailed blog posts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
