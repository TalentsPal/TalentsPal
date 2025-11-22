'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Master Your Career with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              TalentsPal AI
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform to prepare for exams, analyze your CV with advanced AI,
            and simulate real-world interviews to land your dream job.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button className="text-lg px-8 py-4 h-auto shadow-xl shadow-blue-200">
                Get Started for Free
              </Button>
            </Link>
            <Link href="/companies">
              <Button variant="outline" className="text-lg px-8 py-4 h-auto">
                Browse Companies
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats / Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 flex justify-center gap-8 text-gray-400 grayscale opacity-70"
        >
          {/* Placeholders for logos */}
          <div className="font-bold text-xl">TECHCORP</div>
          <div className="font-bold text-xl">FINANCEFLOW</div>
          <div className="font-bold text-xl">INNOVATE</div>
          <div className="font-bold text-xl">FUTURELABS</div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides a comprehensive suite of tools designed to give you the edge in a competitive job market.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:-translate-y-2 transition-transform duration-300" delay={0.2}>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-6">
                📄
              </div>
              <h3 className="text-2xl font-bold mb-4">AI CV Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant, detailed feedback on your resume. Our AI scores your CV and suggests improvements to beat ATS systems.
              </p>
            </Card>

            <Card className="p-8 hover:-translate-y-2 transition-transform duration-300" delay={0.3}>
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl mb-6">
                📝
              </div>
              <h3 className="text-2xl font-bold mb-4">Mock Exams</h3>
              <p className="text-gray-600 leading-relaxed">
                Practice with real-world questions from top companies. Timed tests help you build speed and accuracy.
              </p>
            </Card>

            <Card className="p-8 hover:-translate-y-2 transition-transform duration-300" delay={0.4}>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-3xl mb-6">
                💬
              </div>
              <h3 className="text-2xl font-bold mb-4">Interview Simulator</h3>
              <p className="text-gray-600 leading-relaxed">
                Practice behavioral and technical interviews with our intelligent AI bot. Get feedback on your answers instantly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to launch your career?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of students and professionals who are already using TalentsPal to get hired.
          </p>
          <Link href="/register">
            <Button className="text-lg px-10 py-4 h-auto bg-white text-gray-900 hover:bg-gray-100">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
