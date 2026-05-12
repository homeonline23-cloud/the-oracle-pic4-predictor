'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import GridButtons from '@/components/GridButtons';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
    window.location.href = `mailto:karelcarty@gmail.com?subject=${encodeURIComponent(subject || 'Contact from Oracle Pic 4')}&body=${body}`;
    setSent(true);
  }

  return (
    <main className="relative flex min-w-0 flex-col items-center overflow-x-clip p-0 pb-0 pt-4 font-sans">
      <PageHeader />
      <div className="mb-4 md:mb-8 w-full">
        <GridButtons />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-2 md:px-6">
        <div className="w-full max-w-3xl px-2 md:px-6">
          {/* Banner */}
          <div className="mb-6 overflow-hidden rounded-none border-2 border-red-600/55">
            <img
              src="/banner-email-window.png"
              alt="Contact The Oracle Pic 4"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Contact Form Window */}
          <div className="rounded-none border-2 border-red-600/55 bg-[#29465B] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.5)] backdrop-blur-md md:p-8">
            <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-white md:text-3xl">
              Contact Us
            </h1>
            <p className="mb-6 text-center text-sm text-slate-300">
              Have a question or need support? Fill in the form below and we will get back to you.
            </p>

            {sent ? (
              <div className="py-10 text-center">
                <p className="text-lg font-bold text-emerald-400">Your email client has been opened.</p>
                <p className="mt-2 text-sm text-slate-300">Please send the email from your mail application to complete your message.</p>
                <Link
                  href="/"
                  className="mt-6 inline-block rounded-none border border-white/20 bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1 block text-xs font-bold text-slate-200">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-none border border-white/20 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-xs font-bold text-slate-200">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-none border border-white/20 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="mb-1 block text-xs font-bold text-slate-200">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-none border border-white/20 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Subject (optional)"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1 block text-xs font-bold text-slate-200">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded-none border border-white/20 bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Write your message here..."
                  />
                </div>
                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    className="rounded-none border border-white/20 bg-gradient-to-r from-blue-600 to-red-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-red-700 active:scale-[0.98]"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pb-8"></div>
        </div>
      </div>
    </main>
  );
}
