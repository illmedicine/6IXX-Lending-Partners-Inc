import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function DisclosureModal({ isOpen, onClose, onAccept }: DisclosureModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasScrolledToBottom(false);
      setCheckbox1(false);
      setCheckbox2(false);
    }
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const hasReachedBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (hasReachedBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const canAccept = hasScrolledToBottom && checkbox1 && checkbox2;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Mandatory Disclosure</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700"
          onScroll={handleScroll}
        >
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="font-semibold text-yellow-800">
              ⚠️ Must be read and accepted before loan submission
            </p>
          </div>

          <p className="font-medium text-gray-900">
            This section explains what may happen if you become delinquent or default on your loan funded and/or serviced by 6IXX Lending Partners ("Lending Partners," "we," "us").
          </p>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">1) Key Definitions</h3>
            <div className="space-y-2 pl-4">
              <p><strong>Payment Due Date:</strong> The date your scheduled payment must be received (as shown in your loan schedule).</p>
              <p><strong>Delinquent:</strong> A payment is not received by the end of the due date (or the next business day if payment rails are unavailable).</p>
              <p><strong>Default:</strong> Your account may be considered in default if (a) you remain delinquent beyond the cure period described below, (b) you fail to comply with material loan terms, or (c) your payment is returned/reversed and not promptly replaced.</p>
              <p><strong>Cure Period:</strong> A limited time to bring your account current before escalation.</p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">2) When Your Loan Becomes Delinquent</h3>
            <p className="mb-2">If you miss a payment:</p>
            <div className="space-y-2 pl-4">
              <p><strong>Day 1 (after missed due date):</strong> Your loan becomes delinquent. We may send reminders by email/SMS/push notifications and may attempt to contact you by phone.</p>
              <p><strong>Cure Period:</strong> You may cure delinquency by paying the past-due amount plus any permitted fees described in your Loan Agreement.</p>
              <p><strong>Partial Payments:</strong> If accepted, partial payments may reduce your balance but do not necessarily stop delinquency status unless your account is brought fully current.</p>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">3) Late Fees, Interest, and Returned Payments</h3>
            <p className="mb-2">If permitted by your Loan Agreement and applicable law:</p>
            <ul className="list-disc pl-8 space-y-1">
              <li>Late fees may apply after a stated grace period (if any).</li>
              <li>Default interest (or continued interest) may accrue on past-due amounts.</li>
              <li>Returned/reversed payments may be subject to a returned payment fee, and the loan may be treated as delinquent until the payment is successfully replaced.</li>
            </ul>
            <p className="mt-2 italic">All fees and interest are subject to your Loan Agreement and applicable federal/state law. If a fee is not allowed where you live, we will not charge it.</p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">4) Escalation Path: Internal Collections → External Collections → Court</h3>
            <p className="mb-3">If you remain delinquent and do not cure, Lending Partners may escalate collection efforts in the sequence below. This sequence may vary based on your loan terms, payment history, amount owed, and applicable law.</p>
            
            <div className="space-y-3 pl-4">
              <div>
                <h4 className="font-semibold text-gray-900">Stage A — Internal Servicing & Collection Outreach</h4>
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>We may offer payment arrangements, modified due dates, or settlement options at our discretion.</li>
                  <li>We may require updated contact and income information to evaluate hardship options.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Stage B — External Collections Assignment</h4>
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>If delinquency continues, we may assign your account to a licensed third-party debt collector to attempt collection.</li>
                  <li>A collector may contact you to request payment, negotiate a plan, or confirm your dispute rights.</li>
                  <li>The collector may seek collection of the balance due, plus any contractual and legally permitted fees/costs.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900">Stage C — Court Action (Lawsuit) and Judgment</h4>
                <p className="mt-1 mb-1">If delinquency continues, Lending Partners may pursue legal action to recover amounts owed. Court action may include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Filing a claim in small claims court or civil court (depending on amount owed and jurisdiction)</li>
                  <li>Seeking a money judgment for the amounts due, including principal, interest, permitted fees, and court costs (and attorney's fees if allowed by contract and law)</li>
                  <li>If a judgment is entered, we may pursue lawful post-judgment remedies that may include wage garnishment, bank levy, or liens only where permitted and only through legal process.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">5) Transfer, Assignment, or Sale of Your Debt</h3>
            <p className="mb-2">You understand and agree that if you become delinquent or default:</p>
            <ul className="list-disc pl-8 space-y-1">
              <li>Your loan and/or the right to collect may be transferred, assigned, or sold to another company (a "Debt Buyer") at any time.</li>
              <li>If sold or assigned, the new owner/servicer/collector may have the right to collect the full amount owed under your agreement, subject to applicable law.</li>
              <li>You will remain responsible for payment unless the loan is paid in full or otherwise formally settled/released in writing.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">6) Credit Reporting</h3>
            <p className="mb-2">Where permitted and if Lending Partners or their agents furnish information to credit bureaus:</p>
            <ul className="list-disc pl-8 space-y-1">
              <li>Late payments, delinquency status, default, charge-off, settlement, or collections activity may be reported.</li>
              <li>Negative reporting may impact your ability to obtain credit, housing, employment screening (where applicable), or insurance pricing.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">7) Disputes, Verification, and Communication Preferences</h3>
            <ul className="list-disc pl-8 space-y-1">
              <li>You may have the right to dispute the debt and request verification from a third-party collector as required by law.</li>
              <li>You may request that communications occur through specific channels (e.g., email only), subject to legal requirements and operational limits.</li>
              <li>We will not threaten arrest or criminal action for nonpayment. Nonpayment is a civil matter.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3">8) Important Borrower Acknowledgements</h3>
            <p className="mb-2">By continuing, you acknowledge and agree that:</p>
            <ul className="list-disc pl-8 space-y-1">
              <li>Nonpayment has consequences, including collection activity and possible legal action.</li>
              <li>Lending Partners may pursue internal outreach, third-party collections, court, and judgment enforcement as permitted by law.</li>
              <li>Your loan may be assigned or sold if delinquent or in default.</li>
              <li>You are responsible for all amounts due under your Loan Agreement, including permitted fees and costs.</li>
              <li>You have read and understood this Delinquency, Court, and Collections Transfer Policy.</li>
            </ul>
          </section>

          {!hasScrolledToBottom && (
            <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-8 text-center">
              <p className="text-sm text-gray-500 animate-bounce">↓ Scroll to bottom to continue ↓</p>
            </div>
          )}
        </div>

        {/* Footer with checkboxes */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {!hasScrolledToBottom && (
            <p className="text-sm text-red-600 font-medium mb-4">
              ⚠️ You must scroll to the bottom and read the entire policy to continue.
            </p>
          )}
          
          <div className="space-y-3 mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkbox1}
                onChange={(e) => setCheckbox1(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className={`text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700'}`}>
                I have read and agree to the Delinquency, Court, and Collections Transfer Policy, including that my loan may be referred to a collector, pursued in court, and/or sold or assigned if I become delinquent or default.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checkbox2}
                onChange={(e) => setCheckbox2(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <span className={`text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700'}`}>
                I consent to receive delinquency and servicing notices by email/SMS/push notifications at the contact information I provided (message/data rates may apply).
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!canAccept}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                canAccept
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
