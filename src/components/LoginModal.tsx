import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';
import { ShieldCheck, UserCheck, Lock, User as UserIcon, X, Check, Eye, EyeOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentUser: User | null;
  lang: 'fr' | 'ar' | 'en';
}

export const LoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  lang,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const users = storage.getUsers();

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = username.trim().toLowerCase();
    const found = users.find(
      u => u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed
    );

    if (found) {
      storage.setCurrentUser(found);
      onSuccess(found);
      onClose();
    } else {
      setError(
        lang === 'ar'
          ? 'اسم المستخدم أو كلمة المرور غير صحيحة.'
          : lang === 'en'
          ? 'Invalid username or password.'
          : 'Identifiants non reconnus. Veuillez utiliser un profil existant.'
      );
    }
  };

  const handleQuickSwitch = (user: User) => {
    storage.setCurrentUser(user);
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {lang === 'ar' ? 'المصادقة وتحديد الصلاحيات' : lang === 'en' ? 'Role-Based Authentication' : 'Authentification Sécurisée par Rôle'}
              </h2>
              <p className="text-xs text-slate-500 leading-tight">
                {lang === 'ar' ? 'حماية البيانات البيداغوجية والتقارير الرسمية' : lang === 'en' ? 'Protect confidential evaluation records' : 'Confidentialité des fiches et rapports officiels'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Fast Role Profile Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              {lang === 'ar' ? 'التبديل السريع بين الحسابات' : lang === 'en' ? 'Quick Profile Selection' : 'Profils de Démonstration & Rôles'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map(u => {
                const isCurrent = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSwitch(u)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'coordinator'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {u.fullName || u.username}
                        </span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {u.role === 'admin'
                          ? 'Direction / Inspecteur'
                          : u.role === 'coordinator'
                          ? 'Coordinateur Pédagogique'
                          : 'Enseignant Observé'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">
                {lang === 'ar' ? 'أو الدخول باسم مستخدم مخصص' : lang === 'en' ? 'Or login manually' : 'Ou saisie manuelle'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'اسم المستخدم أو البريد' : lang === 'en' ? 'Username or Email' : 'Identifiant / Nom d\'utilisateur'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ex: Mohamed, Zohra, Morched..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'كلمة المرور' : lang === 'en' ? 'Password' : 'Mot de passe'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : lang === 'en' ? 'Cancel' : 'Annuler'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition cursor-pointer"
              >
                {lang === 'ar' ? 'تسجيل الدخول' : lang === 'en' ? 'Sign In' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
