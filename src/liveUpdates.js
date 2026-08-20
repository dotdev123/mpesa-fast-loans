import React, { useState, useEffect } from 'react';
import logo from './assets/logo.jpg';

const packageAmounts = {
  Basic: 3000,
  Starter: 5000,
  Lite: 8000,
  Standard: 10000,
  Bronze: 15000,
  Silver: 20000,
  Gold: 25000,
  Platinum: 30000,
  Pro: 40000,
  Elite: 50000,
  Ultra: 60000,
  Ultimate: 80000,
};

const liveData = [
  { name: 'Brian Kipchoge', phone: '07XXXX6987', package: 'Gold', time: '2 mins ago', region: 'Uasin Gishu' },
  { name: 'Faith Wanjiku', phone: '01XXXX0954', package: 'Lite', time: '45 secs ago', region: 'Kiambu' },
  { name: 'Dennis Otieno', phone: '07XXXX3210', package: 'Platinum', time: '8 mins ago', region: 'Kisumu' },
  { name: 'Amina Hassan', phone: '07XXXX8841', package: 'Starter', time: '1 min ago', region: 'Mombasa' },
  { name: 'Peter Kamau', phone: '01XXXX4523', package: 'Elite', time: '12 mins ago', region: 'Nairobi' },
  { name: 'Grace Achieng', phone: '07XXXX6672', package: 'Silver', time: '3 mins ago', region: 'Homa Bay' },
  { name: 'Joseph Mutua', phone: '07XXXX1198', package: 'Pro', time: '15 mins ago', region: 'Machakos' },
  { name: 'Halima Mohamed', phone: '01XXXX7734', package: 'Basic', time: '30 secs ago', region: 'Garissa' },
  { name: 'Kevin Njoroge', phone: '07XXXX5509', package: 'Ultimate', time: '6 mins ago', region: 'Nyeri' },
  { name: 'Mercy Chebet', phone: '07XXXX2245', package: 'Bronze', time: '9 mins ago', region: 'Baringo' },
  { name: 'Samuel Omondi', phone: '01XXXX3387', package: 'Gold', time: '4 mins ago', region: 'Siaya' },
  { name: 'Lucy Njeri', phone: '07XXXX9012', package: 'Lite', time: '18 mins ago', region: 'Murang\'a' },
  { name: 'Ibrahim Abdi', phone: '07XXXX4678', package: 'Standard', time: '1 min ago', region: 'Wajir' },
  { name: 'Ann Wambui', phone: '01XXXX8123', package: 'Platinum', time: '7 mins ago', region: 'Nakuru' },
  { name: 'Daniel Kiprono', phone: '07XXXX3456', package: 'Ultra', time: '11 mins ago', region: 'Nandi' },
  { name: 'Zainab Ali', phone: '07XXXX7890', package: 'Starter', time: '20 secs ago', region: 'Lamu' },
  { name: 'George Maina', phone: '01XXXX2345', package: 'Elite', time: '14 mins ago', region: 'Nyandarua' },
  { name: 'Esther Akinyi', phone: '07XXXX6789', package: 'Silver', time: '5 mins ago', region: 'Kisii' },
  { name: 'Mohamed Yusuf', phone: '07XXXX0123', package: 'Pro', time: '16 mins ago', region: 'Mandera' },
  { name: 'Catherine Muthoni', phone: '01XXXX4567', package: 'Gold', time: '2 mins ago', region: 'Embu' },
  { name: 'Eric Barasa', phone: '07XXXX8901', package: 'Bronze', time: '10 mins ago', region: 'Bungoma' },
  { name: 'Fatuma Omar', phone: '07XXXX2345', package: 'Lite', time: '40 secs ago', region: 'Kilifi' },
  { name: 'James Kariuki', phone: '01XXXX6789', package: 'Ultimate', time: '13 mins ago', region: 'Kirinyaga' },
  { name: 'Joyce Chepkoech', phone: '07XXXX0124', package: 'Standard', time: '3 mins ago', region: 'Kericho' },
  { name: 'Ali Hassan', phone: '07XXXX5678', package: 'Platinum', time: '17 mins ago', region: 'Tana River' },
  { name: 'Susan Atieno', phone: '01XXXX9012', package: 'Silver', time: '8 mins ago', region: 'Migori' },
  { name: 'Patrick Mwangi', phone: '07XXXX3457', package: 'Elite', time: '1 min ago', region: 'Laikipia' },
  { name: 'Aisha Juma', phone: '07XXXX7891', package: 'Basic', time: '19 mins ago', region: 'Kwale' },
  { name: 'David Kiptoo', phone: '01XXXX1234', package: 'Pro', time: '6 mins ago', region: 'Elgeyo-Marakwet' },
  { name: 'Ruth Nyambura', phone: '07XXXX5679', package: 'Gold', time: '4 mins ago', region: 'Tharaka-Nithi' },
];

function LiveUpdates() {
  const [, setCurrentIndex] = useState(0);   // ← fixed (removed unused variable)
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    setVisibleItems(liveData.slice(0, 2));

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % liveData.length;
        const items = [];
        for (let i = 0; i < 2; i++) {
          items.push(liveData[(next + i) % liveData.length]);
        }
        setVisibleItems(items);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <img 
          src={logo} 
          alt="Logo" 
          className="w-6 h-6 object-contain rounded"
        />
        <div>
          <h3 className="text-sm font-bold text-dark-900">Live Boosted Fuliza Limits</h3>
          <p className="text-[11px] text-gray-500">Real-time fuliza increments across Kenya</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[11px] text-green-600 font-medium">Live</span>
        </div>
      </div>

      {/* Live Updates List */}
      <div className="space-y-2.5">
        {visibleItems.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm flex items-center gap-3 transition-all duration-500"
          >
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-mpesa-100 flex items-center justify-center flex-shrink-0">
              <span className="text-mpesa-700 font-bold text-sm">
                {item.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-dark-900 truncate">
                  {item.name}
                </p>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {item.time}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-0.5">
                {item.phone} • {item.region}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] bg-mpesa-50 text-mpesa-700 font-medium px-2 py-0.5 rounded-full">
                  {item.package} • KSh {packageAmounts[item.package]?.toLocaleString()}
                </span>
                <span className="text-[11px] text-green-600 font-medium">
                  Boosted
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-center text-gray-400 mt-4">
        Showing recent successful fuliza boosts • Updated live
      </p>
    </div>
  );
}

export default LiveUpdates;