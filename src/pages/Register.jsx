import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, User, Phone, Loader2 } from 'lucide-react';
import { authService } from '../services';
import { useAuthStore } from '../store/useAuthStore';

export default function Register() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [form, setForm]        = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [errors, setErrors]    = useState({});
  const [apiError, setApiError] = useState('');

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name)     errs.name     = isAr ? 'الاسم مطلوب' : 'Name is required';
    if (!form.email)    errs.email    = isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    if (!form.password) errs.password = isAr ? 'كلمة المرور مطلوبة' : 'Password is required';
    if (form.password.length < 8) errs.password = isAr ? 'كلمة المرور 8 أحرف على الأقل' : 'Minimum 8 characters';
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await authService.register(form);
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        // Laravel validation errors
        const fieldErrors = {};
        Object.entries(data.errors).forEach(([field, msgs]) => {
          fieldErrors[field] = msgs[0];
        });
        setErrors(fieldErrors);
      } else {
        setApiError(data?.message || (isAr ? 'حدث خطأ' : 'An error occurred'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',                  label: t('auth.name'),             icon: User,  type: 'text',     placeholder: isAr ? 'محمد أحمد' : 'John Doe' },
    { key: 'email',                 label: t('auth.email'),            icon: Mail,  type: 'email',    placeholder: 'example@ecavo.com' },
    { key: 'phone',                 label: isAr ? 'رقم الهاتف' : 'Phone', icon: Phone, type: 'tel', placeholder: '+20 100 000 0000' },
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-black text-secondary">
              E<span className="text-primary">CAVO</span>
            </Link>
            <h1 className="text-xl font-bold text-dark mt-2">{t('auth.register')}</h1>
            <p className="text-sm text-muted mt-1">
              {isAr ? 'أنشئ حسابك وابدأ التسوق.' : 'Create your account and start shopping.'}
            </p>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 animate-fade-in">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-dark mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className={`input-field ps-9 ${errors[key] ? 'border-red-400 focus:ring-red-300' : ''}`}
                  />
                </div>
                {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  className={`input-field ps-9 pe-10 ${errors.password ? 'border-red-400 focus:ring-red-300' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">{t('auth.confirm_password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={e => set('password_confirmation', e.target.value)}
                  placeholder="••••••••"
                  className={`input-field ps-9 ${errors.password_confirmation ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.password_confirmation && (
                <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : t('auth.register')}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            {t('auth.has_account')}{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
