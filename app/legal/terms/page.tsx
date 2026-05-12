export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-12">Terms and <span className="text-blue-500">Conditions</span></h1>
        
        <div className="prose prose-invert max-w-none text-slate-400 font-medium leading-relaxed space-y-12">
          <p>Welcome to The Oracle Pick 4. By accessing or using our website, application, or services, you agree to be bound by these Terms and Conditions.</p>

          {/* Service Description */}
          <section>
            <h2 className="text-xl font-bold text-white tracking-normal mb-6 border-b border-white/10 pb-2">1. Service Description</h2>
            <div className="space-y-4 text-slate-300">
              <p>The Oracle <span className="text-red-600 font-bold">Pic 4</span> provides statistical analysis, pattern visualization, and prediction tools related to Pick-4 style lottery number games. The Oracle <span className="text-red-600 font-bold">Pic 4</span> does not sell lottery tickets, does not operate any lottery, and is not affiliated with any official lottery organization. All predictions are generated using analytical methods, statistical observations, and pattern-based systems.</p>
            </div>
          </section>

          {/* User Responsibility */}
          <section>
            <h2 className="text-xl font-bold text-white tracking-normal mb-6 border-b border-white/10 pb-2">2. User Responsibility</h2>
            <div className="space-y-4 text-slate-300">
              <p>Users are solely responsible for how they choose to use the information provided by The Oracle <span className="text-red-600 font-bold">Pic 4</span>.</p>
            </div>
          </section>

          {/* Subscription and Payments */}
          <section className="bg-blue-500/5 p-8 rounded-none border border-blue-500/20">
            <h2 className="text-xl font-bold text-blue-500 tracking-normal mb-6 border-b border-blue-500/10 pb-2">3. Subscription and Payments</h2>
            <div className="space-y-4 text-slate-300">
              <p>Some features of The Oracle <span className="text-red-600 font-bold">Pic 4</span> may require a paid membership or subscription. By subscribing, users agree to pay the stated fees for access to premium features. All payments are non-refundable unless otherwise required by law.</p>
            </div>
          </section>

          {/* Account Use */}
          <section>
            <h2 className="text-xl font-bold text-white tracking-normal mb-6 border-b border-white/10 pb-2">4. Account Use</h2>
            <div className="space-y-4 text-slate-300">
              <p>Users are responsible for maintaining the confidentiality of their account credentials. The Oracle <span className="text-red-600 font-bold">Pic 4</span> reserves the right to suspend or terminate accounts that misuse the platform.</p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-bold text-white tracking-normal mb-6 border-b border-white/10 pb-2">5. Changes to Terms</h2>
            <div className="space-y-4 text-slate-300">
              <p>We reserve the right to update these Terms and Conditions at any time. Continued use of the service constitutes acceptance of any changes.</p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-bold text-white tracking-normal mb-6 border-b border-white/10 pb-2">6. Contact Information</h2>
            <div className="space-y-4 text-slate-300">
              <p>If you have questions about privacy or wish to exercise your rights, please contact our support team.</p>
            </div>
          </section>

          <footer className="pt-12 border-t border-white/10 text-center">
            <p className="text-slate-500 text-xs font-bold tracking-normal mb-4">Acceptance of Terms</p>
            <p className="text-slate-400 text-sm italic">By using our services, you confirm that you have read, understood, and agreed to these terms and conditions.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
