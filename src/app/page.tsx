"use client";

import Link from "next/link";
import { SignInButton } from "@/components/SignInButton";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            C<sup>2</sup>
          </div>
          <span className="font-bold text-xl tracking-tight">Contributor Compass</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            GitHub
          </a>
          <SignInButton />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative mt-[-5rem]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-400 mb-8 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          Next-Gen Repository Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 drop-shadow-sm">
          Understand any codebase in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">minutes</span>, not weeks.
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed font-light">
          Connect a GitHub repository to instantly generate dependency graphs, file complexity maps, and get an AI guide to help you build your first PR.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-semibold text-lg transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:-translate-y-1 w-full sm:w-auto"
          >
            Start Analyzing Free
          </Link>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold text-lg transition-all w-full sm:w-auto"
          >
            View Live Demo
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="text-3xl mb-4">🕸️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Visual Mapping</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Instantly visualize how files import and depend on each other with interactive graphing.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="text-3xl mb-4">🚦</div>
            <h3 className="text-xl font-semibold text-white mb-2">Complexity Scoring</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Files are analyzed via AST and graded automatically as 🟢 Beginner, 🟡 Intermediate, or 🔴 Advanced.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Code Guide</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Ask Claude 3.5 Sonnet to explain specific architectural patterns while reading the actual file contents.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
