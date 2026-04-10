import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CountdownTimer({ targetDate }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, sec: 0 });

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        sec: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return null;
}
