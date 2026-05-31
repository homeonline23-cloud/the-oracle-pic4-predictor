'use client';

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

interface PayPalButtonProps {
  amount: string;
  tier: 'standard' | 'premium' | 'yearly';
  planName: string;
}

export default function PayPalButton({ amount, tier, planName }: PayPalButtonProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [displayAmount, setDisplayAmount] = useState(amount);
  const [country, setCountry] = useState<string | null>(null);
  const [{ options }, dispatch] = usePayPalScriptReducer();
  const [hasDetected, setHasDetected] = useState(false);
  const router = useRouter();

  // Detect location and currency
  useEffect(() => {
    if (hasDetected) return;

    const detectLocation = async () => {
      try {
        // Using ipwho.is as it has better CORS support and reliability
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();
        
        if (data.success && data.currency && data.currency.code !== 'USD') {
          const detectedCurrency = data.currency.code;
          const countryCode = data.country_code;
          const countryName = data.country;
          
          // Mapping for European countries to EUR if not already detected
          const europeanCountries = ['AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES'];
          
          let finalCurrency = detectedCurrency;
          if (europeanCountries.includes(countryCode)) {
            finalCurrency = 'EUR';
          }

          // Simple conversion logic (approximate)
          let rate = 1;
          if (finalCurrency === 'EUR') rate = 0.95;
          else if (finalCurrency === 'GBP') rate = 0.80;
          else if (finalCurrency === 'CAD') rate = 1.35;
          
          const converted = (parseFloat(amount) * rate).toFixed(2);
          
          setCurrency(finalCurrency);
          setDisplayAmount(converted);
          setCountry(countryName);

          // Update PayPal script options with new currency
          dispatch({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: "resetOptions" as any,
            value: {
              ...options,
              currency: finalCurrency,
            },
          });
        }
        setHasDetected(true);
      } catch {
        // Silently fail and default to USD to avoid confusing the user
        console.log("Location detection skipped (using default USD)");
        setHasDetected(true);
      }
    };

    detectLocation();
  }, [amount, dispatch, options, hasDetected]);

  if (status === 'processing') {
    return (
      <div className="w-full py-8 flex flex-col items-center justify-center space-y-4 bg-slate-800/50 rounded-none border border-blue-500/30">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-bold text-blue-400 tracking-normal">Processing Payment...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full py-8 flex flex-col items-center justify-center space-y-4 bg-green-500/10 rounded-none border border-green-500/30 px-4 text-center">
        <CheckCircle2 className="w-8 h-8 text-green-500" />
        <p className="text-sm font-bold text-green-500 tracking-normal">Subscription Active!</p>
        {isNewUser ? (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-300 font-bold tracking-normal">
              We&apos;ve sent an email with your new password.
            </p>
            <p className="text-[10px] text-slate-400">
              Please check your inbox (and spam) to login.
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="text-xs text-blue-400 underline font-bold mt-2"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <button 
            onClick={() => {
              if (tier === 'yearly') router.push('/yearly');
              else if (tier === 'premium') router.push('/premium');
              else router.push('/basic');
            }}
            className="text-xs text-green-400 underline font-bold tracking-normal"
          >
            Go to Grids
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="oracle-paypal-wrap relative z-10 mx-auto w-full max-w-[250px] min-h-[160px] pb-2">
      {status === 'error' && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-none flex items-center space-x-2 text-red-500">
          <AlertCircle size={16} />
          <p className="text-[10px] font-bold tracking-normal">{errorMessage || 'Payment failed. Please try again.'}</p>
        </div>
      )}
      
      {country && (
        <div className="mb-2 flex items-center justify-center gap-1.5 text-[8px] font-bold text-slate-400 tracking-normal opacity-70">
          <Globe size={10} className="text-blue-400" />
          <span>Detected Location: {country} ({currency})</span>
        </div>
      )}
      
      <PayPalButtons
        style={{
          layout: 'vertical',
          color: 'white',
          shape: 'rect',
          label: 'paypal',
          tagline: false,
          height: 42,
        }}
        createOrder={(_data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                description: `Oracle Pick 4 - ${planName}`,
                amount: {
                  currency_code: currency,
                  value: displayAmount,
                },
              },
            ],
          });
        }}
        onApprove={async (_data, actions) => {
          if (actions.order) {
            setStatus('processing');
            try {
              const order = await actions.order.capture();
              const payerEmail = order.payer?.email_address ?? user?.email ?? null;

              // Call our API to update the user's subscription tier
              const response = await fetch('/api/paypal/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: order.id,
                  userId: user?.id || null,
                  tier: tier,
                  email: payerEmail,
                  amount: parseFloat(displayAmount),
                  currency: currency,
                })
              });

              if (response.ok) {
                if (!user) {
                  setIsNewUser(true);
                }
                setStatus('success');
                
                // Only reload if user was already logged in (to refresh role)
                if (user) {
                  setTimeout(() => {
                    window.location.reload();
                  }, 3000);
                }
              } else {
                throw new Error('Failed to update subscription status');
              }
            } catch (err) {
              console.error(err);
              setStatus('error');
              setErrorMessage('Payment successful but failed to update account. Please contact support.');
            }
          }
        }}
        onError={(err) => {
          console.error(err);
          setStatus('error');
        }}
      />
    </div>
  );
}
