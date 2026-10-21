'use client';

import { useState, useEffect, useCallback } from 'react';
import { API, imgUrl } from '../../lib/config';

interface Avis {
  id: number;
  nom: string;
  ville?: string | null;
  message: string;
  photo?: string | null;
  approuve: boolean | number;
  created_at: string;
}

const CLE = 'admin_token';
const serif = 'font-[family-name:var(--font-serif)]';

const btnPrincipal =
  'px-4 py-2 rounded-full bg-[#F26B1D] hover:bg-[#D95A10] text-white text-sm font-semibold transition';
const btnContour =
  'px-4 py-2 rounded-full border border-[#D9D9D9] bg-white text-[#111111] text-sm hover:bg-[#F2F2F2] transition';
const btnDanger =
  'px-4 py-2 rounded-full border border-red-300 bg-white text-red-600 text-sm hover:bg-red-50 transition';

// ---------- Carte d'un avis ----------
function Carte({
  a, onChanger, onSupprimer,
}: {
  a: Avis;
  onChanger: (a: Avis, approuve: boolean) => void;
  onSupprimer: (a: Avis) => void;
}) {
  return (
    <article className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-5 flex flex-col sm:flex-row gap-5">
      {a.photo && (
        <img src={imgUrl(a.photo)} alt="" className="w-full sm:w-40 h-40 sm:h-32 object-cover rounded-xl shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#F26B1D]">
          {a.nom}
          {a.ville && <span className="text-[#777777] font-normal text-sm"> · {a.ville}</span>}
        </p>
        <p className="text-xs text-[#999999] mb-2">
          Reçu le {new Date(a.created_at).toLocaleDateString('fr-FR')}
        </p>
        <p className="text-sm text-[#333333] leading-relaxed whitespace-pre-line break-words">{a.message}</p>

        <div className="flex flex-wrap gap-3 mt-4">
          {a.approuve ? (
            <button
              onClick={() => onChanger(a, false)}
              title="L'avis disparaît du site mais reste ici, vous pourrez le republier"
              className={btnContour}
            >
              Retirer du site
            </button>
          ) : (
            <button
              onClick={() => onChanger(a, true)}
              title="L'avis s'affichera dans la section Témoignages du site"
              className={btnPrincipal}
            >
              Publier sur le site
            </button>
          )}
          <button
            onClick={() => onSupprimer(a)}
            title="Efface l'avis et sa photo pour toujours"
            className={btnDanger}
          >
            Supprimer
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AdminAvis() {
  const [pret, setPret] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [saisie, setSaisie] = useState('');
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [info, setInfo] = useState('');
  const [aide, setAide] = useState(true);

  // Récupère le mot de passe gardé pendant la session
  useEffect(() => {
    setToken(sessionStorage.getItem(CLE));
    setPret(true);
  }, []);

  // Fait disparaître le message de confirmation après 5 secondes
  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => setInfo(''), 5000);
    return () => clearTimeout(t);
  }, [info]);

  const appel = useCallback(
    (chemin: string, options: RequestInit = {}) =>
      fetch(`${API}/api/admin${chemin}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }),
    [token]
  );

  const charger = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErreur('');
    try {
      const res = await appel('/avis');
      if (res.status === 401) {
        sessionStorage.removeItem(CLE);
        setToken(null);
        setErreur('Mot de passe incorrect. Vérifiez la ligne ADMIN_TOKEN du fichier .env de Laravel.');
        return;
      }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setAvis(await res.json());
    } catch {
      setErreur("Impossible de joindre Laravel. Vérifiez que « php artisan serve » est lancé.");
    } finally {
      setLoading(false);
    }
  }, [token, appel]);

  useEffect(() => { charger(); }, [charger]);

  const connexion = (e: React.FormEvent) => {
    e.preventDefault();
    const t = saisie.trim();
    if (!t) return;
    sessionStorage.setItem(CLE, t);
    setErreur('');
    setToken(t);
    setSaisie('');
  };

  const deconnexion = () => {
    sessionStorage.removeItem(CLE);
    setToken(null);
    setAvis([]);
    setInfo('');
  };

  const changer = async (a: Avis, approuve: boolean) => {
    setErreur('');
    const res = await appel(`/avis/${a.id}`, { method: 'PATCH', body: JSON.stringify({ approuve }) });
    if (res.ok) {
      setAvis((prev) => prev.map((x) => (x.id === a.id ? { ...x, approuve } : x)));
      setInfo(
        approuve
          ? `✓ L'avis de ${a.nom} est publié : il est maintenant visible sur le site.`
          : `✓ L'avis de ${a.nom} est retiré du site.`
      );
    } else setErreur(`Action impossible (erreur ${res.status}). Réessayez.`);
  };

  const supprimer = async (a: Avis) => {
    if (!confirm(`Supprimer définitivement l'avis de ${a.nom} ? Cette action est irréversible.`)) return;
    setErreur('');
    const res = await appel(`/avis/${a.id}`, { method: 'DELETE' });
    if (res.ok) {
      setAvis((prev) => prev.filter((x) => x.id !== a.id));
      setInfo(`✓ L'avis de ${a.nom} a été supprimé.`);
    } else setErreur(`Suppression impossible (erreur ${res.status}). Réessayez.`);
  };

  if (!pret) return null;

  // ---------- Écran de connexion ----------
  if (!token) {
    return (
      <main className="min-h-screen bg-[#F7F7F7] text-[#111111] grid place-items-center px-6">
        <form onSubmit={connexion} className="w-full max-w-sm bg-white rounded-3xl border border-[#E5E5E5] shadow-xl p-8 space-y-5">
          <h1 className={`${serif} text-2xl font-bold`}>Administration</h1>
          <p className="text-sm text-[#555555]">
            Entrez votre mot de passe pour gérer les avis des voyageurs.
          </p>
          <input
            type="password"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-[#D9D9D9] focus:outline-none focus:border-[#F26B1D] text-sm"
          />
          {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
          <button className="w-full bg-[#F26B1D] hover:bg-[#D95A10] text-white font-semibold py-3 rounded-xl transition">
            Se connecter
          </button>
          <p className="text-xs text-[#888888]">
            Mot de passe oublié ? Il est écrit dans le fichier <code>.env</code> de Laravel, à la ligne{' '}
            <code>ADMIN_TOKEN=</code>.
          </p>
        </form>
      </main>
    );
  }

  // ---------- Liste des avis ----------
  const enAttente = avis.filter((a) => !a.approuve);
  const publies = avis.filter((a) => a.approuve);

  return (
    <main className="min-h-screen bg-[#F26B1D] text-[#111111] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className={`${serif} text-3xl font-bold`}>Avis des voyageurs</h1>
            <p className="text-sm text-[#F26B1D] mt-1">
              {enAttente.length > 0
                ? `${enAttente.length} avis à valider`
                : 'Aucun avis à valider : tout est à jour ✓'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer" className={btnContour}>Voir le site ↗</a>
            <button onClick={charger} className={btnContour}>Actualiser</button>
            <button onClick={deconnexion} className={btnContour}>Se déconnecter</button>
          </div>
        </div>

        {/* Messages */}
        {info && (
          <p className="mb-5 rounded-xl bg-[#FFF4EC] border border-[#FFD9BF] text-[#9A3E00] text-sm px-4 py-3">{info}</p>
        )}
        {erreur && (
          <p className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{erreur}</p>
        )}

        {/* Aide */}
        <section className="mb-10 rounded-2xl bg-white border border-[#E5E5E5] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">Comment ça marche ?</h2>
            <button onClick={() => setAide(!aide)} className="text-sm text-[#F26B1D] underline">
              {aide ? "Masquer l'aide" : "Afficher l'aide"}
            </button>
          </div>
          {aide && (
            <div className="mt-4 text-sm text-[#333333] space-y-4">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Un visiteur envoie un avis depuis votre site. Il est enregistré mais reste <strong>caché</strong>.</li>
                <li>Il apparaît ici, dans « À valider ». Lisez-le.</li>
                <li>
                  Cliquez sur <strong>Publier sur le site</strong> pour l'afficher dans la section Témoignages,
                  ou sur <strong>Supprimer</strong> s'il ne convient pas.
                </li>
              </ol>
              <div className="rounded-xl bg-[#FFF4EC] border border-[#FFD9BF] p-4">
                <p className="font-semibold mb-2">À ne pas oublier</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Lisez chaque avis avant de le publier (pas d'insultes, de publicité ni de coordonnées privées).</li>
                  <li>Supprimez les avis de test avant la mise en ligne.</li>
                  <li>Passez ici une fois par semaine : vous n'êtes pas prévenu quand un avis arrive.</li>
                  <li>Cliquez sur « Voir le site » après avoir publié, pour vérifier le résultat.</li>
                  <li>Déconnectez-vous si vous utilisez un ordinateur qui n'est pas le vôtre.</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {loading && <p className="mb-6 text-sm text-[#555555]">Chargement…</p>}

        {/* À valider */}
        <h2 className="font-bold text-lg">À valider ({enAttente.length})</h2>
        <p className="text-sm text-[#666666] mb-4">
          Ces avis ne sont pas encore visibles sur votre site.
        </p>
        <div className="space-y-4 mb-12">
          {enAttente.length === 0 && !loading && (
            <p className="text-sm text-[#666666] bg-white border border-dashed border-[#D9D9D9] rounded-2xl p-5">
              Aucun avis en attente. Les nouveaux avis apparaîtront ici (cliquez sur « Actualiser » pour vérifier).
            </p>
          )}
          {enAttente.map((a) => <Carte key={a.id} a={a} onChanger={changer} onSupprimer={supprimer} />)}
        </div>

        {/* Publiés */}
        <h2 className="font-bold text-lg">Publiés sur le site ({publies.length})</h2>
        <p className="text-sm text-[#666666] mb-4">
          Ces avis sont affichés dans la section Témoignages de votre site.
        </p>
        <div className="space-y-4">
          {publies.length === 0 && !loading && (
            <p className="text-sm text-[#666666] bg-white border border-dashed border-[#D9D9D9] rounded-2xl p-5">
              Aucun avis publié pour le moment. Le site affiche alors les 3 avis d'exemple.
            </p>
          )}
          {publies.map((a) => <Carte key={a.id} a={a} onChanger={changer} onSupprimer={supprimer} />)}
        </div>
      </div>
    </main>
  );
}
