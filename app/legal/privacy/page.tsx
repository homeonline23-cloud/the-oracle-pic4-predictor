export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Privacy <span className="text-blue-500">Policy</span>
        </h1>
        <p className="text-slate-400 text-sm mb-10">
          The Oracle Pic 4 —{' '}
          <a href="https://theoraclepic4.com" className="text-blue-400 hover:underline">
            theoraclepic4.com
          </a>
        </p>

        <div className="prose prose-invert max-w-none text-slate-300 font-medium leading-relaxed space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">1. What we collect</h2>
            <p>
              When you create an account or subscribe, we may collect your name, email address, and
              account credentials. We do not store credit card or bank details — payments are
              processed by Stripe.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">2. How we use your information</h2>
            <p>
              We use your information to provide access to your account and subscription, send
              service updates, and improve the service. We do not sell your personal data for
              marketing.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">3. AI processing</h2>
            <p>
              Our service may use Google Gemini AI to generate responses from numbers you submit.
              Data is processed for the request and not stored by the AI provider beyond that.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">4. Your rights (GDPR)</h2>
            <p>
              You may request access, correction, deletion, or portability of your data. Contact:{' '}
              <a href="mailto:karelcarty@gmail.com" className="text-blue-400 hover:underline">
                karelcarty@gmail.com
              </a>
            </p>
          </section>
          <p className="text-slate-500 text-xs pt-8 border-t border-white/10">
            For Terms, Disclaimer, Refund, and Gambling policies, use the links in the site footer
            on any page.
          </p>
        </div>
      </div>
    </div>
  );
}
