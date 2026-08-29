import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';

const GOOGLE_FORM_FEEDBACK_URL = 'https://forms.gle/baCGAAzXAaKb98Yb6';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId?: string;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  shipmentId
}) => {
  const { currentUser, fileComplaint, shipments } = useApp();

  const [category, setCategory] = useState<'DELAY' | 'DAMAGED_PACKAGE' | 'WRONG_ADDRESS' | 'DRIVER_BEHAVIOR' | 'BILLING' | 'OTHER'>('DELAY');
  const [description, setDescription] = useState('Package transit is delayed past the initial estimated delivery window.');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const targetShipment = shipmentId ? shipments.find(s => s.id === shipmentId) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    await fileComplaint({
      user_id: currentUser.id,
      shipment_id: shipmentId,
      category,
      description
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl p-6 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">File Support Complaint</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 text-base">Support Ticket Created!</h4>
            <p className="text-xs text-slate-500">Our logistics operations supervisor has been alerted and will update your ticket shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {targetShipment && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500">Linked Consignment:</span>
                <p className="font-mono font-bold text-blue-600">{targetShipment.tracking_number} ({targetShipment.sender_address.city} ➔ {targetShipment.receiver_address.city})</p>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 cursor-pointer"
              >
                <option value="DELAY">Transit Delay Past SLA</option>
                <option value="DAMAGED_PACKAGE">Damaged or Tampered Package</option>
                <option value="WRONG_ADDRESS">Address Correction / Redirect</option>
                <option value="DRIVER_BEHAVIOR">Delivery Partner Assistance</option>
                <option value="BILLING">Billing / Invoice Inquiry</option>
                <option value="OTHER">Other Query</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Detailed Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg p-3 text-slate-900 placeholder-slate-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-all cursor-pointer"
            >
              Submit Support Ticket
            </button>

            <div className="pt-2 text-center border-t border-slate-100">
              <a
                href={GOOGLE_FORM_FEEDBACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                <span>Have general suggestions or feedback? Open Google Form</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
