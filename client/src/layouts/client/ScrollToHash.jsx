
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToHash = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // delay 0 để chắc chắn DOM đã render
      setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    } else {
      // nếu không có hash thì scroll lên đầu trang
      window.scrollTo({ top: 2, behavior: 'smooth' });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToHash;
