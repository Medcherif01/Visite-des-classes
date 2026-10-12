import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import {
  GraduationCap,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileCode,
  WifiOff,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  onLoginSuccess: (user: User) => void;
  lang: 'fr' | 'ar' | 'en';
  onSetLang: (lang: 'fr' | 'ar' | 'en') => void;
}

export const LoginPage: React.FC<Props> = ({
  onLoginSuccess,
  lang,
  onSetLang,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const users = storage.getUsers();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError(
        lang === 'ar'
          ? 'يرجى إدخال اسم المستخدم أو البريد.'
          : 'Veuillez saisir votre identifiant.'
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = storage.authenticate(username, password);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(
          lang === 'ar'
            ? 'اسم المستخدم أو كلمة المرور غير صحيحة.'
            : lang === 'en'
            ? 'Invalid username or password.'
            : 'Identifiant ou mot de passe incorrect. Vérifiez vos accès ou sélectionnez un compte de démonstration.'
        );
      }
    }, 250);
  };

  const handleQuickLogin = (user: User) => {
    setUsername(user.username);
    setPassword(user.password || user.username);
    const res = storage.authenticate(user.username, user.password || user.username);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  // Group demo accounts
  const adminMohamed = users.find(u => u.username.toLowerCase() === 'mohamed') || {
    id: 'user-admin-mohamed',
    username: 'Mohamed',
    password: 'Mohamed@86',
    fullName: 'M. Mohamed Cherif',
    role: 'admin' as const,
    email: 'mohamed.cherif@ecole-alkawthar.edu',
    department: 'Direction Pédagogique & Inspection',
  };
  const coordinators = users.filter(u => u.role === 'coordinator');
  const teachers = users.filter(u => u.role === 'teacher');
  const admin = users.find(u => u.role === 'admin' && u.username.toLowerCase() !== 'mohamed');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-slate-900 leading-tight">
              EduVisite
            </div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'ar' ? 'المدرسة الدولية الكوثر' : 'École Internationale Alkawthar'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <PWAInstallButton lang={lang} />

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => onSetLang('fr')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                lang === 'fr' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => onSetLang('ar')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                lang === 'ar' ? 'bg-white text-blue-700 shadow-xs font-arabic' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => onSetLang('en')}
              className={`px-2 py-1 rounded-md transition cursor-pointer ${
                lang === 'en' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Hero & Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Left / Top Context Presentation Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portail Pédagogique Sécurisé</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                {lang === 'ar'
                  ? 'منظومة تقييم ومتابعة زيارات الفصول الدراسية'
                  : 'Évaluation & Suivi des Visites de Classe'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lang === 'ar'
                  ? 'منصة رسمية تتيح للمنسقين إجراء التقييم الميداني، وللمعلمين مراجعة درجاتهم وملاحظاتهم وطباعة تقاريرهم الرسمية.'
                  : 'Plateforme officielle dédiée aux coordinateurs pédagogiques et aux enseignants pour le suivi des observations de classe et l\'archivage des rapports.'}
              </p>

              <div className="space-y-3 pt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <b>Espace Enseignant :</b> consultation des notes, commentaires et impression directe A4.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    <b>Session permanente :</b> restez connecté en continu jusqu'à déconnexion manuelle.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>
                    <b>Gemini AI :</b> synthèse diagnostique et conseils didactiques sur-mesure.
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <b>100% Hors Ligne :</b> saisie et consultation fluides sans connexion requise.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              École Internationale Alkawthar • Année Académique 2026-2027
            </div>
          </div>

          {/* Right Login Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'ar' ? 'تسجيل الدخول إلى حسابك' : 'Connexion à votre Espace'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'ar'
                  ? 'أدخل اسم المستخدم وكلمة المرور للمتابعة. ستبقى جلستك مفعلة بشكل دائم.'
                  : 'Saisissez vos identifiants. Votre session restera active en permanence sauf si vous cliquez sur Déconnexion.'}
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {lang === 'ar' ? 'اسم المستخدم أو البريد' : 'Identifiant / Nom d\'utilisateur'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Ex: Morched, Amal, Mohamed, Zohra, Admin..."
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {lang === 'ar' ? 'كلمة المرور' : 'Mot de passe'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>
                    {lang === 'ar' ? 'البقاء متصلاً دائماً' : 'Maintenir la session permanente'}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-700/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? lang === 'ar'
                      ? 'جاري التحقق...'
                      : 'Authentification en cours...'
                    : lang === 'ar'
                    ? 'دخول النظام'
                    : 'Accéder à mon Espace'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Access Pills */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  {lang === 'ar' ? 'حسابات العرض التوضيحي (مع كلمات المرور) :' : 'Comptes de démonstration (Identifiants & Mots de passe) :'}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                  Mot de passe universel test : <code className="font-bold text-slate-700">123456</code>
                </span>
              </div>

              {/* Admin Mohamed (Principal Administrator) */}
              <div>
                <span className="text-[10px] font-bold text-blue-900 uppercase block mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                  <span>Administrateur Principal (Ajout d'enseignants & Visites) :</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickLogin(adminMohamed)}
                  className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 hover:from-blue-100 hover:to-indigo-100 text-blue-950 border-2 border-blue-300 transition cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-xs sm:text-sm text-blue-950 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>Admin Mohamed (M. Mohamed Cherif)</span>
                      <span className="text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded-full font-bold">
                        Admin
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-800 font-mono flex flex-wrap gap-x-3">
                      <span>login : <b className="text-slate-950">Mohamed</b></span>
                      <span>•</span>
                      <span>mot de passe : <b className="text-slate-950">Mohamed@86</b></span>
                    </div>
                    <div className="text-[10px] text-blue-700/80">
                      Ajout d'enseignants avec login/mot de passe • Visites en direct • Grilles personnalisables
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                    Connexion Admin ➜
                  </span>
                </button>
              </div>

              {/* Teachers */}
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>Enseignants (Accès direct à leurs notes, commentaires & impression) :</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {teachers.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleQuickLogin(t)}
                      className="text-left px-2.5 py-1.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/80 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-bold text-xs group-hover:text-emerald-950 flex items-center gap-1">
                          <span>Prof. {t.username}</span>
                          <span className="text-[10px] text-emerald-600 font-normal">({t.fullName?.split(' ')[1] || t.username})</span>
                        </div>
                        <div className="text-[10px] text-emerald-700/80 font-mono">
                          login: <b>{t.username}</b> • pass: <b>{t.password || '123456'}</b>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-white text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        Entrer ➜
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Coordinators */}
              {coordinators.filter(c => c.username.toLowerCase() !== 'mohamed').length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Autres Coordinateurs Pédagogiques :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {coordinators.filter(c => c.username.toLowerCase() !== 'mohamed').slice(0, 3).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleQuickLogin(c)}
                        className="text-left px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
                      >
                        Coord. {c.username} ({c.password || '123456'})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
        EduVisite v2.4 • Système d'Évaluation Pédagogique et d'Observation de Classe • Prêt pour le mode déconnecté
      </footer>
    </div>
  );
};
