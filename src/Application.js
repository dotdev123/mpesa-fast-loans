import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

function Application() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loan, setLoan] = useState(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [county, setCounty] = useState('');
  const [reason, setReason] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  const reasons = [
    'Emergency Medical Expenses',
    'School Fees / Education',
    'Business Capital',
    'Rent / Housing',
    'Family Support',
    'Other Personal Need',
  ];

  const counties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
    'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
    'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
    'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
    'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
    'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
    'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
    'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
    'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
    'Vihiga', 'Wajir', 'West Pokot'
  ];

  useEffect(() => {
    const savedPhone = localStorage.getItem('userPhone');
    const savedLoan = localStorage.getItem('selectedLoan');

    if (!savedPhone || !savedLoan) {
      navigate('/');
      return;
    }

    setPhone(savedPhone);
    setLoan(JSON.parse(savedLoan));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentPhone || paymentPhone.length < 10) {
      alert('Please enter a valid M-Pesa phone number');
      return;
    }

    // Save all application data
    const data = {
      fullName,
      idNumber,
      county,
      reason,
      paymentPhone,
      verifiedPhone: phone,
      loan: loan,
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem('applicationData', JSON.stringify(data));
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('selectedLoan', JSON.stringify(loan));

    setApplicationData(data);
    setIsProcessing(true);

    try {
      const reference = `mml_${Date.now()}`;

      // 1. Initiate STK Push
      const response = await fetch('/api/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: paymentPhone,
          amount: loan.fee,
          reference: reference,
          description: `Mpesa Mobile Loans - ${loan.name} Access Fee`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 2. Start polling
        pollTransactionStatus(result.transactionId || reference);
      } else {
        setIsProcessing(false);
        setShowFailedModal(true);
        console.error(result.error);
      }
    } catch (error) {
      console.error('STK Push error:', error);
      setIsProcessing(false);
      setShowFailedModal(true);
    }
  };

  const pollTransactionStatus = (reference) => {
    let attempts = 0;
    const maxAttempts = 20; // ~60 seconds

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`/api/paylor-status?reference=${reference}`);
        const data = await res.json();

        if (!data.success) return;

        const status = (data.status || '').toUpperCase();

        if (status === 'COMPLETED' || status === 'CONFIRMED' || status === 'SUCCESS') {
          clearInterval(interval);
          setIsProcessing(false);
          setShowSuccessModal(true);
        } 
        else if (status === 'FAILED' || status === 'CANCELLED' || status === 'DECLINED') {
          clearInterval(interval);
          setIsProcessing(false);
          setShowFailedModal(true);
        }

        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsProcessing(false);
          setShowFailedModal(true);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  };

  if (!loan) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl relative">
        
        {/* Header */}
        <div className="bg-mpesa-500 px-5 py-6 text-white">
          <h1 className="text-xl font-bold">Loan Application</h1>
          <p className="text-sm text-mpesa-100 mt-1">Complete your application</p>
        </div>

        <div className="p-5">
          {/* Selected Loan Card */}
          <div className="bg-mpesa-50 border border-mpesa-100 rounded-2xl p-5 mb-6">
            <p className="text-xs text-mpesa-700 font-medium mb-1">Selected Package</p>
            <h2 className="text-2xl font-bold text-dark-900">{loan.name}</h2>
            <p className="text-lg font-semibold text-mpesa-600 mt-1">
              KSh {loan.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Access Fee: <span className="font-medium text-dark-900">KSh {loan.fee.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Verified Contact: <span className="font-medium text-dark-900">{phone}</span>
            </p>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Names */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Full Names (as on ID)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full names as on national ID"
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-mpesa-500"
                style={{ borderRadius: '2px' }}
              />
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                ID Number
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Enter your national ID number"
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-mpesa-500"
                style={{ borderRadius: '2px' }}
              />
            </div>

            {/* County */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                County
              </label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-mpesa-500 bg-white"
                style={{ borderRadius: '2px' }}
              >
                <option value="">Select your county</option>
                {counties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Reason for Loan
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-mpesa-500 bg-white"
                style={{ borderRadius: '2px' }}
              >
                <option value="">Select a reason</option>
                {reasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Phone Number */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Phone Number (to pay Access Fee)
              </label>
              <input
                type="tel"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-mpesa-500"
                style={{ borderRadius: '2px' }}
              />
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-mpesa-500 active:bg-mpesa-600 text-white font-semibold py-3.5 text-sm mt-4 mb-12 disabled:opacity-70"
              style={{ borderRadius: '2px' }}
            >
              {isProcessing ? 'Processing Payment...' : `Pay KSh ${loan.fee.toLocaleString()} & Submit`}
            </button>
          </form>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center max-w-xs w-full mx-4">
              <FaSpinner className="text-4xl text-mpesa-500 animate-spin mb-4" />
              <p className="text-sm font-semibold text-dark-900">Processing Payment</p>
              <p className="mt-2 text-xs text-gray-500 text-center">
                STK Push sent. Please check your phone and enter your M-Pesa PIN.
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS MODAL */}
        {showSuccessModal && applicationData && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden">
              
              {/* Success Header */}
              <div className="bg-mpesa-500 px-6 pt-8 pb-6 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-white text-4xl" />
                </div>
                <h2 className="text-2xl font-bold">Payment Successful!</h2>
                <p className="text-mpesa-100 text-sm mt-1">Your loan application has been submitted</p>
              </div>

              {/* Details */}
              <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
                
                {/* Loan Package */}
                <div className="bg-mpesa-50 rounded-xl p-4">
                  <p className="text-xs text-mpesa-700 font-medium mb-1">Approved Package</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-dark-900">{applicationData.loan.name}</h3>
                      <p className="text-sm text-gray-500">Access Fee Paid</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-mpesa-600">
                        KSh {applicationData.loan.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Fee: KSh {applicationData.loan.fee.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-dark-900 border-b border-gray-100 pb-2">
                    Applicant Details
                  </h4>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Full Name</span>
                    <span className="font-medium text-dark-900 text-right max-w-[60%]">
                      {applicationData.fullName}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ID Number</span>
                    <span className="font-medium text-dark-900">{applicationData.idNumber}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">County</span>
                    <span className="font-medium text-dark-900">{applicationData.county}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reason</span>
                    <span className="font-medium text-dark-900 text-right max-w-[60%]">
                      {applicationData.reason}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Verified Phone</span>
                    <span className="font-medium text-dark-900">{applicationData.verifiedPhone}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Phone</span>
                    <span className="font-medium text-dark-900">{applicationData.paymentPhone}</span>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    Your loan is being processed. You will receive an M-Pesa confirmation shortly. 
                    Funds are usually disbursed within 60 seconds after final approval.
                  </p>
                </div>
              </div>

              {/* Footer Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/');
                  }}
                  className="w-full bg-mpesa-500 active:bg-mpesa-600 text-white font-semibold py-3.5 text-sm"
                  style={{ borderRadius: '2px' }}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAILED / CANCELLED MODAL */}
        {showFailedModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-8 text-center">
              <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-5" />
              <h3 className="text-xl font-bold text-dark-900 mb-2">Payment Failed</h3>
              <p className="text-sm text-gray-600 mb-6">
                The transaction was cancelled or failed. Please try again.
              </p>
              <button
                onClick={() => setShowFailedModal(false)}
                className="w-full bg-mpesa-500 active:bg-mpesa-600 text-white font-semibold py-3.5 text-sm"
                style={{ borderRadius: '2px' }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Application;