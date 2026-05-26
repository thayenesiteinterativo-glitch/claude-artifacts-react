import { useState, useRef, useEffect, useCallback } from "react";

// ─── Utility ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `há ${d} dias`;
  return "há 6 meses";
};

// ─── ImagePicker: galeria real + URL ────────────────────────────────────────
/**
 * ImagePicker
 * Props:
 *   value      – current image src (base64 or URL or null)
 *   onChange   – (src: string | null) => void
 *   label      – label shown above the preview zone (optional)
 *   height     – preview height in px (default 110)
 *   round      – boolean, makes preview circular (for avatars)
 *   placeholder – text shown when empty (optional)
 */
function ImagePicker({ value, onChange, label, height = 110, round = false, placeholder = "📷 Adicionar imagem" }) {
  const [mode, setMode] = useState(null); // null | "url"
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { onChange(ev.target.result); setMode(null); };
    reader.readAsDataURL(file);
    // reset so same file can be picked again
    e.target.value = "";
  };

  const confirmUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) { onChange(trimmed); }
    setMode(null);
    setUrlInput("");
  };

  const previewStyle = round
    ? { width: height, height, borderRadius: "50%", flexShrink: 0 }
    : { width: "100%", height, borderRadius: 12 };

  return (
    <div style={{ marginBottom: 4 }}>
      {label && <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#9b72cf" }}>{label}</p>}

      {/* Preview / click zone */}
      <div
        style={{
          ...previewStyle,
          background: value ? `url(${value}) center/cover no-repeat` : "rgba(255,255,255,0.06)",
          border: "2px dashed #7c3aed",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
        onClick={() => setMode("choose")}
      >
        {!value && (
          <span style={{ color: "#9b72cf", fontSize: 13, textAlign: "center", padding: "0 8px" }}>{placeholder}</span>
        )}
        {value && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}>
            <div style={{ background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 13, fontWeight: 600 }}>✏️ Trocar</div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

      {/* Choice modal */}
      {mode === "choose" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "flex-end" }}
          onClick={() => setMode(null)}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: "100%", background: "#1e1e2e", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px" }}>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 17, margin: "0 0 20px", textAlign: "center" }}>Escolher imagem</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => { setMode(null); setTimeout(() => fileRef.current.click(), 50); }}
                style={{ padding: "16px", borderRadius: 14, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                📁 Galeria / Arquivo
              </button>
              <button
                onClick={() => setMode("url")}
                style={{ padding: "16px", borderRadius: 14, border: "2px solid #7c3aed", background: "transparent", color: "#c4b0e8", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                🔗 Colar URL
              </button>
              {value && (
                <button
                  onClick={() => { onChange(null); setMode(null); }}
                  style={{ padding: "14px", borderRadius: 14, border: "2px solid #ef4444", background: "transparent", color: "#ef4444", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                  🗑️ Remover imagem
                </button>
              )}
              <button onClick={() => setMode(null)}
                style={{ padding: "12px", borderRadius: 14, border: "none", background: "rgba(255,255,255,0.08)", color: "#9b72cf", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL input modal */}
      {mode === "url" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "flex-end" }}
          onClick={() => setMode(null)}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: "100%", background: "#1e1e2e", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px" }}>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 17, margin: "0 0 6px" }}>🔗 Colar URL da imagem</p>
            <p style={{ color: "#9b72cf", fontSize: 13, margin: "0 0 16px" }}>Cole o link direto de uma imagem (JPG, PNG, WEBP...)</p>
            <input
              autoFocus
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && confirmUrl()}
              placeholder="https://exemplo.com/imagem.jpg"
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #7c3aed", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 14 }}
            />
            {urlInput.trim() && (
              <img src={urlInput.trim()} alt="preview" onError={e => e.target.style.display = "none"}
                style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, marginBottom: 14 }} />
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setMode("choose")}
                style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "none", color: "#9b72cf", cursor: "pointer", fontWeight: 600 }}>
                ← Voltar
              </button>
              <button onClick={confirmUrl}
                style={{ flex: 2, padding: 13, borderRadius: 12, border: "none", background: urlInput.trim() ? "#7c3aed" : "#4a4a5a", color: "#fff", cursor: urlInput.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mock images (Picsum for placeholders) ──────────────────────────────────
const IMG = {
  castle: "https://images.unsplash.com/photo-1520637836862-4d197d17c27a?w=600&q=80",
  castle2: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  village: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80",
  forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
  sword: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600&q=80",
  girl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80",
  girlAutumn: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600&q=80",
  strawberry: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80",
  mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80",
  profileCover: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80",
  profile1: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  profile2: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&q=80",
  profile3: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
  banner: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80",
  rpgGirl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
  post1: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&q=80",
  post2: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=80",
  post3: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  post4: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&q=80",
  post5: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80",
  confeitaria: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
};

// ─── Initial State ───────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id: "u1", username: "momoe", password: "123", displayName: 'Momoe" ✨ Porcelana', isAdmin: false },
  { id: "u2", username: "montagne", password: "123", displayName: "Montagne", isAdmin: false },
  { id: "u3", username: "admin", password: "admin", displayName: "Admin", isAdmin: true },
  { id: "u4", username: "kayden", password: "123", displayName: "Kayden", isAdmin: false },
  { id: "u5", username: "lilac", password: "123", displayName: "Lilac", isAdmin: false },
];

const INITIAL_COMMUNITIES = [
  {
    id: "c1", name: "Confeitaria Doce Amor", description: "Um mundo doce e mágico de RPG", coverImage: IMG.confeitaria,
    theme: "fantasy", creatorId: "u2", memberCount: 1, createdAt: now(),
  },
  {
    id: "c2", name: "Reino dos dragões", description: "O reino épico dos dragões", coverImage: IMG.castle,
    theme: "dark", creatorId: "u1", memberCount: 1, createdAt: now(),
  },
  {
    id: "c3", name: "Avalora", description: "Terra de aventureiros e heróis", coverImage: IMG.village,
    theme: "medieval", creatorId: "u1", memberCount: 1, createdAt: now(),
  },
];

const INITIAL_PROFILES = {
  "u1_c3": { userId: "u1", communityId: "c3", charName: 'Momoe" ✨ Porcelana', bio: "A melhor personagem que você vai conhecer!", avatar: IMG.profile1, cover: IMG.profileCover, isVip: true, followers: ["u2"], following: ["u4"], stories: [{ id: "s1", img: IMG.girl, label: "?" }, { id: "s2", img: IMG.girlAutumn, label: "✨" }, { id: "s3", img: IMG.post3, label: "🌿" }] },
  "u1_c2": { userId: "u1", communityId: "c2", charName: 'Momoe" ✨ Porcelana', bio: "Rainha dos dragões.", avatar: IMG.profile1, cover: IMG.castle2, isVip: false, followers: [], following: [], stories: [] },
  "u2_c2": { userId: "u2", communityId: "c2", charName: "Montagne", bio: "O cavaleiro das montanhas.", avatar: null, cover: null, isVip: false, followers: [], following: [], stories: [] },
  "u4_c3": { userId: "u4", communityId: "c3", charName: "Kayden", bio: "Construindo.", avatar: IMG.profile2, cover: IMG.forest, isVip: false, followers: ["u1"], following: [], stories: [] },
};

const INITIAL_CHATS = [
  { id: "ch1", communityId: "c2", name: "' ???", type: "public", cover: IMG.castle, creatorId: "u2", members: ["u1", "u2"], description: "Sala misteriosa", activeCount: 1 },
  { id: "ch2", communityId: "c3", name: "Taverna do Herói", type: "public", cover: IMG.village, creatorId: "u1", members: ["u1", "u4", "u5"], description: "A taverna principal", activeCount: 3 },
  { id: "ch3", communityId: "c3", name: "Floresta Sombria", type: "public", cover: IMG.forest, creatorId: "u1", members: ["u1", "u2"], description: "Perigosa floresta", activeCount: 1 },
  { id: "pv1", communityId: "c3", name: 'Novo e Momoe" ✨ Porcelana', type: "private", cover: null, creatorId: "u2", members: ["u1", "u2"], description: "Chat privado", activeCount: 2 },
  { id: "pv2", communityId: "c3", name: 'Montagne e Momoe" ✨ Porcelana', type: "private", cover: null, creatorId: "u2", members: ["u1", "u2"], description: "Chat privado", activeCount: 2 },
  { id: "pv3", communityId: "c3", name: "Jardim Mágico!", type: "private", cover: IMG.forest, creatorId: "u4", members: ["u1", "u4"], description: "Venha ser deslumbrado pelo jardim m...", activeCount: 1 },
];

const INITIAL_MESSAGES = {
  ch1: [
    { id: "m1", chatId: "ch1", userId: "u2", text: "Quem está aí?", image: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "m2", chatId: "ch1", userId: "u1", text: "Sou eu, Momoe! 👋", image: null, createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
  ch2: [
    { id: "m3", chatId: "ch2", userId: "u4", text: "Bem-vindos à taverna!", image: null, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "m4", chatId: "ch2", userId: "u1", text: "Como as estrelas nos guiam...", image: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  ch3: [], pv1: [], pv2: [], pv3: [],
};

const INITIAL_POSTS = [
  { id: "p1", communityId: "c3", userId: "u4", text: "Construindo.", image: IMG.sword, likes: ["u1", "u2"], comments: [], createdAt: new Date(Date.now() - 180 * 24 * 3600000).toISOString() },
  { id: "p2", communityId: "c3", userId: "u1", text: "Como as estrelas...", image: IMG.girlAutumn, likes: ["u4"], comments: [{ id: "cm1", userId: "u4", text: "Lindo! 😍", createdAt: now() }, { id: "cm2", userId: "u2", text: "Que foto!", createdAt: now() }], createdAt: new Date(Date.now() - 180 * 24 * 3600000).toISOString() },
  { id: "p3", communityId: "c3", userId: "u1", text: "🙏", image: IMG.post3, likes: [], comments: [], createdAt: new Date(Date.now() - 175 * 24 * 3600000).toISOString() },
  { id: "p4", communityId: "c3", userId: "u1", text: "A natureza me chama.", image: IMG.post4, likes: [], comments: [], createdAt: new Date(Date.now() - 170 * 24 * 3600000).toISOString() },
  { id: "p5", communityId: "c3", userId: "u1", text: "Novas aventuras!", image: IMG.post5, likes: [], comments: [], createdAt: new Date(Date.now() - 165 * 24 * 3600000).toISOString() },
];

const INITIAL_WIKI = {
  c3: [
    {
      id: "wc1", communityId: "c3", title: "RPG - Infos", image: IMG.rpgGirl, expanded: false,
      subcategories: [
        { id: "ws1", title: "Raças", items: [{ id: "wi1", title: "Elfos 🧝", content: "Os elfos são seres imortais...", image: IMG.forest, author: "u1", createdAt: now() }] },
        { id: "ws2", title: "Classes", items: [{ id: "wi2", title: "Guerreiro ⚔️", content: "O guerreiro é especialista em combate...", image: IMG.sword, author: "u1", createdAt: now() }] },
      ]
    },
    {
      id: "wc2", communityId: "c3", title: "Frutas", image: IMG.mango, expanded: false,
      subcategories: [
        {
          id: "ws3", title: "Frutas Vermelhas", items: [
            { id: "wi3", title: "Morango! 🍓", content: "O morango é uma fruta deliciosa...", image: IMG.strawberry, author: "u1", createdAt: now() },
          ]
        }
      ]
    }
  ]
};

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [users] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [communities, setCommunities] = useState(INITIAL_COMMUNITIES);
  const [memberships, setMemberships] = useState({ "u1_c2": true, "u1_c3": true, "u2_c2": true, "u4_c3": true });
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [wiki, setWiki] = useState(INITIAL_WIKI);
  const [screen, setScreen] = useState("login");
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [innerTab, setInnerTab] = useState("home");
  const [viewProfile, setViewProfile] = useState(null);
  const [viewWikiItem, setViewWikiItem] = useState(null);
  const [communityTab, setCommunityTab] = useState("minhas");
  const [activityOpen, setActivityOpen] = useState(false);
  const [modal, setModal] = useState(null);

  const currentProfile = activeCommunity && currentUser
    ? profiles[`${currentUser.id}_${activeCommunity.id}`] : null;

  const isCommunityCreator = activeCommunity && currentUser
    ? activeCommunity.creatorId === currentUser.id : false;

  // helpers
  const getProfile = (userId, communityId) => profiles[`${userId}_${communityId}`];
  const getUser = (id) => users.find(u => u.id === id);
  const getCommunityChats = (cid, type = null) =>
    chats.filter(c => c.communityId === cid && (type ? c.type === type : true));

  const sendMessage = (chatId, text, image) => {
    const msg = { id: uid(), chatId, userId: currentUser.id, text, image, createdAt: now() };
    setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), msg] }));
  };

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(currentUser.id);
      return { ...p, likes: liked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id] };
    }));
  };

  const addComment = (postId, text) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...p.comments, { id: uid(), userId: currentUser.id, text, createdAt: now() }] };
    }));
  };

  const joinCommunity = (community, profile) => {
    const key = `${currentUser.id}_${community.id}`;
    setMemberships(prev => ({ ...prev, [key]: true }));
    setProfiles(prev => ({ ...prev, [key]: { ...profile, userId: currentUser.id, communityId: community.id } }));
    setCommunities(prev => prev.map(c => c.id === community.id ? { ...c, memberCount: c.memberCount + 1 } : c));
  };

  const createCommunity = (data) => {
    const newC = { id: uid(), ...data, creatorId: currentUser.id, memberCount: 1, createdAt: now() };
    setCommunities(prev => [...prev, newC]);
    const key = `${currentUser.id}_${newC.id}`;
    setMemberships(prev => ({ ...prev, [key]: true }));
    setProfiles(prev => ({ ...prev, [key]: { userId: currentUser.id, communityId: newC.id, charName: currentUser.displayName, bio: "", avatar: null, cover: null, isVip: false, followers: [], following: [], stories: [] } }));
    setWiki(prev => ({ ...prev, [newC.id]: [] }));
  };

  const createChat = (data) => {
    const newChat = { id: uid(), communityId: activeCommunity.id, ...data, creatorId: currentUser.id, members: [currentUser.id], activeCount: 1 };
    setChats(prev => [...prev, newChat]);
    setMessages(prev => ({ ...prev, [newChat.id]: [] }));
  };

  const createPost = (communityId, text, image) => {
    const p = { id: uid(), communityId, userId: currentUser.id, text, image, likes: [], comments: [], createdAt: now() };
    setPosts(prev => [p, ...prev]);
  };

  const updateProfile = (communityId, data) => {
    const key = `${currentUser.id}_${communityId}`;
    setProfiles(prev => ({ ...prev, [key]: { ...prev[key], ...data } }));
  };

  const followUser = (targetUserId, communityId) => {
    const myKey = `${currentUser.id}_${communityId}`;
    const targetKey = `${targetUserId}_${communityId}`;
    setProfiles(prev => {
      const myP = prev[myKey] || {};
      const targetP = prev[targetKey] || {};
      const following = myP.following || [];
      const followers = targetP.followers || [];
      const isFollowing = following.includes(targetUserId);
      return {
        ...prev,
        [myKey]: { ...myP, following: isFollowing ? following.filter(id => id !== targetUserId) : [...following, targetUserId] },
        [targetKey]: { ...targetP, followers: isFollowing ? followers.filter(id => id !== currentUser.id) : [...followers, currentUser.id] },
      };
    });
  };

  const addWikiCategory = (communityId, title, image) => {
    setWiki(prev => ({
      ...prev,
      [communityId]: [...(prev[communityId] || []), { id: uid(), communityId, title, image, expanded: false, subcategories: [] }]
    }));
  };

  const addWikiSubcategory = (communityId, catId, title) => {
    setWiki(prev => ({
      ...prev,
      [communityId]: (prev[communityId] || []).map(c => c.id === catId ? { ...c, subcategories: [...c.subcategories, { id: uid(), title, items: [] }] } : c)
    }));
  };

  const addWikiItem = (communityId, catId, subId, item) => {
    setWiki(prev => ({
      ...prev,
      [communityId]: (prev[communityId] || []).map(c => c.id !== catId ? c : {
        ...c,
        subcategories: c.subcategories.map(s => s.id !== subId ? s : { ...s, items: [...s.items, { id: uid(), ...item, author: currentUser.id, createdAt: now() }] })
      })
    }));
  };

  const toggleWikiExpanded = (communityId, catId) => {
    setWiki(prev => ({
      ...prev,
      [communityId]: (prev[communityId] || []).map(c => c.id === catId ? { ...c, expanded: !c.expanded } : c)
    }));
  };

  // ─── Screen Router ──────────────────────────────────────────────────────────
  if (screen === "login") return (
    <LoginScreen users={users} onLogin={(u) => { setCurrentUser(u); setScreen("explore"); }} />
  );

  if (screen === "explore") return (
    <ExploreScreen
      currentUser={currentUser} communities={communities} memberships={memberships} profiles={profiles}
      communityTab={communityTab} setCommunityTab={setCommunityTab}
      onEnter={(c) => {
        setActiveCommunity(c);
        const key = `${currentUser.id}_${c.id}`;
        if (!memberships[key]) {
          setModal({ type: "createProfile", community: c });
        } else {
          setScreen("community"); setInnerTab("home");
        }
      }}
      onCreate={() => setModal({ type: "createCommunity" })}
      modal={modal} setModal={setModal}
      onJoin={(c, profile) => { joinCommunity(c, profile); setActiveCommunity(c); setScreen("community"); setInnerTab("home"); setModal(null); }}
      onCreateCommunity={(data) => { createCommunity(data); setModal(null); }}
      onLogout={() => { setCurrentUser(null); setScreen("login"); }}
    />
  );

  if (screen === "community") return (
    <CommunityScreen
      currentUser={currentUser} community={activeCommunity} chats={getCommunityChats(activeCommunity.id)}
      profiles={profiles} currentProfile={currentProfile} isCommunityCreator={isCommunityCreator}
      sideMenuOpen={sideMenuOpen} setSideMenuOpen={setSideMenuOpen}
      innerTab={innerTab} setInnerTab={setInnerTab}
      activityOpen={activityOpen} setActivityOpen={setActivityOpen}
      messages={messages} onSendMessage={sendMessage}
      posts={posts.filter(p => p.communityId === activeCommunity.id)}
      wiki={wiki[activeCommunity.id] || []}
      onToggleWiki={(catId) => toggleWikiExpanded(activeCommunity.id, catId)}
      onAddWikiCat={(title, image) => addWikiCategory(activeCommunity.id, title, image)}
      onAddWikiSub={(catId, title) => addWikiSubcategory(activeCommunity.id, catId, title)}
      onAddWikiItem={(catId, subId, item) => addWikiItem(activeCommunity.id, catId, subId, item)}
      viewWikiItem={viewWikiItem} setViewWikiItem={setViewWikiItem}
      onToggleLike={toggleLike} onAddComment={addComment} onCreatePost={(text, img) => createPost(activeCommunity.id, text, img)}
      onCreateChat={createChat}
      onViewProfile={(userId) => { setViewProfile({ userId, communityId: activeCommunity.id }); setScreen("profile"); }}
      onBack={() => { setScreen("explore"); setActiveCommunity(null); setSideMenuOpen(false); }}
      onLogout={() => { setCurrentUser(null); setScreen("login"); }}
      modal={modal} setModal={setModal}
      updateProfile={updateProfile}
      onEnterChat={(chat) => { setActiveChat(chat); setInnerTab("chat"); }}
      activeChat={activeChat} setActiveChat={setActiveChat}
      getProfile={getProfile} getUser={getUser}
    />
  );

  if (screen === "profile") return (
    <ProfileScreen
      currentUser={currentUser} viewProfile={viewProfile}
      profiles={profiles} posts={posts} communities={communities}
      onBack={() => { setScreen("community"); setViewProfile(null); }}
      onFollow={(targetId) => followUser(targetId, viewProfile.communityId)}
      onUpdateProfile={(data) => updateProfile(viewProfile.communityId, data)}
      onCreatePost={(text, img) => createPost(viewProfile.communityId, text, img)}
      getUser={getUser}
    />
  );

  return null;
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function LoginScreen({ users, onLogin }) {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [localUsers, setLocalUsers] = useState(users);

  const handleLogin = () => {
    const u = localUsers.find(u => u.username === username && u.password === password);
    if (!u) { setError("Usuário ou senha inválidos"); return; }
    onLogin(u);
  };

  const handleRegister = () => {
    if (!username || !password || !displayName) { setError("Preencha todos os campos"); return; }
    const newU = { id: uid(), username, password, displayName, isAdmin };
    setLocalUsers(prev => [...prev, newU]);
    onLogin(newU);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a0533 0%, #0d1b2a 50%, #1a0533 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚔️</div>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: 0 }}>RPG World</h1>
          <p style={{ color: "#9b72cf", margin: "8px 0 0" }}>Entre no mundo de aventuras</p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 28, backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4 }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: tab === t ? "#7c3aed" : "transparent", color: tab === t ? "#fff" : "#9b72cf", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.2s" }}>
                {t === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)}
              style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none" }} />
            {tab === "register" && (
              <input placeholder="Nome do personagem" value={displayName} onChange={e => setDisplayName(e.target.value)}
                style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none" }} />
            )}
            <input placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none" }} />
            {tab === "register" && (
              <label style={{ display: "flex", alignItems: "center", gap: 10, color: "#c4b0e8", cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#7c3aed" }} />
                Entrar como Administrador Geral
              </label>
            )}
            {error && <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>}
            <button onClick={tab === "login" ? handleLogin : handleRegister}
              style={{ padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #7c3aed, #9333ea)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
              {tab === "login" ? "Entrar" : "Criar Conta"}
            </button>
          </div>
          <p style={{ color: "#6b7280", fontSize: 12, textAlign: "center", marginTop: 16 }}>
            Demo: usuario <b style={{ color: "#9b72cf" }}>momoe</b> / senha <b style={{ color: "#9b72cf" }}>123</b>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── EXPLORE ─────────────────────────────────────────────────────────────────
function ExploreScreen({ currentUser, communities, memberships, profiles, communityTab, setCommunityTab, onEnter, onCreate, modal, setModal, onJoin, onCreateCommunity, onLogout }) {
  const [search, setSearch] = useState("");
  const myComms = communities.filter(c => memberships[`${currentUser.id}_${c.id}`]);
  const bestComms = [...communities].sort((a, b) => b.memberCount - a.memberCount);
  const displayed = communityTab === "minhas" ? myComms : communityTab === "melhores" ? bestComms : communities;
  const filtered = displayed.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "#1a0e2e", fontFamily: "'Segoe UI', sans-serif", position: "relative" }}>
      {/* Header */}
      <div style={{ background: "#1a0e2e", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", borderRadius: 50, padding: "10px 16px" }}>
          <span style={{ color: "#9b72cf", fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Procurar comunidades..."
            style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 15, outline: "none" }} />
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>🔔</button>
        <div onClick={() => setModal({ type: "userMenu" })} style={{ width: 38, height: 38, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 16 }}>
          {currentUser.displayName[0].toUpperCase()}
        </div>
      </div>

      <div style={{ padding: "0 16px 100px" }}>
        {/* Banner */}
        <div style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)", borderRadius: 20, padding: "20px 20px 16px", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, fontSize: 22 }}>⭐ ✨ 👑</div>
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 22, lineHeight: 1.3, margin: "0 0 8px" }}>Inúmeras comunidades, chats e mundos de RPG esperando por você!</h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>Junte-se a milhares de jogadores e crie histórias épicas em mundos fantásticos.</p>
          <button style={{ background: "#fff", color: "#f97316", border: "none", borderRadius: 50, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Experimente GRÁTIS!
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["minhas", "Minhas comunidades"], ["melhores", "Melhores"], ["explorar", "Explorar"]].map(([v, l]) => (
            <button key={v} onClick={() => setCommunityTab(v)}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 20, border: "none", background: communityTab === v ? "#7c3aed" : "rgba(255,255,255,0.08)", color: communityTab === v ? "#fff" : "#9b72cf", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s" }}>
              {l}
            </button>
          ))}
        </div>

        <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 24, margin: "0 0 16px" }}>
          {communityTab === "minhas" ? "Minhas Comunidades" : communityTab === "melhores" ? "Melhores Comunidades" : "Explorar"}
        </h2>

        {/* Community cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(c => (
            <div key={c.id} style={{ borderRadius: 20, overflow: "hidden", position: "relative" }}>
              <div style={{ height: 180, backgroundImage: `url(${c.coverImage})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65))" }} />
                <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                  <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 20, margin: "0 0 4px" }}>{c.name}</h3>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>{c.memberCount} membro{c.memberCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={() => onEnter(c)}
                style={{ width: "100%", padding: "14px", background: "#16a34a", border: "none", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", letterSpacing: 0.5 }}>
                Entrar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => setModal({ type: "createCommunity" })}
        style={{ position: "fixed", bottom: 28, right: 22, width: 56, height: 56, borderRadius: "50%", background: "#16a34a", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", boxShadow: "0 4px 20px rgba(22,163,74,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
        +
      </button>

      {/* Modals */}
      {modal?.type === "createProfile" && (
        <CreateProfileModal community={modal.community} onJoin={onJoin} onClose={() => setModal(null)} />
      )}
      {modal?.type === "createCommunity" && (
        <CreateCommunityModal onClose={() => setModal(null)} onCreate={onCreateCommunity} />
      )}
      {modal?.type === "userMenu" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end" }} onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: "#1e1e2e", borderRadius: "20px 20px 0 0", padding: 24 }}>
            <p style={{ color: "#9b72cf", margin: "0 0 4px" }}>Logado como</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: "0 0 20px" }}>{currentUser.displayName}</p>
            <button onClick={onLogout} style={{ width: "100%", padding: 14, background: "#ef4444", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              Sair da Conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CREATE PROFILE MODAL ────────────────────────────────────────────────────
function CreateProfileModal({ community, onJoin, onClose }) {
  const [charName, setCharName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const avatarRef = useRef();
  const coverRef = useRef();

  const handleImg = (setter, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#1e1e2e", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ color: "#fff", fontWeight: 800, marginTop: 0 }}>Criar Perfil para<br /><span style={{ color: "#7c3aed" }}>{community.name}</span></h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ color: "#9b72cf", fontSize: 13, fontWeight: 600 }}>Foto de Capa</label>
          <div onClick={() => coverRef.current.click()} style={{ height: 100, borderRadius: 12, background: cover ? `url(${cover}) center/cover` : "#2d2d3e", border: "2px dashed #7c3aed", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b72cf", fontSize: 13 }}>
            {cover ? null : "Clique para adicionar capa 📷"}
          </div>
          <input ref={coverRef} type="file" accept="image/*" onChange={e => handleImg(setCover, e)} style={{ display: "none" }} />

          <label style={{ color: "#9b72cf", fontSize: 13, fontWeight: 600 }}>Foto de Perfil</label>
          <div onClick={() => avatarRef.current.click()} style={{ width: 80, height: 80, borderRadius: "50%", background: avatar ? `url(${avatar}) center/cover` : "#2d2d3e", border: "2px dashed #7c3aed", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b72cf", fontSize: 12, alignSelf: "center" }}>
            {avatar ? null : "📷"}
          </div>
          <input ref={avatarRef} type="file" accept="image/*" onChange={e => handleImg(setAvatar, e)} style={{ display: "none" }} />

          <input placeholder="Nome do Personagem *" value={charName} onChange={e => setCharName(e.target.value)}
            style={{ padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none" }} />
          <textarea placeholder="Biografia" value={bio} onChange={e => setBio(e.target.value)} rows={3}
            style={{ padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", resize: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "none", color: "#9b72cf", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
          <button onClick={() => onJoin(community, { charName: charName || "Aventureiro", bio, avatar, cover, isVip: false, followers: [], following: [], stories: [] })}
            disabled={!charName}
            style={{ flex: 2, padding: 13, borderRadius: 12, border: "none", background: charName ? "#7c3aed" : "#4a4a5a", color: "#fff", cursor: charName ? "pointer" : "not-allowed", fontWeight: 700 }}>
            Criar Perfil & Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CREATE COMMUNITY MODAL ──────────────────────────────────────────────────
function CreateCommunityModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [theme, setTheme] = useState("fantasy");
  const imgRef = useRef();

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCoverImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#1e1e2e", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ color: "#fff", fontWeight: 800, marginTop: 0 }}>Nova Comunidade</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div onClick={() => imgRef.current.click()} style={{ height: 120, borderRadius: 12, background: coverImage ? `url(${coverImage}) center/cover` : "#2d2d3e", border: "2px dashed #7c3aed", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b72cf" }}>
            {coverImage ? null : "📷 Imagem de Capa"}
          </div>
          <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
          <input placeholder="Nome da Comunidade *" value={name} onChange={e => setName(e.target.value)}
            style={{ padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none" }} />
          <textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} rows={3}
            style={{ padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", resize: "none" }} />
          <select value={theme} onChange={e => setTheme(e.target.value)}
            style={{ padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "#2d2d3e", color: "#fff", fontSize: 15, outline: "none" }}>
            <option value="fantasy">Fantasy</option>
            <option value="dark">Dark</option>
            <option value="medieval">Medieval</option>
            <option value="scifi">Sci-Fi</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "none", color: "#9b72cf", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
          <button onClick={() => name && onCreate({ name, description, coverImage: coverImage || IMG.castle, theme })} disabled={!name}
            style={{ flex: 2, padding: 13, borderRadius: 12, border: "none", background: name ? "#7c3aed" : "#4a4a5a", color: "#fff", cursor: name ? "pointer" : "not-allowed", fontWeight: 700 }}>
            Criar Comunidade
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMMUNITY SCREEN ────────────────────────────────────────────────────────
function CommunityScreen({ currentUser, community, chats, profiles, currentProfile, isCommunityCreator, sideMenuOpen, setSideMenuOpen, innerTab, setInnerTab, activityOpen, setActivityOpen, messages, onSendMessage, posts, wiki, onToggleWiki, onAddWikiCat, onAddWikiSub, onAddWikiItem, viewWikiItem, setViewWikiItem, onToggleLike, onAddComment, onCreatePost, onCreateChat, onViewProfile, onBack, onLogout, modal, setModal, updateProfile, onEnterChat, activeChat, setActiveChat, getProfile, getUser }) {
  const [chatSearch, setChatSearch] = useState("");
  const publicChats = chats.filter(c => c.type === "public" && c.name.toLowerCase().includes(chatSearch.toLowerCase()));

  const profile = currentProfile;

  const memberProfiles = Object.entries(profiles)
    .filter(([k]) => k.endsWith(`_${community.id}`))
    .map(([, p]) => p);

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b2a", fontFamily: "'Segoe UI', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Side Menu Overlay */}
      {sideMenuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setSideMenuOpen(false)} />
        </div>
      )}

      {/* Side Menu */}
      <div style={{ position: "fixed", top: 0, left: sideMenuOpen ? 0 : "-85%", width: "78%", maxWidth: 300, height: "100%", background: "#d1d5db", borderRadius: "0 24px 24px 0", zIndex: 600, transition: "left 0.3s ease", padding: 24, boxSizing: "border-box", overflowY: "auto" }}>
        <button onClick={() => setSideMenuOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#374151" }}>✕</button>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: profile?.avatar ? `url(${profile.avatar}) center/cover` : "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 28, marginBottom: 12, flexShrink: 0 }}>
          {!profile?.avatar && (profile?.charName?.[0] || currentUser.displayName[0]).toUpperCase()}
        </div>
        <p style={{ color: "#6b7280", margin: "0 0 2px", fontSize: 14 }}>Hey!</p>
        <p style={{ color: "#111827", fontWeight: 800, fontSize: 22, margin: "0 0 28px" }}>{profile?.charName?.split(" ")[0] || currentUser.displayName.split(" ")[0]}</p>
        {[
          { icon: "🏠", label: "Início", tab: "home" },
          { icon: "🏦", label: "Banco", tab: "bank" },
          { icon: "✨", label: "Posts Recentes", tab: "posts" },
          { icon: "💬", label: "Meus Chats", tab: "myChats" },
          { icon: "📖", label: "Wiki", tab: "wiki" },
          { icon: "🛡️", label: "Sistemas / Regras", tab: "rules" },
          { icon: "☕", label: "Chat Off", tab: "chatoff" },
          { icon: "📅", label: "Eventos", tab: "events" },
          ...(isCommunityCreator ? [{ icon: "⚙️", label: "Configurações", tab: "settings" }] : []),
        ].map(({ icon, label, tab }) => (
          <button key={tab} onClick={() => { setInnerTab(tab); setSideMenuOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "14px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: "none" }}>
            <span style={{ fontSize: 20, width: 28 }}>{icon}</span>
            <span style={{ color: "#1f2937", fontSize: 17, fontWeight: innerTab === tab ? 700 : 500 }}>{label}</span>
          </button>
        ))}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.15)", marginTop: 16, paddingTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          <button onClick={() => { onBack(); setSideMenuOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "12px 0", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>←</span>
            <span style={{ color: "#1f2937", fontSize: 16 }}>Voltar às Comunidades</span>
          </button>
          <button onClick={onLogout}
            style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "12px 0", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>↪</span>
            <span style={{ color: "#ef4444", fontSize: 16 }}>Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {innerTab === "home" && (
          <>
            {/* Community Header */}
            <div style={{ position: "relative", height: 220, backgroundImage: `url(${community.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(13,27,42,0.3), rgba(13,27,42,0.85))" }} />
              <button onClick={() => setSideMenuOpen(true)} style={{ position: "absolute", top: 16, left: 16, background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", zIndex: 10 }}>☰</button>
              <button style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 10 }}>🔔</button>
              <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>— {community.name}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.8)", fontSize: 15 }}>
                  <span>👥</span> <span>{community.memberCount} Membros</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, background: "#0d1b2a", padding: "16px 16px 120px" }}>
              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                <span style={{ color: "#9b72cf" }}>🔍</span>
                <input value={chatSearch} onChange={e => setChatSearch(e.target.value)} placeholder="Pesquisar chats..."
                  style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 15, outline: "none" }} />
              </div>

              {/* Chat Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {publicChats.map(chat => {
                  const creatorProfile = getProfile(chat.creatorId, community.id);
                  const creatorUser = getUser(chat.creatorId);
                  const initial = (creatorProfile?.charName || creatorUser?.displayName || "?")[0].toUpperCase();
                  return (
                    <div key={chat.id} onClick={() => { setActiveChat(chat); setInnerTab("chat"); }}
                      style={{ borderRadius: 18, overflow: "hidden", background: "#1a2a3a", cursor: "pointer", position: "relative" }}>
                      <div style={{ height: 150, backgroundImage: `url(${chat.cover})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7))" }} />
                        <div style={{ position: "absolute", top: 10, left: 10, width: 36, height: 36, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, border: "2px solid #0d1b2a" }}>
                          {initial}
                        </div>
                        <div style={{ position: "absolute", bottom: 10, left: 10, right: 10 }}>
                          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>{chat.name}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
                            <span>👥</span> <span>{chat.members.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {innerTab === "chat" && activeChat && (
          <ChatView chat={activeChat} currentUser={currentUser} messages={messages[activeChat.id] || []} onSend={(t, img) => onSendMessage(activeChat.id, t, img)} onBack={() => { setInnerTab("home"); setActiveChat(null); }} getProfile={(uid) => getProfile(uid, community.id)} getUser={getUser} />
        )}

        {innerTab === "posts" && (
          <PostsScreen community={community} currentUser={currentUser} posts={posts} profiles={profiles} onToggleLike={onToggleLike} onAddComment={onAddComment} onCreatePost={onCreatePost} onBack={() => setInnerTab("home")} onViewProfile={(uid) => onViewProfile(uid)} getProfile={(uid) => getProfile(uid, community.id)} getUser={getUser} />
        )}

        {innerTab === "myChats" && (
          <MyChatsScreen community={community} currentUser={currentUser} chats={chats.filter(c => c.communityId === community.id && c.members.includes(currentUser.id))} profiles={profiles} onBack={() => setInnerTab("home")} onEnterChat={(chat) => { setActiveChat(chat); setInnerTab("chat"); }} onCreatePrivateChat={(name, members) => { const c = { name, type: "private", cover: null, description: "Chat privado", members: [currentUser.id, ...members], activeCount: members.length + 1 }; onCreateChat(c); }} getProfile={(uid) => getProfile(uid, community.id)} getUser={getUser} memberProfiles={memberProfiles} />
        )}

        {innerTab === "wiki" && (
          <WikiScreen community={community} currentUser={currentUser} wiki={wiki} isCommunityCreator={isCommunityCreator} onToggleExpand={onToggleWiki} onAddCat={onAddWikiCat} onAddSub={onAddWikiSub} onAddItem={onAddWikiItem} viewItem={viewWikiItem} setViewItem={setViewWikiItem} onBack={() => setInnerTab("home")} getProfile={(uid) => getProfile(uid, community.id)} />
        )}

        {["rules", "events", "chatoff"].includes(innerTab) && (
          <SimpleScreen tab={innerTab} community={community} currentUser={currentUser} isCommunityCreator={isCommunityCreator} posts={posts} profiles={profiles} onToggleLike={onToggleLike} onAddComment={onAddComment} onCreatePost={onCreatePost} onBack={() => setInnerTab("home")} getProfile={(uid) => getProfile(uid, community.id)} getUser={getUser} onSendMessage={onSendMessage} messages={messages} chats={chats} />
        )}

        {innerTab === "bank" && (
          <div style={{ flex: 1, background: "#0d1b2a", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={() => setInnerTab("home")} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>←</button>
              <h2 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 700 }}>Banco</h2>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "#9b72cf" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🏦</div>
                <p style={{ fontSize: 20, fontWeight: 600 }}>Em breve...</p>
              </div>
            </div>
          </div>
        )}

        {innerTab === "settings" && isCommunityCreator && (
          <CreatorSettingsScreen community={community} currentUser={currentUser} onBack={() => setInnerTab("home")} />
        )}
      </div>

      {/* Activity Widget */}
      {innerTab === "home" && !activityOpen && (
        <div onClick={() => setActivityOpen(true)}
          style={{ position: "fixed", bottom: 20, left: 16, background: "rgba(15,25,40,0.95)", borderRadius: 50, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", zIndex: 100 }}>
          <div style={{ position: "relative", width: 36, height: 36 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: profile?.avatar ? `url(${profile.avatar}) center/cover` : "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
              {!profile?.avatar && (profile?.charName || currentUser.displayName)[0].toUpperCase()}
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #0d1b2a" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff" }}>
            <span>👥</span> <span style={{ fontWeight: 600 }}>{community.memberCount}</span>
          </div>
        </div>
      )}

      {/* Activity Panel */}
      {activityOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 400 }} onClick={() => setActivityOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#0a0a0a", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ width: 40, height: 4, background: "#333", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>⚡</span>
                <h3 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 800 }}>Atividade em círculo</h3>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ background: "#1a3a1a", color: "#22c55e", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 700 }}>● 3</span>
                <span style={{ background: "#1a1a1a", color: "#9ca3af", borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 700 }}>● 30</span>
              </div>
            </div>
            <div style={{ background: "#111", borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 13 }}>
                  <span>🔌</span> <span>Já disponível online</span>
                </div>
                <span style={{ color: "#7c3aed", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Ver tudo</span>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {[{ name: "Lilac", img: IMG.profile2 }, { name: "linn Линн", img: IMG.profile3 }, { name: "Haki", img: IMG.post3 }].map(u => (
                  <div key={u.name} style={{ textAlign: "center" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundImage: `url(${u.img})`, backgroundSize: "cover", border: "2px solid #22c55e", marginBottom: 6 }} />
                    <p style={{ color: "#fff", fontSize: 12, margin: 0, fontWeight: 500 }}>{u.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#111", borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>
                <span>👑</span> <span>Proprietário</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundImage: `url(${IMG.profile1})`, backgroundSize: "cover" }} />
                <span style={{ color: "#fff", fontFamily: "cursive", fontSize: 18 }}>Momoku.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB for creator */}
      {innerTab === "home" && isCommunityCreator && (
        <button onClick={() => setModal({ type: "createChat" })}
          style={{ position: "fixed", bottom: 28, right: 22, width: 56, height: 56, borderRadius: "50%", background: "#16a34a", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", boxShadow: "0 4px 20px rgba(22,163,74,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          +
        </button>
      )}

      {/* Create Chat Modal */}
      {modal?.type === "createChat" && (
        <CreateChatModal onClose={() => setModal(null)} onCreate={(data) => { onCreateChat(data); setModal(null); }} />
      )}
    </div>
  );
}

// ─── CHAT VIEW ───────────────────────────────────────────────────────────────
function ChatView({ chat, currentUser, messages, onSend, onBack, getProfile, getUser }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const bottomRef = useRef();
  const imgRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const send = () => {
    if (!text.trim() && !image) return;
    onSend(text.trim(), image);
    setText(""); setImage(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0d1b2a" }}>
      <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, background: "#0d1b2a", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: 8, backgroundImage: `url(${chat.cover})`, backgroundSize: "cover", backgroundColor: "#7c3aed" }} />
        <div>
          <p style={{ color: "#fff", margin: 0, fontWeight: 700, fontSize: 15 }}>{chat.name}</p>
          <p style={{ color: "#9b72cf", margin: 0, fontSize: 12 }}>{chat.members.length} membros</p>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map(msg => {
          const isMe = msg.userId === currentUser.id;
          const prof = getProfile(msg.userId);
          const user = getUser(msg.userId);
          const name = prof?.charName || user?.displayName || "?";
          const avatar = prof?.avatar;
          return (
            <div key={msg.id} style={{ display: "flex", gap: 10, flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end" }}>
              {!isMe && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: avatar ? `url(${avatar}) center/cover` : "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {!avatar && name[0].toUpperCase()}
                </div>
              )}
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4, alignItems: isMe ? "flex-end" : "flex-start" }}>
                {!isMe && <span style={{ color: "#9b72cf", fontSize: 12, fontWeight: 600 }}>{name}</span>}
                {msg.image && <img src={msg.image} alt="" style={{ maxWidth: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />}
                {msg.text && (
                  <div style={{ background: isMe ? "#7c3aed" : "rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", color: "#fff", fontSize: 15, lineHeight: 1.5 }}>
                    {msg.text}
                  </div>
                )}
                <span style={{ color: "#6b7280", fontSize: 11 }}>{timeAgo(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {image && (
        <div style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={image} alt="" style={{ height: 60, borderRadius: 8, objectFit: "cover" }} />
          <button onClick={() => setImage(null)} style={{ background: "rgba(239,68,68,0.2)", border: "none", color: "#ef4444", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>✕</button>
        </div>
      )}
      <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => imgRef.current.click()} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#9b72cf", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontSize: 16 }}>📷</button>
        <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Mensagem..."
          style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 24, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none" }} />
        <button onClick={send} style={{ background: "#7c3aed", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>➤</button>
      </div>
    </div>
  );
}

// ─── POSTS SCREEN ────────────────────────────────────────────────────────────
function PostsScreen({ community, currentUser, posts, profiles, onToggleLike, onAddComment, onCreatePost, onBack, onViewProfile, getProfile, getUser }) {
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newText, setNewText] = useState("");
  const [newImage, setNewImage] = useState(null);
  const imgRef = useRef();

  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCreate = () => {
    if (!newText.trim() && !newImage) return;
    onCreatePost(newText, newImage);
    setNewText(""); setNewImage(null); setShowCreate(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ background: "#fff", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#374151" }}>←</button>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: "#111827" }}>Posts Recentes</h2>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ background: "#7c3aed", border: "none", borderRadius: 20, padding: "8px 18px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          + Criar Post
        </button>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 40 }}>
        {posts.map(post => {
          const prof = getProfile(post.userId);
          const user = getUser(post.userId);
          const name = prof?.charName || user?.displayName || "?";
          const avatar = prof?.avatar;
          const liked = post.likes.includes(currentUser.id);
          return (
            <div key={post.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
                <div onClick={() => onViewProfile(post.userId)}
                  style={{ width: 42, height: 42, borderRadius: "50%", background: avatar ? `url(${avatar}) center/cover` : "#7c3aed", flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                  {!avatar && name[0].toUpperCase()}
                </div>
                <div>
                  <p onClick={() => onViewProfile(post.userId)} style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#111827", cursor: "pointer" }}>{name}</p>
                  <p style={{ margin: 0, color: "#9ca3af", fontSize: 12 }}>{timeAgo(post.createdAt)}</p>
                </div>
              </div>
              {post.text && <p style={{ margin: "12px 16px 8px", color: "#374151", fontSize: 15 }}>{post.text}</p>}
              {post.image && <img src={post.image} alt="" onClick={() => setExpandedPost(post)} style={{ width: "100%", maxHeight: 350, objectFit: "cover", cursor: "pointer", display: "block" }} />}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 20 }}>
                <button onClick={() => onToggleLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: liked ? "#ef4444" : "#6b7280", fontSize: 15 }}>
                  {liked ? "❤️" : "🤍"} <span>{post.likes.length}</span>
                </button>
                <button onClick={() => setExpandedPost(expandedPost?.id === post.id ? null : post)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 15 }}>
                  💬 <span>{post.comments.length}</span>
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "auto", color: "#6b7280", fontSize: 16 }}>↗</button>
              </div>
              {expandedPost?.id === post.id && (
                <div style={{ borderTop: "1px solid #f3f4f6", padding: "0 16px 16px" }}>
                  {post.comments.map(c => {
                    const cp = getProfile(c.userId);
                    const cu = getUser(c.userId);
                    return (
                      <div key={c.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: cp?.avatar ? `url(${cp.avatar}) center/cover` : "#7c3aed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                          {!cp?.avatar && (cp?.charName || cu?.displayName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#111827" }}>{cp?.charName || cu?.displayName}</p>
                          <p style={{ margin: 0, color: "#374151", fontSize: 14 }}>{c.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Comentar..." onKeyDown={e => e.key === "Enter" && commentText.trim() && (onAddComment(post.id, commentText), setCommentText(""))}
                      style={{ flex: 1, background: "#f3f4f6", border: "none", borderRadius: 20, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                    <button onClick={() => { if (commentText.trim()) { onAddComment(post.id, commentText); setCommentText(""); } }}
                      style={{ background: "#7c3aed", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", cursor: "pointer", fontSize: 16 }}>➤</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>Criar Post</h3>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="O que você quer compartilhar?" rows={4}
              style={{ width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, outline: "none", resize: "none", boxSizing: "border-box" }} />
            {newImage && <img src={newImage} alt="" style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover", marginTop: 10 }} />}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => imgRef.current.click()} style={{ padding: "11px 18px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 16 }}>📷 Foto</button>
              <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 11, borderRadius: 12, border: "1px solid #e5e7eb", background: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleCreate} style={{ flex: 1, padding: 11, borderRadius: 12, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MY CHATS SCREEN ─────────────────────────────────────────────────────────
function MyChatsScreen({ community, currentUser, chats, profiles, onBack, onEnterChat, onCreatePrivateChat, getProfile, getUser, memberProfiles }) {
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState([]);
  const [chatName, setChatName] = useState("");

  const myChats = chats.filter(c => c.members.includes(currentUser.id));

  const handleCreate = () => {
    if (!selected.length) return;
    const memberIds = selected.map(p => p.userId);
    const name = chatName || selected.map(p => p.charName).join(" e ");
    onCreatePrivateChat(name, memberIds);
    setShowCreate(false); setSelected([]); setChatName("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ background: "#fff", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#374151" }}>←</button>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20, color: "#111827" }}>Meus Chats</h2>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ background: "#7c3aed", border: "none", borderRadius: 20, padding: "8px 18px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          + Novo Chat
        </button>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 40 }}>
        {myChats.map(chat => {
          const hasImage = chat.cover && !chat.cover.startsWith("#");
          return (
            <div key={chat.id} onClick={() => onEnterChat(chat)}
              style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: hasImage ? `url(${chat.cover}) center/cover` : "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, flexShrink: 0 }}>
                {!hasImage && "👥"}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15, color: "#111827" }}>{chat.name}</p>
                <p style={{ margin: "0 0 4px", color: "#9ca3af", fontSize: 13 }}>{chat.description || (chat.type === "private" ? "Chat privado" : "Chat público")}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>{chat.members.length} membros</span>
                  {chat.type === "private" && <span style={{ background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>Privado</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>Novo Chat Privado</h3>
            <input value={chatName} onChange={e => setChatName(e.target.value)} placeholder="Nome do chat (opcional)"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 15, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
            <p style={{ color: "#374151", fontWeight: 600, marginBottom: 10 }}>Selecionar membros:</p>
            {memberProfiles.filter(p => p.userId !== currentUser.id).map(p => (
              <div key={p.userId} onClick={() => setSelected(prev => prev.find(x => x.userId === p.userId) ? prev.filter(x => x.userId !== p.userId) : [...prev, p])}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: p.avatar ? `url(${p.avatar}) center/cover` : "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                  {!p.avatar && p.charName[0].toUpperCase()}
                </div>
                <span style={{ flex: 1, color: "#111827", fontWeight: 500 }}>{p.charName}</span>
                <span style={{ fontSize: 20 }}>{selected.find(x => x.userId === p.userId) ? "✅" : "⭕"}</span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleCreate} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WIKI SCREEN ─────────────────────────────────────────────────────────────
function WikiScreen({ community, currentUser, wiki, isCommunityCreator, onToggleExpand, onAddCat, onAddSub, onAddItem, viewItem, setViewItem, onBack, getProfile }) {
  const [showAddCat, setShowAddCat] = useState(false);
  const [catTitle, setCatTitle] = useState("");
  const [catImage, setCatImage] = useState(null);
  const [showAddSub, setShowAddSub] = useState(null);
  const [subTitle, setSubTitle] = useState("");
  const [showAddItem, setShowAddItem] = useState(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemContent, setItemContent] = useState("");
  const [itemImage, setItemImage] = useState(null);
  const catImgRef = useRef();
  const itemImgRef = useRef();

  const handleCatImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCatImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleItemImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setItemImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  if (viewItem) {
    const prof = getProfile(viewItem.author);
    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
        <div style={{ background: "#fff", padding: "16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #e5e7eb" }}>
          <button onClick={() => setViewItem(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#374151" }}>←</button>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>{viewItem.title.split("!")[0]}</h2>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.08)", display: "flex", gap: 14, alignItems: "center" }}>
            {viewItem.image && <img src={viewItem.image} alt="" style={{ width: 100, height: 100, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />}
            <div>
              <h3 style={{ margin: "0 0 6px", fontWeight: 800, fontSize: 18 }}>{viewItem.title}</h3>
              <p style={{ margin: "0 0 4px", color: "#9ca3af", fontSize: 13 }}>Por <span style={{ color: "#7c3aed", fontWeight: 700 }}>{prof?.charName || "?"}</span></p>
              {viewItem.content && <p style={{ margin: 0, color: "#374151", fontSize: 14, lineHeight: 1.6 }}>{viewItem.content}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ background: "#fff", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#374151" }}>←</button>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>Wiki</h2>
        </div>
        {isCommunityCreator && (
          <button onClick={() => setShowAddCat(true)} style={{ background: "#7c3aed", border: "none", borderRadius: 20, padding: "8px 18px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+</button>
        )}
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 40 }}>
        {wiki.map(cat => (
          <div key={cat.id}>
            <div onClick={() => onToggleExpand(cat.id)}
              style={{ background: "#fff", borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              {cat.image && <img src={cat.image} alt="" style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 17, color: "#111827" }}>{cat.title}</p>
                <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>{cat.subcategories.length} subcategor{cat.subcategories.length === 1 ? "ia" : "ias"}</p>
              </div>
              <span style={{ color: "#9ca3af", fontSize: 16 }}>{cat.expanded ? "∨" : ">"}</span>
            </div>

            {cat.expanded && (
              <div style={{ background: "#f0edf8", borderRadius: "0 0 16px 16px", padding: "14px 16px", marginTop: -6 }}>
                {isCommunityCreator && (
                  <button onClick={() => setShowAddSub(cat.id)} style={{ background: "#7c3aed", border: "none", borderRadius: 12, padding: "7px 14px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 12 }}>+ Subcategoria</button>
                )}
                {cat.subcategories.map(sub => (
                  <div key={sub.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#6b21a8", fontSize: 14 }}>{sub.title}</p>
                      {isCommunityCreator && (
                        <button onClick={() => setShowAddItem({ catId: cat.id, subId: sub.id })} style={{ background: "none", border: "none", color: "#7c3aed", cursor: "pointer", fontWeight: 700, fontSize: 18 }}>+</button>
                      )}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {sub.items.map(item => (
                        <div key={item.id} onClick={() => setViewItem(item)}
                          style={{ background: "#fff", borderRadius: 14, padding: 12, width: 130, cursor: "pointer", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}>
                          {item.image && <img src={item.image} alt="" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 10, marginBottom: 8 }} />}
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#111827" }}>{item.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddCat && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>Nova Categoria</h3>
            <div onClick={() => catImgRef.current.click()} style={{ height: 80, borderRadius: 12, background: catImage ? `url(${catImage}) center/cover` : "#f3f4f6", border: "2px dashed #7c3aed", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b72cf", marginBottom: 12 }}>
              {catImage ? null : "📷 Imagem"}
            </div>
            <input ref={catImgRef} type="file" accept="image/*" onChange={handleCatImg} style={{ display: "none" }} />
            <input value={catTitle} onChange={e => setCatTitle(e.target.value)} placeholder="Título da categoria" style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 15, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAddCat(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => { if (catTitle) { onAddCat(catTitle, catImage); setCatTitle(""); setCatImage(null); setShowAddCat(false); } }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {showAddSub && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>Nova Subcategoria</h3>
            <input value={subTitle} onChange={e => setSubTitle(e.target.value)} placeholder="Título" style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 15, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAddSub(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => { if (subTitle) { onAddSub(showAddSub, subTitle); setSubTitle(""); setShowAddSub(null); } }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: 24, maxHeight: "80vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>Novo Item</h3>
            <div onClick={() => itemImgRef.current.click()} style={{ height: 80, borderRadius: 12, background: itemImage ? `url(${itemImage}) center/cover` : "#f3f4f6", border: "2px dashed #7c3aed", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b72cf", marginBottom: 12 }}>
              {itemImage ? null : "📷 Imagem"}
            </div>
            <input ref={itemImgRef} type="file" accept="image/*" onChange={handleItemImg} style={{ display: "none" }} />
            <input value={itemTitle} onChange={e => setItemTitle(e.target.value)} placeholder="Título" style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 15, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
            <textarea value={itemContent} onChange={e => setItemContent(e.target.value)} placeholder="Conteúdo..." rows={3} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 15, outline: "none", resize: "none", marginBottom: 14, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAddItem(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => { if (itemTitle) { onAddItem(showAddItem.catId, showAddItem.subId, { title: itemTitle, content: itemContent, image: itemImage }); setItemTitle(""); setItemContent(""); setItemImage(null); setShowAddItem(null); } }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SIMPLE SCREENS (Rules, Events, Chat Off) ─────────────────────────────────
function SimpleScreen({ tab, community, currentUser, isCommunityCreator, posts, profiles, onToggleLike, onAddComment, onCreatePost, onBack, getProfile, getUser, onSendMessage, messages, chats }) {
  const labels = { rules: "Sistemas / Regras", events: "Eventos", chatoff: "Chat Off" };
  const emojis = { rules: "🛡️", events: "📅", chatoff: "☕" };

  if (tab === "chatoff") {
    const offChat = chats.find(c => c.type === "chatoff") || { id: "chatoff", name: "Chat Off", members: [], type: "chatoff" };
    const offMessages = messages["chatoff"] || [];
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0d1b2a" }}>
        <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, background: "#0d1b2a", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 22 }}>☕</span>
          <h2 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 700 }}>Chat Off</h2>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {offMessages.map(msg => {
            const isMe = msg.userId === currentUser.id;
            const prof = getProfile(msg.userId);
            const user = getUser(msg.userId);
            const name = prof?.charName || user?.displayName || "?";
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                {!isMe && <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{name[0]}</div>}
                <div style={{ maxWidth: "72%" }}>
                  {!isMe && <p style={{ color: "#9b72cf", fontSize: 11, margin: "0 0 3px" }}>{name}</p>}
                  {msg.image && <img src={msg.image} alt="" style={{ maxWidth: "100%", borderRadius: 12, maxHeight: 180 }} />}
                  {msg.text && <div style={{ background: isMe ? "#7c3aed" : "rgba(255,255,255,0.1)", color: "#fff", padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: 14 }}>{msg.text}</div>}
                </div>
              </div>
            );
          })}
        </div>
        <ChatInput onSend={(t, img) => onSendMessage("chatoff", t, img)} />
      </div>
    );
  }

  const filteredPosts = posts.filter(p => p.communityId === community.id);

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ background: "#fff", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#374151" }}>←</button>
          <span style={{ fontSize: 22 }}>{emojis[tab]}</span>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>{labels[tab]}</h2>
        </div>
        {isCommunityCreator && (
          <button onClick={() => onCreatePost(`[${labels[tab]}] Nova publicação`, null)} style={{ background: "#7c3aed", border: "none", borderRadius: 20, padding: "8px 18px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>+</button>
        )}
      </div>
      <div style={{ padding: 16 }}>
        {filteredPosts.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{emojis[tab]}</div>
            <p>Nenhuma publicação ainda</p>
          </div>
        )}
        {filteredPosts.map(post => {
          const prof = getProfile(post.userId);
          const user = getUser(post.userId);
          const name = prof?.charName || user?.displayName || "?";
          const liked = post.likes.includes(currentUser.id);
          return (
            <div key={post.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ padding: "14px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: prof?.avatar ? `url(${prof.avatar}) center/cover` : "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>{!prof?.avatar && name[0]}</div>
                <div><p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{name}</p><p style={{ margin: 0, color: "#9ca3af", fontSize: 12 }}>{timeAgo(post.createdAt)}</p></div>
              </div>
              {post.text && <p style={{ margin: "10px 16px 8px", fontSize: 14 }}>{post.text}</p>}
              {post.image && <img src={post.image} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "cover" }} />}
              <div style={{ padding: "10px 16px", display: "flex", gap: 16 }}>
                <button onClick={() => onToggleLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", gap: 5, color: liked ? "#ef4444" : "#6b7280", fontSize: 14 }}>{liked ? "❤️" : "🤍"} {post.likes.length}</button>
                <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", gap: 5, color: "#6b7280", fontSize: 14 }}>💬 {post.comments.length}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatInput({ onSend }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const imgRef = useRef();
  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target.result);
    reader.readAsDataURL(file);
  };
  const send = () => {
    if (!text.trim() && !image) return;
    onSend(text.trim(), image);
    setText(""); setImage(null);
  };
  return (
    <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)" }}>
      {image && <img src={image} alt="" style={{ height: 40, borderRadius: 8 }} />}
      <button onClick={() => imgRef.current.click()} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#9b72cf", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontSize: 15 }}>📷</button>
      <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
      <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Mensagem..."
        style={{ flex: 1, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 24, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none" }} />
      <button onClick={send} style={{ background: "#7c3aed", border: "none", borderRadius: "50%", width: 44, height: 44, color: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>➤</button>
    </div>
  );
}

// ─── CREATE CHAT MODAL ────────────────────────────────────────────────────────
function CreateChatModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
  const imgRef = useRef();
  const handleImg = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCover(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 600, display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", background: "#1e1e2e", borderRadius: "20px 20px 0 0", padding: 24 }}>
        <h3 style={{ color: "#fff", margin: "0 0 16px", fontWeight: 700 }}>Novo Chat Público</h3>
        <div onClick={() => imgRef.current.click()} style={{ height: 80, borderRadius: 12, background: cover ? `url(${cover}) center/cover` : "#2d2d3e", border: "2px dashed #7c3aed", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b72cf", marginBottom: 12 }}>
          {cover ? null : "📷 Capa do Chat"}
        </div>
        <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do Chat *"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "none", color: "#9b72cf", cursor: "pointer" }}>Cancelar</button>
          <button onClick={() => name && onCreate({ name, description, cover: cover || IMG.castle, type: "public", members: [], activeCount: 0 })} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: name ? "#7c3aed" : "#4a4a5a", color: "#fff", fontWeight: 700, cursor: name ? "pointer" : "not-allowed" }}>Criar</button>
        </div>
      </div>
    </div>
  );
}

// ─── CREATOR SETTINGS ────────────────────────────────────────────────────────
function CreatorSettingsScreen({ community, currentUser, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ background: "#fff", padding: "16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #e5e7eb" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#374151" }}>←</button>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>⚙️ Configurações</h2>
      </div>
      <div style={{ padding: 16 }}>
        {[{ icon: "👥", label: "Gerenciar Membros", sub: "Promover co-criadores e gerenciar equipe" }, { icon: "🤖", label: "Fábrica de NPCs", sub: "Criar bots personalizados para os chats" }, { icon: "🗺️", label: "Mapa Interativo", sub: "Upload de mapa com pinos clicáveis" }, { icon: "📢", label: "Disparar Aviso", sub: "Enviar notificação para todos os membros" }, { icon: "🎨", label: "Aparência", sub: "Personalizar cores e tema da comunidade" }].map(item => (
          <div key={item.label} style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", cursor: "pointer" }}>
            <span style={{ fontSize: 26 }}>{item.icon}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: "#111827", fontSize: 16 }}>{item.label}</p>
              <p style={{ margin: 0, color: "#9ca3af", fontSize: 13 }}>{item.sub}</p>
            </div>
            <span style={{ marginLeft: "auto", color: "#9ca3af" }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE SCREEN ──────────────────────────────────────────────────────────
function ProfileScreen({ currentUser, viewProfile, profiles, posts, communities, onBack, onFollow, onUpdateProfile, onCreatePost, getUser }) {
  const { userId, communityId } = viewProfile;
  const profile = profiles[`${userId}_${communityId}`];
  const isOwnProfile = userId === currentUser.id;
  const community = communities.find(c => c.id === communityId);
  const userPosts = posts.filter(p => p.userId === userId && p.communityId === communityId);
  const [profileTab, setProfileTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(profile?.charName || "");
  const [editBio, setEditBio] = useState(profile?.bio || "");
  const [editAvatar, setEditAvatar] = useState(profile?.avatar || null);
  const [editCover, setEditCover] = useState(profile?.cover || null);
  const [showCreate, setShowCreate] = useState(false);
  const [newText, setNewText] = useState("");
  const [newImage, setNewImage] = useState(null);
  const avatarRef = useRef(); const coverRef = useRef(); const postImgRef = useRef();

  const isFollowing = profile?.followers?.includes(currentUser.id);

  const handleImg = (setter, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setter(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveEdit = () => {
    onUpdateProfile({ charName: editName, bio: editBio, avatar: editAvatar, cover: editCover });
    setShowEdit(false);
  };

  const handlePostCreate = () => {
    if (!newText.trim() && !newImage) return;
    onCreatePost(newText, newImage);
    setNewText(""); setNewImage(null); setShowCreate(false);
  };

  if (!profile) return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#9ca3af" }}>
        <p style={{ fontSize: 20, fontWeight: 600 }}>Perfil não encontrado</p>
        <button onClick={onBack} style={{ marginTop: 16, padding: "10px 24px", background: "#7c3aed", border: "none", borderRadius: 12, color: "#fff", cursor: "pointer" }}>Voltar</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Cover */}
      <div style={{ height: 180, backgroundImage: `url(${profile.cover || IMG.profileCover})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
        <button onClick={onBack} style={{ position: "absolute", top: 12, left: 12, width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, zIndex: 10 }}>←</button>
        <button style={{ position: "absolute", top: 12, right: 12, width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, zIndex: 10 }}>⚙️</button>
      </div>

      {/* Avatar */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: -52, marginBottom: 8 }}>
        <div style={{ width: 104, height: 104, borderRadius: "50%", background: profile.avatar ? `url(${profile.avatar}) center/cover` : "#7c3aed", border: "4px solid #fff", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 36 }}>
          {!profile.avatar && profile.charName[0].toUpperCase()}
        </div>
      </div>

      <div style={{ background: "#fff", padding: "0 20px 20px" }}>
        {/* Name */}
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <h2 style={{ margin: "0 0 4px", fontWeight: 900, fontSize: 22 }}>{profile.charName}</h2>
          <p style={{ margin: "0 0 6px", color: "#9ca3af", fontSize: 14 }}>em {community?.name}</p>
          <p style={{ margin: "0 0 16px", color: "#374151", fontSize: 14 }}>{profile.bio}</p>
        </div>

        {/* VIP Card */}
        {profile.isVip && (
          <div style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: 16, padding: "16px 20px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -10, top: -10, fontSize: 80, opacity: 0.15 }}>👑</div>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: "0 0 4px" }}>👑 Você é VIP! ✨</p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: "0 0 12px" }}>Aproveite todos os recursos exclusivos de personalização</p>
            <button style={{ background: "#fff", border: "none", borderRadius: 20, padding: "8px 18px", color: "#d97706", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>✨ Gerenciar VIP</button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f3f4f6" }}>
          {[{ v: userPosts.length, l: "publicações" }, { v: (profile.followers || []).length, l: "seguidores" }, { v: (profile.following || []).length, l: "seguindo" }].map(({ v, l }) => (
            <div key={l} style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontWeight: 900, fontSize: 22, color: "#111827" }}>{v}</p>
              <p style={{ margin: 0, color: "#9ca3af", fontSize: 12 }}>{l}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {isOwnProfile ? (
            <>
              <button onClick={() => setShowEdit(true)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Editar Perfil</button>
              <button onClick={() => setShowCreate(true)} style={{ width: 48, height: 48, borderRadius: 12, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </>
          ) : (
            <>
              <button onClick={() => onFollow(userId)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: isFollowing ? "#e5e7eb" : "#7c3aed", color: isFollowing ? "#374151" : "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
                {isFollowing ? "Seguindo" : "👤+ Seguir"}
              </button>
              <button style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>💬 Mensagem</button>
            </>
          )}
        </div>

        {/* Stories */}
        {(profile.stories || []).length > 0 && (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, marginBottom: 4 }}>
            {(profile.stories || []).map(s => (
              <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: `url(${s.img}) center/cover`, border: "3px solid #ec4899", padding: 2 }} />
                <span style={{ color: "#374151", fontSize: 11 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", display: "flex", borderTop: "1px solid #f3f4f6", marginTop: 8 }}>
        {[["posts", "⊞ POSTS"], ["inventory", "⬡ INVENTÁRIO"]].map(([v, l]) => (
          <button key={v} onClick={() => setProfileTab(v)}
            style={{ flex: 1, padding: "14px", border: "none", background: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: profileTab === v ? "#111827" : "#9ca3af", borderBottom: profileTab === v ? "2px solid #111827" : "2px solid transparent" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {profileTab === "posts" && (
        <div style={{ background: "#f3f4f6", minHeight: 200 }}>
          {userPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
              <p>Nenhuma postagem ainda</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, padding: 2 }}>
              {userPosts.filter(p => p.image).map(post => (
                <div key={post.id} style={{ aspectRatio: "1", backgroundImage: `url(${post.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              ))}
            </div>
          )}
        </div>
      )}

      {profileTab === "inventory" && (
        <div style={{ background: "#f3f4f6", padding: 20, minHeight: 200 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[{ icon: "⚔️", name: "Espada" }, { icon: "🛡️", name: "Escudo" }, { icon: "🧪", name: "Poção" }, { icon: "💎", name: "Gema" }, { icon: "🗝️", name: "Chave" }, { icon: "📜", name: "Pergaminho" }].map(item => (
              <div key={item.name} style={{ background: "#fff", borderRadius: 12, padding: 14, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{item.icon}</div>
                <p style={{ margin: 0, fontSize: 12, color: "#374151", fontWeight: 600 }}>{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: 24, maxHeight: "85vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>Editar Perfil</h3>
            <label style={{ color: "#374151", fontSize: 13, fontWeight: 600 }}>Foto de Capa</label>
            <div onClick={() => coverRef.current.click()} style={{ height: 80, borderRadius: 12, background: editCover ? `url(${editCover}) center/cover` : "#f3f4f6", border: "2px dashed #7c3aed", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b72cf", margin: "8px 0 14px" }}>
              {editCover ? null : "📷 Capa"}
            </div>
            <input ref={coverRef} type="file" accept="image/*" onChange={e => handleImg(setEditCover, e)} style={{ display: "none" }} />
            <label style={{ color: "#374151", fontSize: 13, fontWeight: 600 }}>Foto de Perfil</label>
            <div onClick={() => avatarRef.current.click()} style={{ width: 70, height: 70, borderRadius: "50%", background: editAvatar ? `url(${editAvatar}) center/cover` : "#f3f4f6", border: "2px dashed #7c3aed", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#9b72cf", margin: "8px 0 14px" }}>
              {editAvatar ? null : "📷"}
            </div>
            <input ref={avatarRef} type="file" accept="image/*" onChange={e => handleImg(setEditAvatar, e)} style={{ display: "none" }} />
            <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nome do personagem"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 15, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
            <textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Biografia" rows={3}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 15, outline: "none", resize: "none", marginBottom: 14, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEdit(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e5e7eb", background: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={saveEdit} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: "#fff", borderRadius: "20px 20px 0 0", padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>Criar Post</h3>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Compartilhe algo..." rows={4}
              style={{ width: "100%", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, outline: "none", resize: "none", boxSizing: "border-box" }} />
            {newImage && <img src={newImage} alt="" style={{ width: "100%", borderRadius: 12, maxHeight: 180, objectFit: "cover", marginTop: 10 }} />}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => postImgRef.current.click()} style={{ padding: "11px 18px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 16 }}>📷</button>
              <input ref={postImgRef} type="file" accept="image/*" onChange={e => handleImg(setNewImage, e)} style={{ display: "none" }} />
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 11, borderRadius: 12, border: "1px solid #e5e7eb", background: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handlePostCreate} style={{ flex: 1, padding: 11, borderRadius: 12, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Publicar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// Se quiser, posso mandar as telas principais corrigidas uma por uma.
