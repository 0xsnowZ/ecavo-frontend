import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CountdownTimer({ targetDate }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calc = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

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

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-2 py-1 mt-1 justify-center">
      <span>{String(timeLeft.days).padStart(2, '0')}{isAr ? 'ي' : 'd'}</span>:
      <span>{String(timeLeft.hours).padStart(2, '0')}{isAr ? 'س' : 'h'}</span>:
      <span>{String(timeLeft.mins).padStart(2, '0')}{isAr ? 'د' : 'm'}</span>:
      <span>{String(timeLeft.sec).padStart(2, '0')}{isAr ? 'ث' : 's'}</span>
    </div>
  );
}
