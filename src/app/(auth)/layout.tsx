export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/50" />

        {/* Animated floating elements */}
        <div className="absolute inset-0 z-0">
          {/* Floating orbs with more colors */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-2xl animate-float" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-to-br from-blue-400/25 to-cyan-400/25 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-gradient-to-br from-purple-300/20 to-indigo-400/20 rounded-full blur-2xl animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/3 w-44 h-44 bg-gradient-to-br from-violet-400/15 to-fuchsia-400/15 rounded-full blur-3xl animate-float" />
          <div className="absolute top-2/3 left-1/5 w-32 h-32 bg-gradient-to-br from-blue-300/15 to-purple-300/15 rounded-full blur-2xl animate-float-delayed" />

          {/* Animated study icons with colorful backgrounds */}
          <div className="absolute top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-72 h-72">
              {/* Book icon - Purple/Pink */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-float">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400/30 to-pink-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                  <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              {/* Brain/AI icon - Blue/Cyan */}
              <div className="absolute top-1/4 right-4 transform animate-float-delayed">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                  <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              {/* Sparkles icon - Yellow/Orange */}
              <div className="absolute top-1/4 left-4 transform animate-float-slow">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-300/30 to-orange-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                  <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>

              {/* Calculator - Rose/Pink */}
              <div className="absolute bottom-8 left-4 transform animate-float-slow">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400/30 to-pink-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Chart icon - Green/Emerald */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 -translate-x-8 animate-float-delayed">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400/30 to-emerald-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                  <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>

              {/* Graduation Cap - Indigo/Violet */}
              <div className="absolute bottom-8 right-4 transform animate-float">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400/30 to-violet-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                  <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
              </div>

              {/* Target/Goal - Teal/Cyan */}
              <div className="absolute top-1/2 right-0 transform translate-x-2 animate-float-delayed">
                <div className="w-11 h-11 bg-gradient-to-br from-teal-400/30 to-cyan-400/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                  <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent tracking-wide">
            STUDEN
          </h1>
          <p className="text-purple-100 text-lg">
            Your AI-Powered Study Platform
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="text-white">
            <p className="text-xl font-medium mb-4">
              "Study smarter, not harder with AI-powered tools designed for your success."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                S
              </div>
              <div>
                <div className="font-semibold text-white">Studen AI</div>
                <div className="text-purple-100 text-sm">Your Study Companion</div>
              </div>
            </div>
          </blockquote>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white mb-1">AI</div>
              <div className="text-purple-100 text-sm">Summaries & Quizzes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold text-white mb-1">📚</div>
              <div className="text-purple-100 text-sm">Smart Study Plans</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
