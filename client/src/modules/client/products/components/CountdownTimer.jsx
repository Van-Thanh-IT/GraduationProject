// import React, { useState, useEffect } from 'react';

// export default function CountdownTimer({ endTime }) {
//   const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const difference = new Date(endTime).getTime() - new Date().getTime();
      
//       if (difference <= 0) {
//         clearInterval(timer);
//         setTimeLeft({ h: '00', m: '00', s: '00' });
//       } else {
//         const h = Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
//         const m = Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0');
//         const s = Math.floor((difference / 1000) % 60).toString().padStart(2, '0');
//         setTimeLeft({ h, m, s });
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [endTime]);

//   return (
//     <div className="flex items-center gap-1 mt-2">
//       <span className="bg-gray-900 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
//         {timeLeft.h}
//       </span>
//       <span className="text-gray-900 font-bold text-xs animate-pulse">:</span>
//       <span className="bg-gray-900 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
//         {timeLeft.m}
//       </span>
//       <span className="text-gray-900 font-bold text-xs animate-pulse">:</span>
//       <span className="bg-gray-900 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
//         {timeLeft.s}
//       </span>
//     </div>
//   );
// }