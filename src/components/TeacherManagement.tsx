import React, { useState } from 'react';
import { User, EvaluationVisit } from '../types';
import { storage } from '../services/storage';
import {
  UserPlus,
  Users,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Search,
  School,
  Sparkles,
  ClipboardCheck,
  AlertCircle,
  PlusCircle,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

interface Props {
  users: User[];
  evaluations: EvaluationVisit[];
  onRefresh: () => void;
  onStartEvaluationForTeacher: (teacherName: string) => void;
  lang: 'fr' | 'ar' | 'en';
}

export const TeacherManagement: React.FC<Props> = ({
  users,
  evaluations,
  onRefresh,
  onStartEvaluationForTeacher,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Teacher Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Mathématiques (Collège)');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [recentlyCreated, setRecentlyCreated] = useState<User | null>(null);

  const teachers = users.filter(u => u.role === 'teacher');

  const filteredTeachers = teachers.filter(t => {
    const term = searchTerm.toLowerCase();
    return (
      t.username.toLowerCase().includes(term) ||
      (t.fullName && t.fullName.toLowerCase().includes(term)) ||
      (t.department && t.department.toLowerCase().includes(term)) ||
      t.email.toLowerCase().includes(term)
    );
  });

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!username.trim()) {
      setFormError('Le nom d\'utilisateur (login) est obligatoire.');
      return;
    }

    if (!password.trim()) {
      setFormError('Le mot de passe est obligatoire.');
      return;
    }

    const res = storage.addUser({
      username: username.trim(),
      password: password.trim(),
      fullName: fullName.trim() || `Prof. ${username.trim()}`,
      department: department.trim(),
      email: email.trim() || `${username.trim().toLowerCase()}@ecole-alkawthar.edu`,
      role: 'teacher',
    });

    if (!res.success || !res.user) {
      setFormError(res.error || 'Erreur lors de la création du compte.');
      return;
    }

    setRecentlyCreated(res.user);
    setShowAddForm(false);
    setFullName('');
    setUsername('');
    setPassword('');
    setEmail('');
    onRefresh();
  };

  const handleDeleteTeacher = (teacher: User) => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le compte enseignant de "${teacher.fullName || teacher.username}" ?`
    );
    if (!confirmDelete) return;

    storage.deleteUser(teacher.id);
    onRefresh();
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCredentials = (teacher: User) => {
    const text = `École Internationale Alkawthar - Espace Enseignant\nIdentifiant / Login: ${teacher.username}\nMot de passe: ${teacher.password || '123456'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(teacher.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const departmentsList = [
    'Mathématiques (Collège)',
    'Mathématiques (Lycée)',
    'Physique-Chimie (Lycée)',
    'Sciences de la Vie et de la Terre (Collège)',
    'Sciences de la Vie et de la Terre (Lycée)',
    'Français & Lettres (Cycle 3)',
    'Français & Langues (Collège)',
    'Langue Arabe & Éducation Islamique',
    'Langue Anglaise',
    'Histoire-Géographie',
    'Cycle Primaire (Élémentaire)',
    'Maternelle & Petite Enfance',
    'Arts Plastiques & Musique',
    'Éducation Physique et Sportive',
    'Informatique & Technologie',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Administration Mohamed • Gestion des Enseignants & Accès</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'ar' ? 'إدارة وتعيين المعلمين وحسابات الدخول' : 'Gestion des Enseignants & Comptes d\'Accès'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
              {lang === 'ar'
                ? 'أضف معلمين جدد وعيّن لهم اسم مستخدم وكلمة مرور. سيتصل كل معلم بحسابه فقط للاطلاع على درجاته وملاحظاته وطباعة تقريره.'
                : 'Ajoutez de nouveaux enseignants avec leur identifiant (login) et mot de passe. Chaque enseignant doit se connecter via la page d\'accès pour consulter ses notes, ses synthèses et imprimer ses copies.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setShowAddForm(true);
                setRecentlyCreated(null);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-blue-700/20 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة معلم جديد' : 'Ajouter un Enseignant'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recently Created Credentials Notification */}
      {recentlyCreated && (
        <div className="bg-emerald-50 border-2 border-emerald-400/80 rounded-3xl p-5 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
              <ClipboardCheck className="w-5 h-5 text-emerald-600" />
              <span>Compte Enseignant créé avec succès ! Transmettez ces accès à l'enseignant :</span>
            </div>
            <button
              onClick={() => setRecentlyCreated(null)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
            >
              Fermer
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-extrabold text-slate-900">
                {recentlyCreated.fullName} ({recentlyCreated.department})
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-800">
                  Login : <b>{recentlyCreated.username}</b>
                </span>
                <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-800">
                  Mot de passe : <b>{recentlyCreated.password}</b>
                </span>
                <span className="text-slate-500 font-sans">
                  Email : {recentlyCreated.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleCopyCredentials(recentlyCreated)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
            >
              {copiedId === recentlyCreated.id ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Identifiants copiés !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copier les accès</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Add Teacher Modal / Form */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border border-blue-200 p-6 sm:p-8 shadow-lg space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {lang === 'ar' ? 'إنشاء حساب معلم جديد مع كلمة مرور' : 'Création d\'un Nouveau Compte Enseignant'}
                </h3>
                <p className="text-xs text-slate-500">
                  Définissez son nom d'utilisateur et son mot de passe pour qu'il puisse se connecter à son espace personnel.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Annuler
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleAddTeacher} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Nom complet de l'enseignant *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ex : M. Ahmed Ben Ali, Mme Salma Mansour..."
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-blue-600 focus:outline-hidden bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Identifiant / Login de connexion *
              </label>
              <input
                type="text"
                value={username}
                onChange={e => {
                  setUsername(e.target.value.replace(/\s+/g, ''));
                  if (!email && e.target.value) {
                    setEmail(`${e.target.value.toLowerCase().replace(/\s+/g, '')}@ecole-alkawthar.edu`);
                  }
                }}
                placeholder="Ex : Ahmed, Salma, Mansour..."
                required
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-blue-600 focus:outline-hidden bg-slate-50/50 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                C'est l'identifiant que l'enseignant saisira sur la page d'accueil.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">
                  Mot de passe de connexion *
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>Générer aléatoirement</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ex : Ahmed@2026 ou 123456"
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-blue-600 focus:outline-hidden bg-slate-50/50 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Visible uniquement par l'admin Mohamed et l'enseignant.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Discipline / Département pédagogique *
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-blue-600 focus:outline-hidden bg-slate-50/50"
              >
                {departmentsList.map(dep => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1.5">
                Adresse e-mail académique
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ex : ahmed@ecole-alkawthar.edu"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-blue-600 focus:outline-hidden bg-slate-50/50"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-700/20 transition cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Créer et activer le compte</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teachers Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Enseignants Inscrits ({teachers.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, login, matière..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTeachers.map(teacher => {
            const teacherEvaluations = evaluations.filter(
              e =>
                e.teacherName.toLowerCase() === teacher.username.toLowerCase() ||
                e.teacherId === teacher.id
            );

            const isPassVisible = visiblePasswords[teacher.id] || false;

            return (
              <div
                key={teacher.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {teacher.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {teacher.fullName || `Prof. ${teacher.username}`}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {teacher.department || 'Enseignement'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {teacher.email}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {teacherEvaluations.length} visite(s)
                  </span>
                </div>

                {/* Login & Password Credentials Box */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-500 text-[11px]">Identifiant (Login) :</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {teacher.username}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-500 text-[11px]">Mot de passe :</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {isPassVisible ? teacher.password || '123456' : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(teacher.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition cursor-pointer"
                        title={isPassVisible ? 'Masquer' : 'Afficher le mot de passe'}
                      >
                        {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(teacher)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                    title="Copier le login et mot de passe à envoyer à l'enseignant"
                  >
                    {copiedId === teacher.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copier accès</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onStartEvaluationForTeacher(teacher.username)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                      title="Lancer une visite d'évaluation en classe pour cet enseignant"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Évaluer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTeacher(teacher)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer"
                      title="Supprimer ce compte enseignant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
