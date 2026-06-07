import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../services';

export default function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError(isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }
    
    setError('');
    setLoading(true);
    
    // Call actual API
    try {
      await authService.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 
        (isAr ? 'حدث خطأ. يرجى المحاولة لاحقاً.' : 'An error occurred. Please try again.')
      );
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
              {isAr ? 'استعادة كلمة المرور' : 'Reset Password'}
            </h1>
            <p className="text-sm text-muted mt-1">
              {isAr 
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.' 
                : 'Enter your email and we will send you a link to reset your password.'}
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Mail size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark">
                  {isAr ? 'تحقق من بريدك الإلكتروني' : 'Check your email'}
                </h3>
                <p className="text-muted text-sm mt-2">
                  {isAr 
                    ? 'لقد أرسلنا تعليمات استعادة كلمة المرور إلى' 
                    : 'We have sent password recovery instructions to'}{' '}
                  <span className="font-medium text-dark">{email}</span>
                </p>
              </div>
              <Link 
                to="/login"
                className="btn-primary w-full justify-center mt-4"
              >
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">
                  {t('auth.email', 'Email')}
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="example@ecavo.com"
                    className={`input-field ps-9 ${error ? 'border-red-400 focus:ring-red-300' : ''}`}
                    dir="ltr"
                  />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 mt-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (isAr ? 'إرسال رابط الاستعادة' : 'Send Reset Link')}
              </button>

              <div className="text-center pt-4">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                  <ArrowLeft size={16} className={isAr ? "rotate-180" : ""} />
                  {isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
