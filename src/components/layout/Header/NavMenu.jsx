import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'nav.home', to: '/' },
  {
    key: 'nav.appliances',
    to: '/categories/appliances',
    children: [
      { key: 'nav.washing_machines', to: '/products?cat=washing-machines' },
      { key: 'nav.refrigerators', to: '/products?cat=refrigerators' },
      { key: 'nav.vacuums', to: '/products?cat=vacuums' },
      { key: 'nav.ac', to: '/products?cat=ac' },
    ],
  },
  { key: 'nav.houseware', to: '/categories/houseware' },
  { key: 'nav.mobiles', to: '/categories/mobiles' },
  { key: 'nav.clothes', to: '/categories/clothes' },
  { key: 'nav.beauty', to: '/categories/beauty' },
  { key: 'nav.furniture', to: '/categories/furniture' },
];

export default function NavMenu() {
  const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => (
        <div
          key={item.key}
          className="relative group"
          onMouseEnter={() => item.children && setOpenDropdown(item.key)}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <NavLink
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200
               ${isActive
                 ? 'text-primary bg-primary/10'
                 : 'text-dark hover:text-primary hover:bg-gray-100'
               }`
            }
          >
            {t(item.key)}
            {item.children && <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />}
          </NavLink>

          {/* Dropdown */}
          {item.children && openDropdown === item.key && (
            <div className="absolute top-full start-0 mt-1 w-44 bg-white rounded-xl shadow-hover border border-border z-50 animate-slide-down">
              {item.children.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  className="block px-4 py-2.5 text-sm text-dark hover:bg-primary/5 hover:text-primary transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {t(child.key)}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
