export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          Delete your <span className="text-blue-500">account</span>
        </h1>
        <p className="text-slate-400 text-sm mb-10">
          The Oracle Pic 4 —{' '}
          <a href="https://theoraclepic4.com" className="text-blue-400 hover:underline">
            theoraclepic4.com
          </a>
        </p>

        <div className="text-slate-300 font-medium leading-relaxed space-y-6 text-sm">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">How to request deletion</h2>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>
                Email{' '}
                <a href="mailto:homeonline23@gmail.com" className="text-blue-400 hover:underline">
                  homeonline23@gmail.com
                </a>{' '}
                from the same address as your account.
              </li>
              <li>
                Use the subject line: <strong className="text-white">Delete my Oracle Pic 4 account</strong>
              </li>
              <li>We will confirm your request and delete your account within 30 days.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">What we delete</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Account profile (name, email, login credentials)</li>
              <li>Subscription status linked to your account</li>
              <li>Saved predictions and grid-related data stored for your user</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">What we may keep</h2>
            <p>
              Payment and invoice records from Stripe or PayPal may be retained as required by tax
              and accounting laws (typically up to 7 years). These records are not used for
              marketing after your account is deleted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Partial data deletion (optional)</h2>
            <p>
              To delete specific data without closing your account, email us with what you want
              removed. We will process GDPR access, correction, or portability requests the same way.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
