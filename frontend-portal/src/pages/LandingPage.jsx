import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, UploadCloud, Zap, FileCheck2, ArrowRight, Star, Lock, Clock } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
}

const STEPS = [
  { icon: UploadCloud, title: 'Upload Your Documents', desc: 'Securely upload your hospital bill, insurance policy, and rejection letter.' },
  { icon: Zap, title: 'AI Analyses Your Claim', desc: 'Our system checks your claim against IRDAI regulations in seconds.' },
  { icon: FileCheck2, title: 'Get Your Results', desc: 'See exactly what was wrongly deducted and how much you can recover.' },
]

const TRUST = [
  { icon: Lock, label: 'Bank-grade Security', desc: 'Your documents are encrypted and never shared.' },
  { icon: ShieldCheck, label: 'IRDAI Compliant', desc: 'Verified against official insurance regulations.' },
  { icon: Clock, label: 'Results in Minutes', desc: 'AI-powered analysis completes in under 2 minutes.' },
  { icon: Star, label: '100% Free', desc: 'No charges, no hidden fees. Always.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-black text-slate-900 tracking-tight">ClaimGuard</span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Patient Portal</span>
          </div>
          <Link to="/submit" className="btn-primary py-2 px-4 text-sm">
            Check My Claim <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Free Insurance Claim Verification
          </span>
        </motion.div>
        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight"
        >
          Was Your Insurance Claim
          <span className="text-blue-600 block">Wrongly Rejected?</span>
        </motion.h1>
        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          Upload your documents in 2 minutes. Our AI checks your claim against IRDAI regulations
          and tells you exactly how much you can recover — for free.
        </motion.p>
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/submit" className="btn-primary text-base px-8 py-4">
            Check My Claim for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="mt-4 text-xs text-slate-400"
        >
          No registration required · Results in under 2 minutes · 100% confidential
        </motion.p>
      </section>

      {/* Stats bar */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={5}
        className="max-w-4xl mx-auto px-4 sm:px-6 mb-16"
      >
        <div className="grid grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {[
            { val: '₹6.5L+', label: 'Average Recovered' },
            { val: '94%', label: 'Win Rate on Appeals' },
            { val: '< 2 min', label: 'Analysis Time' },
          ].map((s) => (
            <div key={s.label} className="bg-white py-6 text-center">
              <div className="text-2xl font-black text-blue-600">{s.val}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <motion.h2
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-2xl font-black text-slate-900 text-center mb-12"
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="card p-6 relative"
              >
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST.map((t, i) => {
              const Icon = t.icon
              return (
                <motion.div
                  key={t.label}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                  className="text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="font-bold text-sm text-slate-800">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to Check Your Claim?</h2>
          <p className="text-slate-500 mb-8">Upload your documents now. It takes less than 2 minutes.</p>
          <Link to="/submit" className="btn-primary text-base px-10 py-4">
            Get Started — It's Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>ClaimGuard AI · Patient Portal · Data protected under DPDP Act 2023 · No real patient data stored</p>
      </footer>
    </div>
  )
}
