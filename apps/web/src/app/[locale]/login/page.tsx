import { getTranslations } from 'next-intl/server';
import { signIn } from '@/auth';

export default async function LoginPage() {
  const t = await getTranslations('Auth');

  // Next.js Server Action
  async function handleLogin(formData: FormData) {
    'use server';
    await signIn('credentials', formData);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-sm glass p-8 rounded-3xl shadow-xl shadow-brand-500/10 border border-slate-200 dark:border-slate-800">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">
            Smarketing
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">{t('login')}</p>
        </div>
        
        <form action={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('email')}
            </label>
            <input 
              type="email" 
              name="email"
              required 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white" 
            />
          </div>
          
           <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('password')}
            </label>
            <input 
              type="password" 
              name="password"
              required 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all dark:text-white" 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full mt-6 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-lg shadow-brand-500/30 transition-all font-sans"
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
