import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { PriceBreakdown } from '../types';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  Smartphone,
  Building,
  ShieldCheck,
  X,
  Sparkles
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentDetails: { method: string; transactionId: string }) => void;
  priceBreakdown: PriceBreakdown;
  trackingNumberPreview?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  priceBreakdown,
  trackingNumberPreview
}) => {
  const [paymentTab, setPaymentTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 8910 2341 9081');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('883');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onSuccess({
          method: paymentTab.toUpperCase(),
          transactionId: `pay_rzp_live_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        });
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
        
        {/* Header - Professional navy header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm">Razorpay Checkout</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded border border-blue-400/40 font-medium">Live 256-Bit</span>
              </div>
              <p className="text-[11px] text-slate-300">SwiftShip Freight & Courier Services</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Payable Amount</span>
            {trackingNumberPreview && (
              <p className="text-[11px] text-blue-600 font-mono font-medium">Ref: {trackingNumberPreview}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-slate-900">₹{priceBreakdown.total.toLocaleString('en-IN')}</span>
            <span className="block text-[10px] text-emerald-600 font-semibold">Inclusive of 18% GST</span>
          </div>
        </div>

        {isCompleted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Payment Successful!</h4>
            <p className="text-xs text-slate-500">Transaction ID: <span className="font-mono text-blue-600 font-medium">pay_rzp_live_{Math.random().toString(36).substring(2, 8).toUpperCase()}</span></p>
            <p className="text-xs text-slate-600">Generating shipping manifest & driver dispatch...</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            
            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentTab('upi')}
                className={`py-2 rounded-md flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  paymentTab === 'upi'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                UPI & QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('card')}
                className={`py-2 rounded-md flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  paymentTab === 'card'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('netbanking')}
                className={`py-2 rounded-md flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  paymentTab === 'netbanking'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4" />
                Netbanking
              </button>
            </div>

            {/* Tab 1: UPI */}
            {paymentTab === 'upi' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="w-32 h-32 bg-white rounded-lg p-2 mx-auto flex items-center justify-center border border-slate-200 shadow-xs">
                    {/* Simulated Clean UPI QR code */}
                    <div className="w-full h-full bg-slate-900 rounded p-1 flex flex-col items-center justify-center">
                      <QrCode className="w-20 h-20 text-blue-400" />
                      <span className="text-[8px] font-mono text-slate-200 mt-1">Scan via any UPI App</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs text-slate-600 font-medium">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">GPay</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">PhonePe</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">Paytm</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">BHIM</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Or enter UPI VPA / ID</label>
                  <input
                    type="text"
                    placeholder="e.g. mobile@okhdfcbank or yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Cards */}
            {paymentTab === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 font-medium mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 font-medium mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Netbanking */}
            {paymentTab === 'netbanking' && (
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map((bank, i) => (
                  <button
                    key={i}
                    type="button"
                    className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-xs text-slate-700 hover:text-blue-700 text-left transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{bank}</span>
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            )}

            {/* Pay Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePay}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Razorpay Security...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay ₹{priceBreakdown.total.toLocaleString('en-IN')} Securely
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Level 1 Certified • End-to-End Encrypted</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
