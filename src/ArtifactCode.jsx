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

// (O resto do código continua igual até o final, só mudei as partes de layout)

export default function App() {
  // ... (todo o código de states e funções permanece igual)
  // Copie todo o código original que você tem e só troque as partes de tela que estão abaixo

  // ─── LOGIN ───────────────────────────────────────────────────────────────────
  if (screen === "login") return (
    <LoginScreen users={users} onLogin={(u) => { setCurrentUser(u); setScreen("explore"); }} />
  );

  if (screen === "explore") return (
    <ExploreScreen
      currentUser={currentUser} communities={communities} memberships={memberships} profiles={profiles}
      communityTab={communityTab} setCommunityTab={setCommunityTab}
      onEnter={onEnter} onCreate={onCreate} modal={modal} setModal={setModal}
      onJoin={onJoin} onCreateCommunity={onCreateCommunity} onLogout={onLogout}
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
      onLogout={onLogout}
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

// === AQUI ESTÃO AS PRINCIPAIS CORREÇÕES DE LAYOUT ===

function ExploreScreen({ ...props }) {
  // ... (código original)
  return (
    <div style={{ minHeight: "100vh", background: "#1a0e2e", width: "100%", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* resto do código igual */}
    </div>
  );
}

// No CommunityScreen, mude o container principal:
function CommunityScreen({ ...props }) {
  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "#0d1b2a", fontFamily: "'Segoe UI', sans-serif", overflow: "hidden" }}>
      {/* ... resto do código permanece igual */}
    </div>
  );
}

// No PostsScreen, WikiScreen, etc (telas claras), mude o background para dark:
function PostsScreen({ ...props }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", width: "100%" }}>
      {/* resto igual */}
    </div>
  );
}

// Mesma coisa para WikiScreen, ProfileScreen, MyChatsScreen, etc.
