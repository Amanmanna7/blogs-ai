import FooterSection from '@/components/landing/FooterSection';
import Link from 'next/link';

const stats = [
  { label: 'Learners worldwide', value: '10K+' },
  { label: 'AI-powered lessons', value: '50+' },
  { label: 'Expert Content Creators', value: '10+' },
];

const statPalettes = [
  { bg: 'bg-blue-50', border: 'border-blue-100', ring: 'ring-blue-100/70', shadow: 'shadow-blue-100/70', value: 'text-blue-900', label: 'text-blue-600' },
  { bg: 'bg-cyan-50', border: 'border-cyan-100', ring: 'ring-cyan-100/70', shadow: 'shadow-cyan-100/70', value: 'text-cyan-900', label: 'text-cyan-600' },
  { bg: 'bg-orange-50', border: 'border-orange-100', ring: 'ring-orange-100/70', shadow: 'shadow-orange-100/70', value: 'text-orange-900', label: 'text-orange-600' },
];

const pillars = [
  {
    title: 'Human-centered AI',
    description:
      'Every feature is designed to extend the capabilities of learners and educators—not replace them.',
  },
  {
    title: 'Evidence-based learning',
    description:
      'We combine cognitive science with real-time engagement data to adapt the journey for each learner.',
  },
  {
    title: 'Responsible innovation',
    description:
      'Privacy-first data practices, explainable models, and transparent outcomes guide our roadmap.',
  },
];

const values = [
  {
    title: 'Clarity over complexity',
    description: 'We translate advanced AI concepts into approachable learning moments.',
  },
  {
    title: 'Progress you can feel',
    description: 'Every interaction should leave learners feeling more confident than before.',
  },
  {
    title: 'Community as a multiplier',
    description: 'Collaboration and shared wins accelerate mastery for everyone involved.',
  },
];

const team = [
  {
    name: 'Priya Shah',
    role: 'CEO & Cofounder',
    focus: 'Education strategy, partnerships, learner outcomes',
  },
  {
    name: 'Leo Martinez',
    role: 'Chief Scientist',
    focus: 'Responsible AI, personalization engine, research ops',
  },
  {
    name: 'Mara Chen',
    role: 'CTO',
    focus: 'Platform architecture, security, delivery velocity',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl absolute -top-32 -left-32"></div>
          <div className="w-[420px] h-[420px] bg-slate-700/30 rounded-full blur-3xl absolute bottom-0 right-0"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 flex flex-col gap-8">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-sm font-medium tracking-wide">
            About KnowvloAI
          </span>
          <div className="grid gap-10 lg:grid-cols-[1.5fr,1fr] items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
                Building the co-pilot for every learning adventure
              </h1>
              <p className="text-lg text-white/75">
                We are on a mission to close the gap between curiosity and mastery. By blending
                generative AI with thoughtful pedagogy, we deliver experiences that feel tailored,
                trustworthy, and inspiring.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/courses"
                  className="rounded-2xl bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
                >
                  Explore the courses
                </Link>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 space-y-6 shadow-2xl">
              <p className="text-2xl font-semibold leading-relaxed text-white">
                “KnowvloAI helped learners retain more knowledge through adaptive feedback
                loops and conversational coaching.”
              </p>
              <div className="space-y-1">
                <p className="font-medium text-white">Aman, CEO</p>
                <p className="text-sm text-white/70">KnowvloAI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => {
          const palette = statPalettes[index % statPalettes.length];
          return (
          <div
            key={stat.label}
            className={`rounded-[32px] p-8 text-center border shadow-[0_15px_35px_rgba(15,23,42,0.08)] ring-1 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] transition-all duration-300 ${palette.bg} ${palette.border} ${palette.ring} ${palette.shadow}`}
          >
            <p className={`text-4xl font-semibold ${palette.value}`}>{stat.value}</p>
            <p className={`text-sm mt-1 tracking-wide uppercase ${palette.label}`}>{stat.label}</p>
          </div>
        );
        })}
      </div>

      <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Why we exist</p>
            <h2 className="text-3xl font-semibold text-slate-900">Learning that bends to you</h2>
            <p className="text-lg text-slate-600">
              Traditional content is static—and learners are not. KnowvloAI orchestrates lessons,
              quizzes, and coaching moments that respond to the intent, pace, and mindset of each
              learner. The result is momentum you can see, confidence you can feel, and outcomes you
              can prove.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-2xl border border-gray-100 space-y-4">
            <p className="text-base font-medium text-slate-900">Our promise</p>
            <p className="text-slate-600">
              Every learner deserves feedback that feels personal, actionable, and encouraging. Our
              AI scaffolds that experience while keeping humans—mentors, instructors, peers—at the
              center.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-50">
              <h3 className="text-xl font-semibold text-slate-900">{pillar.title}</h3>
              <p className="mt-3 text-slate-600">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-50 via-white to-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="space-y-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Values</p>
            <h2 className="text-3xl font-semibold text-slate-900">How we show up every day</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Culture is product. These principles pressure-test our roadmap, hiring decisions, and
              community commitments.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-3xl bg-white p-6 shadow-md border border-gray-100">
                <h3 className="text-xl font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-3 text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
          <div className="rounded-3xl bg-gray-900 text-white p-8 space-y-6 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-teal-300">Leadership</p>
            <h2 className="text-3xl font-semibold">People behind the platform</h2>
            <p className="text-white/80">
              Our leadership team blends deep pedagogy, human-centered design, and trustworthy AI
              research. Together, we keep the spotlight on learner outcomes.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
                <p className="text-sm font-semibold text-slate-600">{member.role}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{member.name}</h3>
                <p className="mt-3 text-sm text-slate-600">{member.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Ready to learn</p>
        <h2 className="text-3xl font-semibold text-slate-900">Bring your ambitions. We’ll bring the AI.</h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Whether you’re launching a new program, leveling up a workforce, or pursuing a personal
          goal, we can help you design a learning loop that sticks.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/sign-up"
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
          >
            Start learning
          </a>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}

