// File: src/hooks/useCountdown.js
import { useState, useEffect } from 'react';

export const useCountdown = (endTime) => {
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Nếu không có thời gian kết thúc, coi như đã hết hạn
    if (!endTime) {
      setIsExpired(true);
      return;
    }

    const targetDate = new Date(endTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // Khi thời gian chạy về 0 (hoặc số âm)
      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        setIsExpired(true);
        return;
      }

      // Tính toán Giờ, Phút, Giây
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      });
      setIsExpired(false);

    }, 1000);

    // Cleanup function để tránh rò rỉ bộ nhớ (memory leak) khi component unmount
    return () => clearInterval(interval);
  }, [endTime]);

  return { ...timeLeft, isExpired };
};