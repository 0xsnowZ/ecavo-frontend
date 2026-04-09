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

  return (
    <div className="flex items-center gap-2 mt-2">
      {[
        { val: timeLeft.days, label: t('products.days') },
        { val: timeLeft.hours, label: t('products.hours') },
        { val: timeLeft.mins, label: t('products.mins') },
        { val: timeLeft.sec, label: t('products.sec') },
      ].map(({ val, label }, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="bg-secondary text-white text-sm font-bold w-10 h-10 flex items-center justify-center rounded-lg">
            {String(val ?? 0).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-muted mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  );
}
