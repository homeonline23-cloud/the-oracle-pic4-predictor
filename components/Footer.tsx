'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  return (
    <footer className="w-full py-6 flex flex-col items-center justify-center text-center gap-3 relative z-20">
      {/* Combined Policy Links */}
      <div className="flex flex-wrap justify-center items-center gap-x-4 text-[11px] md:text-[12px] font-bold tracking-normal text-white mb-1">
        <button type="button" onClick={() => setActivePolicy('terms')} className="text-white hover:text-blue-400 transition-colors">Terms</button>
        <button type="button" onClick={() => setActivePolicy('privacy')} className="text-white hover:text-blue-400 transition-colors">Privacy</button>
        <button type="button" onClick={() => setActivePolicy('disclaimer')} className="text-white hover:text-blue-400 transition-colors">Disclaimer</button>
        <button type="button" onClick={() => setActivePolicy('refund')} className="text-white hover:text-blue-400 transition-colors">Refund</button>
        <button type="button" onClick={() => setActivePolicy('gambling')} className="text-white hover:text-blue-400 transition-colors">Gambling</button>
        <Link href="/contact" className="text-white hover:text-blue-400 transition-colors">Contact</Link>
      </div>

      {/* Trade name / legal — bottom of footer; RWB stripe matches site dividers */}
      <div className="relative w-full max-w-2xl mx-auto mt-2 px-4 pb-2">
        <div
          aria-hidden
          className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-600 via-white to-red-600 rounded-none opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
        />
        <div className="flex flex-col items-center gap-2 text-center pt-7">
          <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-white to-blue-600 tracking-tight text-[13px] sm:text-sm md:text-base whitespace-nowrap max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            The Oracle Pic 4
          </span>
          <span className="text-white/85 text-[11px] md:text-[12px] font-semibold tracking-wide">
            © All rights reserved
          </span>
          <span className="text-slate-300 text-[11px] md:text-[12px] font-medium tracking-normal opacity-90">
            K.v.K nr. 42056088
          </span>
        </div>
      </div>

      {/* Policies Modal */}
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border-[6px] border-slate-800 shadow-[12px_12px_0px_0px_rgba(30,41,59,1)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center border-b-4 border-slate-800">
                <span className="font-bold tracking-normal text-sm">
                  {activePolicy === 'terms' && 'Terms and Conditions'}
                  {activePolicy === 'privacy' && 'Privacy Policy'}
                  {activePolicy === 'disclaimer' && 'Disclaimer'}
                  {activePolicy === 'refund' && 'Refund Policy'}
                  {activePolicy === 'gambling' && 'Gambling Policy'}
                </span>
                <button 
                  onClick={() => setActivePolicy(null)} 
                  className="hover:bg-red-500 p-1 transition-colors rounded-none text-white"
                  title="Close"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>
              
              {/* Modal Content - Scrollable */}
              <div className="overflow-y-auto p-8 text-slate-700 font-sans">
                {activePolicy === 'disclaimer' && (                      <section>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4 border-b-2 border-slate-100 pb-2">Disclaimer</h2>
                    <div className="space-y-4 text-sm leading-relaxed text-slate-700">
                      <p>The Oracle Pick 4 provides number analysis and prediction tools for entertainment purposes only.</p>
                      <p>We do not guarantee winning numbers or lottery outcomes. The Oracle <span className="text-red-600 font-bold">Pic 4</span> is not affiliated with any official lottery organization and does not sell lottery tickets.</p>
                      <p>All lottery games are based on chance, and past patterns do not guarantee future results.</p>
                      <p>Users are responsible for their own decisions when playing lottery games. Please play responsibly.</p>
                      
                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <h3 className="font-bold text-slate-900 text-xs mb-1">Contact information</h3>
                        <p>If you have questions about privacy or wish to exercise your rights, please contact us for support: <a href="mailto:karelcarty@gmail.com" className="text-blue-600 hover:underline font-bold">karelcarty@gmail.com</a></p>
                      </div>
                    </div>
                  </section>
                )}

                {activePolicy === 'privacy' && (
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4 border-b-2 border-slate-100 pb-2">Privacy Policy</h2>
                    <div className="space-y-4 text-sm leading-relaxed text-slate-700">
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">1. What Data We Collect</h3>
                        <p>When you create an account or subscribe, we may collect: your name, email address, and account credentials. We do <strong>not</strong> collect or store credit card numbers, bank details, or other sensitive payment information — all payments are processed securely by Stripe.</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">2. How We Use Your Information</h3>
                        <p>We use your information to: provide access to your account and subscription, communicate important service updates, and improve the quality of our service. We will never sell or share your personal data with third parties for marketing purposes.</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">3. Payment Processing</h3>
                        <p>The Oracle <span className="text-red-600 font-bold">Pic 4</span> does not store any sensitive payment details. All transactions are handled by Stripe under its privacy policy and PCI-DSS compliance.</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">4. AI Processing</h3>
                        <p>Our service uses Google Gemini AI to generate predictions based on the numbers you submit. Submitted numbers are processed in real time and are not stored by the AI provider beyond the duration of the request.</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">5. Data Retention</h3>
                        <p>We retain your account information for as long as your account is active. If you request account deletion, all personal data will be removed within 30 days. Transaction records may be kept longer as required by tax and accounting laws.</p>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">6. Cookies</h3>
                        <p>Our website may use cookies to improve functionality and user experience. You can manage cookie preferences through your browser settings.</p>
                      </div>
                      <div className="bg-blue-50 p-4 border-l-4 border-blue-600">
                        <h3 className="font-bold text-blue-900 text-xs mb-1">7. Your Rights (GDPR / AVG)</h3>
                        <p className="text-blue-800">Under the General Data Protection Regulation (GDPR), you have the right to: <strong>access</strong> your personal data, request <strong>correction</strong> of inaccurate data, request <strong>deletion</strong> of your data, <strong>object</strong> to processing, and request <strong>data portability</strong>. To exercise any of these rights, contact us at the email below.</p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <h3 className="font-bold text-slate-900 text-xs mb-1">Contact information</h3>
                        <p>If you have questions about privacy or wish to exercise your rights, please contact us for support: <a href="mailto:karelcarty@gmail.com" className="text-blue-600 hover:underline font-bold">karelcarty@gmail.com</a></p>
                      </div>
                    </div>
                  </section>
                )}

                {activePolicy === 'terms' && (
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4 border-b-2 border-slate-100 pb-2">Terms and Conditions</h2>
                    <div className="space-y-4 text-sm leading-relaxed text-slate-700">
                      <p>Welcome to The Oracle Pick 4. By accessing or using our website, application, or services, you agree to be bound by these Terms and Conditions.</p>
                      
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">1. Service Description</h3>
                        <p>The Oracle <span className="text-red-600 font-bold">Pic 4</span> provides statistical analysis, pattern visualization, and prediction tools related to Pick-4 style lottery number games. The Oracle <span className="text-red-600 font-bold">Pic 4</span> does not sell lottery tickets, does not operate any lottery, and is not affiliated with any official lottery organization. All predictions are generated using analytical methods, statistical observations, and pattern-based systems.</p>
                      </div>

                      <div className="bg-red-50 p-4 border-l-4 border-red-600">
                        <h3 className="font-bold text-red-900 text-xs mb-1">2. Age Requirement (18+)</h3>
                        <p className="text-red-800">You must be at least <strong>18 years of age</strong> to use The Oracle <span className="text-red-600 font-bold">Pic 4</span> services. By creating an account, you confirm that you meet this age requirement. We reserve the right to terminate accounts of users found to be under 18.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">3. User Responsibility</h3>
                        <p>Users are solely responsible for how they choose to use the information provided by The Oracle <span className="text-red-600 font-bold">Pic 4</span>.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">4. Subscription and Payments</h3>
                        <p>Some features of The Oracle <span className="text-red-600 font-bold">Pic 4</span> may require a paid membership or subscription. By subscribing, users agree to pay the stated fees for access to premium features. All payments are non-refundable unless otherwise required by law.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">5. Account Use</h3>
                        <p>Users are responsible for maintaining the confidentiality of their account credentials. The Oracle <span className="text-red-600 font-bold">Pic 4</span> reserves the right to suspend or terminate accounts that misuse the platform.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">6. Changes to Terms</h3>
                        <p>We reserve the right to update these Terms and Conditions at any time. Continued use of the service constitutes acceptance of any changes.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">7. Contact information</h3>
                        <p>If you have questions about privacy or wish to exercise your rights, please contact us for support: <a href="mailto:karelcarty@gmail.com" className="text-blue-600 hover:underline font-bold">karelcarty@gmail.com</a></p>
                      </div>
                    </div>
                  </section>
                )}

                {activePolicy === 'refund' && (
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4 border-b-2 border-slate-100 pb-2">No Refund Policy</h2>
                    <div className="space-y-4 text-sm leading-relaxed text-slate-700">
                      <p>By signing up to The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor, you agree to the following <strong>No Refund Policy</strong>.</p>
                      
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">1. Membership & Access</h3>
                        <p>When you register, you will receive access to The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor services, features, and any associated content provided as part of your membership. Access is granted for the period specified at the time of purchase.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">2. No Refund Policy</h3>
                        <p>All payments made to The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor are final. By completing your purchase, you acknowledge and agree that no refunds, chargebacks, or cancellations will be issued under any circumstances, including but not limited to dissatisfaction with the service or results.</p>
                      </div>

                      <div className="bg-amber-50 p-4 border-l-4 border-amber-500">
                        <h3 className="font-bold text-amber-900 text-xs mb-1">3. Waiver of Right of Withdrawal (EU/EEA)</h3>
                        <p className="text-amber-800">Under EU consumer protection law, you normally have a 14-day right of withdrawal for online purchases. However, by subscribing to The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor and accessing the digital service immediately, you <strong>expressly consent</strong> to the immediate performance of the service and <strong>acknowledge that you waive your right of withdrawal</strong> once access to the digital content has been granted. This is in accordance with Article 16(m) of the EU Consumer Rights Directive 2011/83/EU.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">4. For Entertainment Purposes Only</h3>
                        <p>The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor provides number predictions and related content strictly for entertainment purposes. We do not guarantee winnings, outcomes, or financial gain.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">5. User Responsibility</h3>
                        <p>Members are responsible for how they use the information provided. You agree that any decisions made based on our predictions are at your own discretion and risk.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">6. Account Use</h3>
                        <p>Your membership is personal and may not be shared, transferred, or resold. Unauthorized use may result in suspension or termination of your account without notice.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">7. Modifications to Service</h3>
                        <p>We reserve the right to modify, update, or discontinue any part of the service at any time without prior notice.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">8. Limitation of Liability</h3>
                        <p>The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor is not liable for any losses, damages, or claims arising from the use of our service.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">9. Acceptance of Terms</h3>
                        <p>By signing up, you confirm that you have read, understood, and agreed to these terms and conditions.</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <h3 className="font-bold text-slate-900 text-xs mb-1">Contact information</h3>
                        <p>If you have questions about privacy or wish to exercise your rights, please contact us for support: <a href="mailto:karelcarty@gmail.com" className="text-blue-600 hover:underline font-bold">karelcarty@gmail.com</a></p>
                      </div>
                    </div>
                  </section>
                )}

                {activePolicy === 'gambling' && (
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4 border-b-2 border-slate-100 pb-2">Gambling Policy</h2>
                    <div className="space-y-4 text-sm leading-relaxed text-slate-700">
                      <p className="font-bold text-slate-500 tracking-normal text-[10px] mb-2 text-center">The Oracle <span className="text-red-600">Pic 4</span> Predictor</p>
                      
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">1. Membership & Access</h3>
                        <p>By signing up for The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor, you will receive access to our prediction services and related content. Access is granted for the period specified at the time of purchase.</p>
                      </div>

                      <div className="bg-red-50 p-4 border-l-4 border-red-600">
                        <h3 className="font-bold text-red-900 text-xs mb-1">2. Age Requirement (18+)</h3>
                        <p className="text-red-800">You must be at least <strong>18 years of age</strong> to use this service. By creating an account, you confirm that you meet this age requirement. The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor is intended for adult users only. We reserve the right to terminate accounts of users found to be under 18.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">3. No Refund Policy</h3>
                        <p>All payments made to The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor are <strong>final</strong>. By completing your registration, you acknowledge and agree that no refunds, cancellations, or chargebacks will be issued for any reason, including dissatisfaction with the service or results.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">4. Entertainment Use Only</h3>
                        <p>The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor is provided strictly for entertainment purposes. We do not guarantee winnings, outcomes, or financial gain.</p>
                      </div>

                      <div className="bg-blue-50 p-4 border-l-4 border-blue-600">
                        <h3 className="font-bold text-blue-900 text-xs mb-1">5. Not Gambling or Ticket Sales</h3>
                        <p className="text-blue-800">The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor is not a gambling service and does not sell lottery tickets or any form of betting tickets. Any predictions provided are for fun and entertainment only.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">6. User Responsibility</h3>
                        <p>Members are fully responsible for how they use the information provided. Decisions based on our predictions are made at your own risk and discretion.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">7. Account Use</h3>
                        <p>Membership is personal and may not be shared, transferred, or resold. Unauthorized use may result in suspension or termination of your account without notice.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">8. Modifications to Service</h3>
                        <p>We reserve the right to modify, update, or discontinue any part of the service at any time without prior notice.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">9. Limitation of Liability</h3>
                        <p>The Oracle <span className="text-red-600 font-bold">Pic 4</span> Predictor is not liable for any losses, damages, or claims arising from the use of the service.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-xs mb-1">10. Acceptance of Terms</h3>
                        <p>By signing up, you confirm that you have read, understood, and agreed to these terms and disclaimer.</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <h3 className="font-bold text-slate-900 text-xs mb-1">Contact information</h3>
                        <p>If you have questions about privacy or wish to exercise your rights, please contact us for support: <a href="mailto:karelcarty@gmail.com" className="text-blue-600 hover:underline font-bold">karelcarty@gmail.com</a></p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t-2 border-slate-100 text-center">
                <div className="text-slate-400 font-bold text-xl tracking-normal">
                  2026
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
