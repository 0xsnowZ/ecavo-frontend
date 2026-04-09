import { useTranslation } from 'react-i18next';
import { Truck, RefreshCcw, Headphones, ShieldCheck, Tag } from 'lucide-react';

import feat1 from '../../assets/img/features1.png';
import feat2 from '../../assets/img/features2.png';
import feat3 from '../../assets/img/features3.png';
import feat4 from '../../assets/img/features4.png';
import feat5 from '../../assets/img/features5.png';

const FEATURES = [
  { icon: Truck, img: feat1, titleKey: 'features.free_shipping', descKey: 'features.free_shipping_desc' },
  { icon: RefreshCcw, img: feat2, titleKey: 'features.money_guarantee', descKey: 'features.money_guarantee_desc' },
  { icon: Headphones, img: feat3, titleKey: 'features.support', descKey: 'features.support_desc' },
  { icon: ShieldCheck, img: feat4, titleKey: 'features.secure_payment', descKey: 'features.secure_payment_desc' },
  { icon: Tag, img: feat5, titleKey: 'features.daily_offers', descKey: 'features.daily_offers_desc' },
];

export default function FeatureBar() {
  const { t } = useTranslation();

  return (
    <div className="bg-white border-y border-border py-4 my-4">
      <div className="container-main">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {FEATURES.map(({ img, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition-colors group"
            >
              <img
                src={img}
                alt={t(titleKey)}
                className="w-10 h-10 object-contain shrink-0 group-hover:scale-110 transition-transform"
              />
              <div>
                <h6 className="text-sm font-bold text-dark">{t(titleKey)}</h6>
                <p className="text-xs text-muted leading-snug">{t(descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
