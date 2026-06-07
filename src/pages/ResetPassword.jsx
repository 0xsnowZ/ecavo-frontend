import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../services';

export default function ResetPassword() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    password: '',
    password_confirmation: ''
  });
  
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!form.token) {
      toast.error(isAr ? 'رابط استعادة كلمة المرور غير صالح.' : 'Invalid password reset link.');
      navigate('/login');
    }
  }, [form.token, isAr, navigate]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.password) errs.password = isAr ? 'كلمة المرور مطلوبة' : 'Password is required';
    else if (form.password.length < 8) errs.password = isAr ? 'يجب أن تتكون من 8 أحرف على الأقل' : 'Must be at least 8 characters';
    
    if (form.password !== form.password_confirmation) {
      errs.password_confirmation = isAr ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await authService.resetPassword(form);
      toast.success(res.data?.message || (isAr ? 'تم تغيير كلمة المرور بنجاح!' : 'Password reset successfully!'));
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || (isAr ? 'حدث خطأ. يرجى المحاولة لاحقاً.' : 'An error occurred. Please try again.');
      toast.error(msg);
      
      // If there are validation errors from Laravel
      if (err.response?.data?.errors) {
        const backendErrors = {};
        for (const [key, val] of Object.entries(err.response.data.errors)) {
          backendErrors[key] = val[0];
        }
        setErrors(backendErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-black text-secondary">
              E<span className="text-primary">CAVO</span>
            </Link>
            <h1 className="text-xl font-bold text-dark mt-2">
              {isAr ? 'تعيين كلمة مرور جديدة' : 'Create New Password'}
            </h1>
            <p className="text-sm text-muted mt-1">
              {isAr 
                ? 'الرجاء إدخال كلمة المرور الجديدة لحسابك.' 
                : 'Please enter a new password for your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
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

            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">
                {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password_confirmation}
                  onChange={e => set('password_confirmation', e.target.value)}
                  placeholder="••••••••"
                  className={`input-field ps-9 pe-10 ${errors.password_confirmation ? 'border-red-400 focus:ring-red-300' : ''}`}
                />
              </div>
              {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (isAr ? 'حفظ كلمة المرور' : 'Save Password')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
