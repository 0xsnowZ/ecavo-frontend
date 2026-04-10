import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');

  const from = location.state?.from || '/';

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    if (!form.password) errs.password = isAr ? 'كلمة المرور مطلوبة'      : 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await authService.login(form);
      setAuth(res.data.user, res.data.token);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message
        || (isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-black text-secondary">
              E<span className="text-primary">CAVO</span>
            </Link>
            <h1 className="text-xl font-bold text-dark mt-2">{t('auth.login')}</h1>
            <p className="text-sm text-muted mt-1">
              {isAr ? 'مرحباً بعودتك! سجّل دخولك للمتابعة.' : 'Welcome back! Sign in to continue.'}
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 animate-fade-in">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="example@ecavo.com"
                  className={`input-field ps-9 ${errors.email ? 'border-red-400 focus:ring-red-300' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-dark">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  {t('auth.forgot')}
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  className={`input-field ps-9 pe-10 ${errors.password ? 'border-red-400 focus:ring-red-300' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : t('auth.login')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google (placeholder) */}
          <button className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-lg py-2.5 text-sm font-semibold text-dark hover:bg-gray-50 transition-colors">
            <img src="/src/assets/img/google.png" alt="Google" className="w-5 h-5 object-contain" />
            {t('auth.google')}
          </button>

          {/* Switch to Register */}
          <p className="text-center text-sm text-muted mt-6">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
