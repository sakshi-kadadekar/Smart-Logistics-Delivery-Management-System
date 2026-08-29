import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, X, CheckCircle2, ExternalLink } from 'lucide-react';

const GOOGLE_FORM_FEEDBACK_URL = 'https://forms.gle/baCGAAzXAaKb98Yb6';

interface RateDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId?: string;
}

export const RateDeliveryModal: React.FC<RateDeliveryModalProps> = ({
  isOpen,
  onClose,
  shipmentId
}) => {
  const { rateShipmentDelivery, shipments } = useApp();

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('Courteous delivery partner, delivered on time!');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !shipmentId) return null;

  const shipment = shipments.find(s => s.id === shipmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await rateShipmentDelivery(shipmentId, rating, feedback);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Rate Delivery Experience
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 text-base">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-500">Your rating helps maintain exceptional SLA standards for our driver partners.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {shipment && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Consignment:</span>
                <p className="font-mono font-bold text-blue-600">{shipment.tracking_number}</p>
              </div>
            )}

            <div className="text-center space-y-2">
              <label className="block text-slate-700 font-semibold">How was your delivery service?</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Optional Comments</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg p-3 text-slate-900 placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-all cursor-pointer"
            >
              Submit Rating & Review
            </button>

            <div className="pt-2 text-center border-t border-slate-100">
              <a
                href={GOOGLE_FORM_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                <span>Want to provide detailed platform feedback? Open Google Form</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
