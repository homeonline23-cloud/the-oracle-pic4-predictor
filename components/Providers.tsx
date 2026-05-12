'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AuthProvider } from '@/hooks/useAuth';

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AYPIEIJqOV2bEg4v8RkDB93PaFJdKSbp2MrqM-UGmOiS6Xcfcoj4UzMdZ8qIFdcf6oDetfFcKJTD7YUz";
const isValidClientId = paypalClientId && !paypalClientId.startsWith('http');

const initialOptions = {
  clientId: isValidClientId ? paypalClientId : "AYPIEIJqOV2bEg4v8RkDB93PaFJdKSbp2MrqM-UGmOiS6Xcfcoj4UzMdZ8qIFdcf6oDetfFcKJTD7YUz",
  currency: "USD",
  intent: "capture",
  locale: "en_US",
};

export function Providers({ children }: { children: React.ReactNode }) {
  // If the client ID is clearly a URL (common mistake), we don't want to break the whole app
  // but we still need the provider to exist for the context.
  return (
    <PayPalScriptProvider options={initialOptions}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PayPalScriptProvider>
  );
}
