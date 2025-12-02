import Link from "next/link";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm0 2h10c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3zm9.5 2a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M20.4 6.4c.6-.4 1.1-1 1.4-1.6-.6.3-1.2.6-1.9.7a3.4 3.4 0 00-5.8 3.1A9.7 9.7 0 013 5.4a3.4 3.4 0 001 4.6c-.5 0-1-.1-1.4-.4v.1a3.4 3.4 0 002.7 3.3 3.4 3.4 0 01-1.5.1 3.4 3.4 0 003.2 2.4A6.9 6.9 0 012 17.5 9.7 9.7 0 007.3 19c6.3 0 9.7-5.2 9.7-9.7v-.4c.7-.5 1.2-1 1.7-1.7-.6.3-1.2.5-1.9.6z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: "mailto:hello@knowvlo.ai",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M4 5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H4zm0 2h16l-8 5-8-5zm0 3.2l7.5 4.7c.3.2.7.2 1 0L20 10.2V17H4v-6.8z" />
      </svg>
    ),
  },
];

export default function FooterSection() {
  return (
    <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-16 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
                K
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                KnowvloAI
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              KnowvloAI delivers structured lessons, interactive blogs, and an AI companion that keeps every learner on track, curious, and confident.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Navigate</h4>
            <p className="text-sm text-slate-300 mb-4">
              Explore curated courses, learn about our mission, and see how KnowvloAI can elevate your team or classroom.
            </p>
            <div className="flex flex-col space-y-3">
              <Link
                href="/courses"
                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition text-sm font-medium text-center"
              >
                Courses
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition text-sm font-medium text-center"
              >
                About Us
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Stay in touch</h4>
            <p className="text-sm text-slate-300 mb-6">
              Have questions or collaboration ideas? Drop us a quick note or follow along on social to see what’s launching next.
            </p>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-white">Email:</span>
                <a href="mailto:hello@knowvlo.ai" className="hover:text-blue-300 transition">
                  hello@knowvlo.ai
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-medium text-white">Support:</span>
                <span>Mon–Fri · 9am to 6pm IST</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} KnowvloAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

