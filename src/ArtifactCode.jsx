import { useState, useRef, useEffect } from "react";

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

// ─── ImagePicker (mantido igual) ─────────────────────────────────────────────
function ImagePicker({ value, onChange, label, height = 110, round = false, placeholder = "📷 Adicionar imagem" }) {
  const [mode, setMode] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { onChange(ev.target.result); setMode(null); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const confirmUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) onChange(trimmed);
    setMode(null);
    setUrlInput("");
  };

  const previewStyle = round
    ? { width: height, height, borderRadius: "50%", flexShrink: 0 }
    : { width: "100%", height, borderRadius: 12 };

  return (
    <div style={{ marginBottom: 4 }}>
      {label && <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#9b72cf" }}>{label}</p>}
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
        {!value && <span style={{ color: "#9b72cf", fontSize: 13, textAlign: "center", padding: "0 8px" }}>{placeholder}</span>}
        {value && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}>
            <div style={{ background: "rgba(0,0,0,0.7)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 13, fontWeight: 600 }}>✏️ Trocar</div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

      {/* Modals de imagem (mantido igual) */}
      {mode === "choose" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "flex-end" }} onClick={() => setMode(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: "#1e1e2e", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px" }}>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 17, margin: "0 0 20px", textAlign: "center" }}>Escolher imagem</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => { setMode(null); setTimeout(() => fileRef.current.click(), 50); }} style={{ padding: "16px", borderRadius: 14, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>📁 Galeria / Arquivo</button>
              <button onClick={() => setMode("url")} style={{ padding: "16px", borderRadius: 14, border: "2px solid #7c3aed", background: "transparent", color: "#c4b0e8", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>🔗 Colar URL</button>
              {value && <button onClick={() => { onChange(null); setMode(null); }} style={{ padding: "14px", borderRadius: 14, border: "2px solid #ef4444", background: "transparent", color: "#ef4444", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>🗑️ Remover imagem</button>}
              <button onClick={() => setMode(null)} style={{ padding: "12px", borderRadius: 14, border: "none", background: "rgba(255,255,255,0.08)", color: "#9b72cf", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {mode === "url" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "flex-end" }} onClick={() => setMode(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: "#1e1e2e", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px" }}>
            <p style={{ color: "#fff", fontWeight: 800, fontSize: 17, margin: "0 0 6px" }}>🔗 Colar URL da imagem</p>
            <input autoFocus value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmUrl()} placeholder="https://exemplo.com/imagem.jpg" style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "2px solid #7c3aed", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", marginBottom: 14 }} />
            {urlInput.trim() && <img src={urlInput.trim()} alt="preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 10, marginBottom: 14 }} />}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setMode("choose")} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "none", color: "#9b72cf", cursor: "pointer" }}>← Voltar</button>
              <button onClick={confirmUrl} style={{ flex: 2, padding: 13, borderRadius: 12, border: "none", background: urlInput.trim() ? "#7c3aed" : "#4a4a5a", color: "#fff", cursor: urlInput.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mock Images e Initial Data (mantido igual) ─────────────────────────────
const IMG = { /* ... todo o objeto IMG original ... */ };
// (Para não ficar gigante, mantenha o IMG, INITIAL_USERS, INITIAL_COMMUNITIES, etc. igual ao que você já tem)

const INITIAL_USERS = [ /* mantenha igual */ ];
const INITIAL_COMMUNITIES = [ /* mantenha igual */ ];
const INITIAL_PROFILES = { /* mantenha igual */ };
const INITIAL_CHATS = [ /* mantenha igual */ ];
const INITIAL_MESSAGES = { /* mantenha igual */ };
const INITIAL_POSTS = [ /* mantenha igual */ ];
const INITIAL_WIKI = { /* mantenha igual */ };

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

  const currentProfile = activeCommunity && currentUser ? profiles[`${currentUser.id}_${activeCommunity.id}`] : null;
  const isCommunityCreator = activeCommunity && currentUser ? activeCommunity.creatorId === currentUser.id : false;

  const getProfile = (userId, communityId) => profiles[`${userId}_${communityId}`];
  const getUser = (id) => users.find(u => u.id === id);
  const getCommunityChats = (cid) => chats.filter(c => c.communityId === cid);

  // Funções (sendMessage, toggleLike, etc) - mantenha todas iguais ao seu código original

  // ... (mantenha todas as funções como createCommunity, sendMessage, etc.)

  // Screen Router
  if (screen === "login") return <LoginScreen users={users} onLogin={(u) => { setCurrentUser(u); setScreen("explore"); }} />;

  if (screen === "explore") return <ExploreScreen currentUser={currentUser} communities={communities} memberships={memberships} profiles={profiles} communityTab={communityTab} setCommunityTab={setCommunityTab} onEnter={(c) => { setActiveCommunity(c); setScreen("community"); setInnerTab("home"); }} onCreate={() => setModal({ type: "createCommunity" })} onLogout={() => { setCurrentUser(null); setScreen("login"); }} />;

  if (screen === "community") return <CommunityScreen {...{ currentUser, community: activeCommunity, chats: getCommunityChats(activeCommunity.id), profiles, currentProfile, isCommunityCreator, sideMenuOpen, setSideMenuOpen, innerTab, setInnerTab, activityOpen, setActivityOpen, messages, onSendMessage: (chatId, text, image) => {/* implement */}, posts, wiki: wiki[activeCommunity.id] || [], onBack: () => { setScreen("explore"); }} onLogout={() => { setCurrentUser(null); setScreen("login"); }} modal={modal} setModal={setModal} onViewProfile={(userId) => { setViewProfile({ userId, communityId: activeCommunity.id }); setScreen("profile"); }} getProfile={getProfile} getUser={getUser} />} />;

  if (screen === "profile") return <ProfileScreen currentUser={currentUser} viewProfile={viewProfile} profiles={profiles} posts={posts} communities={communities} onBack={() => { setScreen("community"); setViewProfile(null); }} getUser={getUser} />;

  return null;
}

// Copie o resto das funções (LoginScreen, ExploreScreen, CommunityScreen, etc.) do seu arquivo original.
// Se quiser, posso mandar as telas principais corrigidas uma por uma.
