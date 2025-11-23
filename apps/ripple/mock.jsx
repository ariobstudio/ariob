import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, Settings, ChevronLeft, User, Globe, Lock, 
  Sparkles, Ghost, Gamepad2, MessageCircle, Share2, 
  Heart, MoreHorizontal, Bell, Search, Menu, Zap, 
  Shield, Terminal, X, Check, Send, Reply, ArrowRight,
  Edit3, UserPlus, LogOut, Key, Wallet, RefreshCw, 
  Image as ImageIcon, Phone, Video, Loader2
} from 'lucide-react';

/**
 * 🌊 RIPPLE PROTOCOL: FINAL MVP (AI ENHANCED)
 * * Features: Gemini LLM Integration for Companion Chat & Smart Compose.
 * * Architecture: Modular, Action-Driven, Physics-Based.
 */

// --- GEMINI API INTEGRATION ---
const apiKey = ""; // API Key provided by environment

const callGemini = async (prompt, systemInstruction = "") => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing. simulating response.");
    return new Promise(resolve => setTimeout(() => resolve("I can't connect to the mesh right now (No API Key), but I hear you!"), 1000));
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    // Add system instruction if supported or prepend to prompt. 
    // For this model version, we'll stick to simple prompt engineering if systemInstruction field isn't strictly supported in all contexts, 
    // but wrapping it in the prompt is safest for simple calls.
    systemInstruction: { parts: [{ text: systemInstruction }] } 
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Signal lost in the graph...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error syncing with intelligence node.";
  }
};

// --- 1. DESIGN SYSTEM & TOKENS ---
const THEME = {
  bg: 'bg-[#000000]',
  card: 'bg-[#0A0A0A]', 
  cardHover: 'bg-[#111]',
  border: 'border-white/10',
  line: 'bg-[#222]',
  textMain: 'text-[#E7E9EA]',
  textDim: 'text-[#71767B]',
  accent: 'text-[#1D9BF0]',
  success: 'text-[#00BA7C]',
  alert: 'text-[#F91880]',
  pill: 'bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 shadow-2xl',
};

const DEGREES = [
  { id: 0, label: 'Me', icon: 'lock' },
  { id: 1, label: 'Friends', icon: 'user' },
  { id: 2, label: 'Global', icon: 'globe' },
];

// --- 2. MOCK DATA GENERATORS ---
const generateGlobalContent = () => [
  {
    id: 'g-1',
    type: 'post',
    author: 'Elena Fisher',
    handle: '@elena_arch',
    avatar: 'EF',
    content: 'The new architecture for the downtown library is finally approved. Check out the render.',
    image: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?auto=format&fit=crop&w=800&q=80',
    timestamp: '10m ago',
    degree: 2,
    stats: { likes: 120, reposts: 45 }
  },
  {
    id: 'g-2',
    type: 'post',
    author: 'Cyber Daily',
    handle: '@cyber_news',
    avatar: 'CD',
    content: 'Quantum resistance is no longer theoretical. The mesh network just upgraded its encryption layer.',
    timestamp: '1h ago',
    degree: 2,
    stats: { likes: 1200, reposts: 890 }
  },
  {
    id: 'g-3',
    type: 'profile_suggestion',
    author: 'Alex Chen',
    handle: '@alexc',
    avatar: 'AC',
    content: 'Mutual connection found via local graph.',
    timestamp: '2h ago',
    degree: 2
  }
];

const INITIAL_COMPANION_NODE = {
  id: 'dm-ripple-genesis',
  type: 'dm',
  author: 'Ripple',
  avatar: 'sparkles', 
  messages: [
    { id: 'r0', from: 'them', content: "Protocol initialized.", time: '00:00' },
    { id: 'r1', from: 'them', content: "Hi! I'm Ripple, your AI companion.", time: 'Now' },
    { id: 'r2', from: 'them', content: "I'm connected to the Gemini Mesh. Ask me anything or just say hello!", time: 'Now' }
  ],
  timestamp: 'Just now',
  degree: 0
};

// --- 3. UTILITIES & ICONS ---
const Icon = ({ name, size=16, className }) => {
  const map = {
    sparkles: Sparkles, ghost: Ghost, user: User, globe: Globe, 
    lock: Lock, zap: Zap, settings: Settings, menu: Menu, 
    game: Gamepad2, message: MessageCircle, send: Send, key: Key,
    wallet: Wallet, shield: Shield
  };
  const I = map[name] || Sparkles;
  return <I size={size} className={className} />;
};

// --- 4. THE META-ACTION ENGINE ---
const useMetaActions = (viewDegree, hasProfile, fullViewData) => {
  return useMemo(() => {
    let left = null;
    let right = null;
    let center = { icon: <Plus size={26} strokeWidth={2.5} />, label: 'Add', action: 'create' };

    // A. FULL VIEW CONTEXT
    if (fullViewData) {
        left = { icon: <ChevronLeft size={24} />, action: 'back', label: 'Back' };
        right = { icon: <MoreHorizontal size={24} />, action: 'options', label: 'Options' };

        const isMe = fullViewData.author === 'You' || (fullViewData.type === 'profile' && fullViewData.isMe); 
        const isProfile = fullViewData.type === 'profile' || fullViewData.isProfileView;

        if (isProfile) {
            if (isMe) {
                center = { icon: <Edit3 size={20} />, label: 'Edit', action: 'edit_profile' };
            } else {
                center = { icon: <UserPlus size={20} />, label: 'Connect', action: 'connect' };
            }
        } else {
            center = { icon: <Reply size={20} />, label: 'Reply', action: 'reply_full' };
        }
        return { left, right, center };
    }

    // B. FEED CONTEXT
    if (viewDegree === 0) {
        if (hasProfile) {
            left = { icon: <Settings size={20} />, action: 'settings' };
            right = { icon: <MoreHorizontal size={20} />, action: 'more' };
        } else {
            right = { icon: <Key size={20} />, action: 'auth_options' };
        }
    } 
    else if (viewDegree === 1) {
      right = { icon: <Search size={20} />, action: 'find_friends' };
    }
    else if (viewDegree === 2) {
      left = { icon: <Zap size={20} />, action: 'trending' };
      right = { icon: <Search size={20} />, action: 'search_global' };
    }

    return { left, right, center };
  }, [viewDegree, hasProfile, fullViewData]);
};

// --- 5. SUB-COMPONENTS ---

const NotificationOverlay = ({ data, onDismiss, onAction, onReply }) => {
  const [replyText, setReplyText] = useState('');
  const isDM = data.type === 'dm';

  return (
    <div className="absolute top-16 left-4 right-4 z-40 animate-in slide-in-from-top-2 duration-700 ease-out">
      <div className="bg-[#16181C] border border-[#2F3336] rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#1D9BF0]" />
        <div className="flex gap-4">
           <div className="w-10 h-10 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] flex items-center justify-center shrink-0">
             <Icon name={data.icon} size={20} />
           </div>
           <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                 <h3 className="text-[#E7E9EA] font-bold text-sm">{data.title}</h3>
                 <button onClick={onDismiss} className="text-[#71767B] hover:text-white transition-colors"><X size={16}/></button>
              </div>
              <p className="text-[#71767B] text-xs leading-relaxed mb-3">{data.message}</p>
              
              {isDM ? (
                <div className="flex gap-2">
                   <input 
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#1D9BF0] transition-colors"
                      placeholder="Reply here..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && onReply(replyText)}
                   />
                   <button onClick={() => onReply(replyText)} disabled={!replyText} className="bg-[#1D9BF0] text-white px-3 py-2 rounded-xl disabled:opacity-50">
                      <Send size={16} />
                   </button>
                </div>
              ) : (
                data.actionLabel ? (
                  <button onClick={onAction} className="w-full py-2.5 rounded-xl bg-[#E7E9EA] text-black text-xs font-bold hover:bg-white transition-colors">
                     {data.actionLabel}
                  </button>
                ) : null
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const Node = ({ data, isLast, onClick, onInlineReply, onAvatarClick, onSync, isThinking }) => {
  const isProfile = data.type === 'profile';
  const isDM = data.type === 'dm';
  const isSystem = data.type === 'system';
  const isGhost = data.type === 'ghost';
  const isAuth = data.type === 'auth_node';
  const isSync = data.type === 'sync_node';
  const isCompanion = data.author === 'Ripple';
  const isSuggestion = data.type === 'profile_suggestion';

  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if(!inputText) return;
    onInlineReply(data.id, inputText);
    setInputText('');
  };

  if (isSync) {
      return (
        <div className="flex gap-5 group relative animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center shrink-0 w-6">
                <div className={`w-[1px] h-6 ${THEME.line}`} />
                <div className={`w-2.5 h-2.5 rounded-full border-2 border-black z-10 bg-purple-500 shadow-purple-500/50 shadow-lg`} />
                {!isLast && <div className={`w-[1px] flex-1 ${THEME.line}`} />}
            </div>
            <div className="flex-1 mb-8">
                <div onClick={onSync} className="bg-[#111] border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:bg-[#161616] transition-colors cursor-pointer group/sync">
                    <div className="flex -space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#111] flex items-center justify-center text-[10px] font-bold text-white shadow-md">EF</div>
                        <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#111] flex items-center justify-center text-[10px] font-bold text-white shadow-md">CD</div>
                        <div className="w-8 h-8 rounded-full bg-[#333] border-2 border-[#111] flex items-center justify-center text-[10px] text-white/60 shadow-md">+2</div>
                    </div>
                    <h3 className="text-white font-medium text-sm">New updates from {data.teaser}</h3>
                    <p className="text-neutral-500 text-xs mb-3">and other nodes in your extended graph.</p>
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold group-hover/sync:bg-white group-hover/sync:text-black transition-all">
                        Tap to Sync
                    </div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="flex gap-5 group relative">
      <div className="flex flex-col items-center shrink-0 w-6">
         <div className={`w-[1px] h-6 ${THEME.line}`} />
         <div className={`
            w-2.5 h-2.5 rounded-full border-2 border-black z-10 shadow-lg
            ${isProfile ? 'bg-green-500 shadow-green-500/20' : isDM ? 'bg-[#1D9BF0] shadow-blue-500/20' : isCompanion ? 'bg-amber-400 shadow-amber-400/20' : isAuth ? 'bg-purple-500' : 'bg-neutral-400'}
         `} />
         {!isLast && <div className={`w-[1px] flex-1 ${THEME.line}`} />}
      </div>

      <div 
         onClick={() => onClick(data)}
         className={`
            flex-1 mb-8 rounded-2xl border p-5 transition-all duration-300 cursor-pointer relative overflow-hidden
            ${isGhost ? 'bg-transparent border-dashed border-neutral-800 opacity-60' : `${THEME.card} ${THEME.border} hover:${THEME.cardHover} hover:border-white/10 hover:shadow-lg hover:-translate-y-0.5`}
         `}
      >
         <div>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-3">
                  <div 
                    onClick={(e) => { e.stopPropagation(); onAvatarClick(data); }}
                    className={`
                     w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm cursor-pointer 
                     ${isCompanion ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : isAuth ? 'bg-purple-500/10 text-purple-400' : 'bg-white/5 text-neutral-300 ring-1 ring-white/10 hover:bg-white/10'}
                  `}>
                     {isCompanion ? <Icon name="sparkles" size={14} /> : isAuth ? <Key size={14} /> : (data.avatar || data.author[0])}
                  </div>
                  <div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white leading-none">{data.author}</span>
                        {isDM && !isCompanion && <span className="bg-blue-500/10 text-[#1D9BF0] text-[9px] px-1.5 py-0.5 rounded font-medium tracking-wide border border-blue-500/20">DM</span>}
                        {isCompanion && <span className="bg-amber-500/10 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-medium tracking-wide border border-amber-500/20">AI</span>}
                        {isSuggestion && <span className="bg-purple-500/10 text-purple-400 text-[9px] px-1.5 py-0.5 rounded font-medium tracking-wide border border-purple-500/20">NEW</span>}
                     </div>
                     <span className="text-[10px] text-neutral-500 font-medium font-mono mt-1 block">{data.timestamp}</span>
                  </div>
               </div>
            </div>

            {/* Content */}
            {isProfile ? (
               <div className="mt-2 bg-[#050505] rounded-xl border border-white/5 p-6 flex flex-col items-center text-center relative overflow-hidden group/profile">
                  <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-50" />
                  <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-2xl bg-[#111] border border-green-500/30 flex items-center justify-center text-3xl text-green-500 mb-3 shadow-[0_0_20px_rgba(34,197,94,0.1)] group-hover/profile:scale-105 transition-transform">
                         {data.avatar}
                      </div>
                      <h3 className="text-lg font-bold text-white">{data.author}</h3>
                      <p className="text-neutral-500 text-xs font-mono mb-4">{data.handle}</p>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                         <Shield size={12} /> Identity Anchored
                      </div>
                  </div>
               </div>
            ) : isAuth ? (
               <div className="space-y-3 mt-2">
                  <div className="p-3 bg-[#111] border border-white/5 rounded-xl flex items-center gap-3 hover:bg-[#161616] transition-colors">
                     <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><Key size={16} /></div>
                     <div className="flex-1">
                        <div className="text-sm font-bold text-white">Import Private Key</div>
                        <div className="text-xs text-neutral-500">Restore an existing node</div>
                     </div>
                     <ChevronLeft size={16} className="text-neutral-600 rotate-180" />
                  </div>
                  <div className="p-3 bg-[#111] border border-white/5 rounded-xl flex items-center gap-3 hover:bg-[#161616] transition-colors">
                     <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Wallet size={16} /></div>
                     <div className="flex-1">
                        <div className="text-sm font-bold text-white">Connect Wallet</div>
                        <div className="text-xs text-neutral-500">Use external signer</div>
                     </div>
                     <ChevronLeft size={16} className="text-neutral-600 rotate-180" />
                  </div>
               </div>
            ) : isDM && data.messages ? (
               <div className="space-y-2 mb-4">
                  {data.messages.slice(-2).map((msg, idx) => (
                     <div key={idx} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                           max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                           ${msg.from === 'me' 
                              ? 'bg-[#1D9BF0] text-white rounded-br-none shadow-blue-900/20' 
                              : 'bg-[#1A1A1A] text-neutral-200 rounded-bl-none border border-white/5'}
                        `}>
                           {msg.content}
                        </div>
                     </div>
                  ))}
                  {isCompanion && isThinking && (
                      <div className="flex justify-start">
                          <div className="bg-[#1A1A1A] border border-white/5 px-4 py-2 rounded-2xl rounded-bl-none text-neutral-400 text-xs flex items-center gap-2">
                              <Loader2 size={12} className="animate-spin" />
                              Ripple is thinking...
                          </div>
                      </div>
                  )}
               </div>
            ) : (
               <div className="space-y-3">
                  <div className={`text-[15px] leading-relaxed font-light ${isGhost ? 'text-neutral-600 italic' : 'text-neutral-300'}`}>
                     {data.content}
                  </div>
                  {data.image && (
                      <div className="rounded-xl overflow-hidden border border-white/10">
                          <img src={data.image} alt="Content" className="w-full h-48 object-cover" />
                      </div>
                  )}
                  {isSuggestion && (
                      <button className="w-full py-2 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/30 hover:bg-purple-500/20 transition-colors">
                          Connect Node
                      </button>
                  )}
               </div>
            )}
            
            {isDM && (
               <div className="mt-4 pt-3 border-t border-white/5" onClick={e => e.stopPropagation()}>
                  {!showInput ? (
                     <button 
                        onClick={() => setShowInput(true)}
                        className="flex items-center gap-2 text-xs text-neutral-500 hover:text-[#1D9BF0] transition-colors w-full group/reply"
                     >
                        <div className="p-1.5 rounded-full bg-white/5 group-hover/reply:bg-[#1D9BF0]/10 transition-colors">
                           <Reply size={14} />
                        </div>
                        <span className="font-medium">Reply to conversation...</span>
                     </button>
                  ) : (
                     <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                        <input 
                           autoFocus
                           className="flex-1 bg-[#111] text-sm text-white px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#1D9BF0] transition-all" 
                           placeholder={`Reply to ${data.author}...`}
                           value={inputText}
                           onChange={e => setInputText(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} disabled={!inputText} className="text-white bg-[#1D9BF0] p-2.5 rounded-xl hover:bg-[#1D9BF0]/90 transition-colors disabled:opacity-50 disabled:bg-white/5">
                           <Send size={16} />
                        </button>
                     </div>
                  )}
               </div>
            )}

            {!isDM && !isProfile && !isSystem && !isGhost && !isCompanion && !isAuth && !isSync && (
               <div className="flex gap-6 mt-4 pt-2 border-t border-white/5 text-neutral-500">
                  <button className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors group/stat"><MessageCircle size={16}/></button>
                  <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors group/stat"><Share2 size={16}/></button>
                  <button className="flex items-center gap-1.5 hover:text-pink-500 transition-colors group/stat"><Heart size={16}/></button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

const FullView = ({ data, onClose, onReply, isThinking }) => {
   const isDM = data.type === 'dm';
   const isProfile = data.type === 'profile' || data.isProfileView;
   const [replyText, setReplyText] = useState('');
   
   // Auto-scroll to bottom of chat
   const chatEndRef = useRef(null);
   useEffect(() => {
       chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [data.messages, isThinking]);

   return (
      <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-end sm:items-center justify-center animate-in fade-in duration-300">
         <div className="w-full max-w-lg h-[100dvh] bg-[#000000] sm:border border-white/10 sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden relative">
            
            {isDM ? (
               <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#0A0A0A] z-20 relative">
                  <button onClick={onClose} className="text-white flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all">
                     <ChevronLeft size={20} /> 
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">{data.avatar}</div>
                        <span className="text-sm font-bold">{data.author}</span>
                     </div>
                  </button>
                  <div className="flex gap-2">
                     <button className="p-2 hover:bg-white/10 rounded-full"><Phone size={20} className="text-[#71767B]" /></button>
                     <button className="p-2 hover:bg-white/10 rounded-full"><Video size={20} className="text-[#71767B]" /></button>
                  </div>
               </div>
            ) : (
               <div className="h-20 w-full pointer-events-none absolute top-0 z-20 bg-gradient-to-b from-black to-transparent" /> 
            )}

            <div className="flex-1 overflow-y-auto p-0 flex flex-col">
               {isProfile ? (
                   <div className="flex flex-col items-center relative pb-32">
                       <div className="w-full h-32 bg-gradient-to-b from-[#111] to-[#0A0A0A] border-b border-white/5 absolute top-0 left-0 z-0" />
                       <div className="relative z-10 mt-16 flex flex-col items-center w-full px-6">
                           <div className="w-32 h-32 rounded-3xl bg-[#0A0A0A] border-4 border-black flex items-center justify-center text-6xl text-white font-bold shadow-2xl mb-4">
                               {data.avatar}
                           </div>
                           <h2 className="text-3xl font-bold text-white tracking-tight">{data.author}</h2>
                           <p className="text-neutral-500 mb-8 font-mono text-sm">{data.handle}</p>
                           
                           <div className="flex w-full justify-between px-8 py-6 border-y border-white/5 mb-8">
                               <div className="text-center"><div className="text-xl font-bold text-white">120</div><div className="text-[10px] text-neutral-500 uppercase tracking-widest">Following</div></div>
                               <div className="text-center"><div className="text-xl font-bold text-white">4.2k</div><div className="text-[10px] text-neutral-500 uppercase tracking-widest">Followers</div></div>
                               <div className="text-center"><div className="text-xl font-bold text-white">892</div><div className="text-[10px] text-neutral-500 uppercase tracking-widest">Trust</div></div>
                           </div>

                           <div className="w-full space-y-4 mb-32">
                               <div className="p-5 bg-[#111] rounded-2xl border border-white/5">
                                   <h3 className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-2">Bio</h3>
                                   <p className="text-neutral-300 leading-relaxed">Anchored in the graph. Exploring the decentralized web.</p>
                               </div>
                               <div className="p-5 bg-[#111] rounded-2xl border border-white/5 flex justify-between items-center">
                                   <div className="flex items-center gap-3">
                                       <Shield size={18} className="text-green-500" />
                                       <span className="text-sm font-medium text-white">Key Status</span>
                                   </div>
                                   <span className="font-mono text-xs text-neutral-500">0x4a...9f2</span>
                               </div>
                           </div>
                       </div>
                   </div>
               ) : isDM ? (
                   <div className="flex-1 p-4 flex flex-col justify-end min-h-full">
                        {(data.messages || []).map((msg, idx) => (
                            <div key={idx} className={`flex mb-3 ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                                    max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                    ${msg.from === 'me' ? 'bg-[#1D9BF0] text-white rounded-br-none' : 'bg-[#1A1A1A] text-neutral-200 rounded-bl-none border border-white/5'}
                                `}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start mb-3">
                                <div className="bg-[#1A1A1A] border border-white/5 px-4 py-2 rounded-2xl rounded-bl-none text-neutral-400 text-xs flex items-center gap-2">
                                    <Loader2 size={12} className="animate-spin" />
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                   </div>
               ) : (
                   <div className="px-6 pt-24 pb-32">
                       <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center text-xl text-white font-bold">
                               {data.avatar || data.author[0]}
                           </div>
                           <div>
                               <div className="text-lg font-bold text-white">{data.author}</div>
                               <div className="text-sm text-neutral-500 font-mono">{data.handle}</div>
                           </div>
                       </div>
                       <div className="text-xl text-neutral-200 leading-relaxed font-light mb-8">
                           {data.content}
                       </div>
                       {data.image && (
                           <div className="rounded-2xl overflow-hidden border border-white/10 mb-8">
                               <img src={data.image} alt="Full content" className="w-full h-auto" />
                           </div>
                       )}
                       <div className="border-t border-white/5 py-4 flex gap-8 text-neutral-400 text-sm">
                           <span><strong className="text-white">12</strong> Reposts</span>
                           <span><strong className="text-white">45</strong> Likes</span>
                       </div>
                   </div>
               )}
            </div>

            {isDM && (
               <div className="p-3 bg-[#0A0A0A] border-t border-white/10">
                  <div className="flex items-center gap-2 bg-[#161616] rounded-full px-2 py-2 border border-white/5 focus-within:border-[#1D9BF0] transition-colors">
                     <div className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 cursor-pointer"><Plus size={20} /></div>
                     <input 
                        autoFocus
                        className="flex-1 bg-transparent text-white outline-none px-2 text-sm" 
                        placeholder="Message..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => {
                            if(e.key === 'Enter' && replyText) {
                                onReply(data.id, replyText);
                                setReplyText('');
                            }
                        }}
                     />
                     <button 
                        onClick={() => { if(replyText) { onReply(data.id, replyText); setReplyText(''); }}}
                        className="p-2 bg-[#1D9BF0] rounded-full text-white hover:scale-105 transition-transform"
                     >
                        <ArrowRight size={20} />
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

// --- 6. MAIN APP CONTROLLER ---

export default function App() {
  const [feed, setFeed] = useState([INITIAL_COMPANION_NODE]); 
  const [degree, setDegree] = useState(0);
  const [notification, setNotification] = useState(null);
  const [fullView, setFullView] = useState(null); 
  const [inputValue, setInputValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [hasGlobalBadge, setHasGlobalBadge] = useState(false);
  
  const [isThinking, setIsThinking] = useState(false);

  const scrollRef = useRef(null);
  const hasProfile = feed.some(i => i.type === 'profile');
  const meta = useMetaActions(degree, hasProfile, fullView);

  useEffect(() => {
    setTimeout(() => {
      setNotification({
        id: 'sys-setup',
        type: 'onboarding',
        icon: 'lock',
        title: 'System Suggestion',
        message: 'Identity anchor required to unlock full graph features.',
        actionLabel: null 
      });
    }, 2500);
  }, []);

  useEffect(() => {
    if(scrollRef.current && !fullView) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [feed, fullView]);

  const handleDismiss = () => {
     if (!notification) return;
     const historyNode = {
         id: `ghost-${Date.now()}`,
         type: 'ghost',
         author: 'System',
         content: `Suggestion dismissed: ${notification.title}`,
         timestamp: 'Now',
         degree: degree
     };
     setFeed(prev => [...prev, historyNode]);
     setNotification(null);
  };

  // --- LLM & THREADING LOGIC ---
  const handleFeedReply = async (nodeId, text) => {
     // 1. Optimistic Update (User's message)
     let companionNodeId = null;
     
     setFeed(prev => {
        const lastNode = prev[prev.length - 1];
        let newNode = null;

        if (lastNode.id === nodeId && lastNode.type === 'dm') {
           // Append to last if continuous
           const updatedMessages = [...lastNode.messages, { id: `r-${Date.now()}`, from: 'me', content: text, time: 'Now' }];
           if(lastNode.author === 'Ripple') companionNodeId = lastNode.id;
           return prev.map((n, i) => i === prev.length - 1 ? { ...n, messages: updatedMessages } : n);
        } else {
           // Create new node if interrupted
           const originalNode = prev.find(n => n.id === nodeId);
           const newMessages = [...(originalNode?.messages || []), { id: `r-${Date.now()}`, from: 'me', content: text, time: 'Now' }];
           newNode = {
              id: `dm-cont-${Date.now()}`,
              type: 'dm',
              author: originalNode.author,
              avatar: originalNode.avatar,
              messages: newMessages,
              timestamp: 'Just now',
              degree: degree
           };
           if(originalNode.author === 'Ripple') companionNodeId = newNode.id;
           return [...prev, newNode];
        }
     });

     // 2. AI Reply Logic (Ripple Companion)
     if (companionNodeId) {
         setIsThinking(true);
         const systemPrompt = "You are Ripple, an AI companion in a decentralized social graph app. You are helpful, tech-savvy, and concise. Keep responses under 50 words.";
         const aiResponse = await callGemini(text, systemPrompt);
         
         setIsThinking(false);
         
         setFeed(prev => {
             return prev.map(node => {
                 if (node.id === companionNodeId || (node.id.startsWith('dm-cont') && node.author === 'Ripple')) {
                     // Find the LATEST Ripple node to append to
                     // Simplify: just append to the node we found (which might be the latest one we just created or the last one)
                     // Better approach: find the specific node ID we updated optimistically? 
                     // Actually, since we might have created a new node, we need to make sure we update THAT specific node instance.
                     
                     // If we created a new node, `companionNodeId` is that new ID.
                     // If we updated existing, it is that ID.
                     if (node.id === companionNodeId) {
                         return {
                             ...node,
                             messages: [...node.messages, { id: `ai-${Date.now()}`, from: 'them', content: aiResponse, time: 'Now' }]
                         };
                     }
                 }
                 return node;
             });
         });
     }
  };

  const handleAction = (action) => {
      if (action === 'create') setIsCreating(true);
      if (action === 'back') setFullView(null); 
      if (action === 'auth_options') {
          setFeed(prev => [...prev, {
              id: `auth-${Date.now()}`,
              type: 'auth_node',
              author: 'System',
              content: 'Auth Options',
              timestamp: 'Now',
              degree: 0
          }]);
      }
  };

  // --- MAGIC COMPOSE ---
  const handleMagicPolish = async () => {
      if(!inputValue) return;
      const original = inputValue;
      setInputValue("Polishing with magic..."); // simple loading state
      const prompt = `Rewrite this social media post to be engaging and professional: "${original}"`;
      const polished = await callGemini(prompt);
      setInputValue(polished);
  };

  const handleSubmit = () => {
     if (!inputValue) return;
     if (!hasProfile) {
        setFeed(prev => [...prev, {
           id: 'profile-1',
           type: 'profile',
           author: inputValue,
           handle: `@${inputValue.toLowerCase()}`,
           avatar: inputValue[0].toUpperCase(),
           content: 'Identity Anchored.',
           timestamp: 'Now',
           degree: 0,
           isMe: true 
        }]);
        setNotification(null); 
        setTimeout(() => { setHasGlobalBadge(true); }, 2000);
     } else {
        setFeed(prev => [...prev, {
           id: `post-${Date.now()}`,
           type: 'post',
           author: 'You',
           handle: '@me',
           avatar: 'Y',
           content: inputValue,
           timestamp: 'Now',
           degree: degree
        }]);
     }
     setInputValue('');
     setIsCreating(false);
  };

  const openProfile = (data) => {
      const isMe = data.isMe || data.author === 'You';
      const profileData = { ...data, isProfileView: true, type: 'profile', isMe };
      setFullView(profileData);
  };

  const openThread = (data) => {
      setFullView(data);
  };

  const handleSync = () => {
      const globalContent = generateGlobalContent();
      setFeed(prev => [
          ...prev.filter(n => n.type !== 'sync_node'), 
          ...globalContent
      ]);
      setHasGlobalBadge(false);
  };

  const visibleFeed = useMemo(() => {
      const filtered = feed.filter(item => {
         if (degree === 0) return item.degree === 0;
         if (degree === 1) return item.degree === 1;
         if (degree === 2) return item.degree === 2;
         return false;
      });

      if (degree === 2 && hasGlobalBadge && !filtered.some(n => n.type === 'sync_node')) {
          const previewContent = generateGlobalContent();
          const teaserName = previewContent.length > 0 ? previewContent[0].author : "Network";
          return [...filtered, { id: 'sync-trigger', type: 'sync_node', degree: 2, teaser: teaserName }];
      }

      return filtered;
  }, [feed, degree, hasGlobalBadge]);

  const showPill = !fullView || (fullView && fullView.type !== 'dm');

  return (
    <div className={`h-screen w-full ${THEME.bg} flex flex-col font-sans text-white overflow-hidden relative`}>
       
       {fullView && <FullView data={fullView} onClose={() => setFullView(null)} onReply={handleFeedReply} isThinking={isThinking} />}

       {!fullView && (
         <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none">
            <div className={`flex items-center p-1 rounded-full pointer-events-auto shadow-2xl ${THEME.pill}`}>
               {DEGREES.map(d => (
                  <button 
                     key={d.id}
                     onClick={() => setDegree(d.id)}
                     className={`
                        px-5 py-2 rounded-full text-xs font-bold transition-all relative
                        ${degree === d.id ? 'bg-[#E7E9EA] text-black' : 'text-[#71767B] hover:text-white'}
                     `}
                  >
                     {d.label}
                     {d.id === 2 && hasGlobalBadge && (
                         <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-black" />
                     )}
                  </button>
               ))}
            </div>
         </div>
       )}

       {notification && !fullView && (
          <NotificationOverlay 
             data={notification} 
             onDismiss={handleDismiss}
             onReply={() => {}} 
             onAction={() => {}}
          />
       )}

       <div ref={scrollRef} className="flex-1 overflow-y-auto pt-24 pb-32 px-4 scroll-smooth">
          <div className="min-h-full flex flex-col justify-end max-w-md mx-auto">
             {visibleFeed.map((node, idx) => (
                <Node 
                   key={node.id} 
                   data={node} 
                   isLast={idx === visibleFeed.length - 1}
                   onClick={openThread}
                   onAvatarClick={openProfile}
                   onInlineReply={handleFeedReply}
                   onSync={handleSync}
                   isThinking={isThinking}
                />
             ))}

             {visibleFeed.length === 0 && !isCreating && (
                 <div className="flex flex-col items-center justify-center mb-10 opacity-30">
                     <Ghost size={24} className="text-[#333] mb-2" />
                     <p className="text-xs text-[#555]">Empty Feed</p>
                 </div>
             )}

             {isCreating && (
                <div className="mt-4 p-5 bg-[#111] border border-white/10 rounded-3xl animate-in slide-in-from-bottom-4 shadow-2xl">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-[#71767B] uppercase tracking-widest">
                         {hasProfile ? 'New Post' : 'Anchor Identity'}
                      </span>
                      <button onClick={() => setIsCreating(false)}><X size={16} className="text-[#71767B] hover:text-white" /></button>
                   </div>
                   <div className="relative">
                       <input 
                          autoFocus
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          placeholder={hasProfile ? "What's happening?" : "Choose a handle..."}
                          className="w-full bg-transparent text-xl text-white outline-none placeholder-[#333] mb-4 pr-8"
                          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                       />
                       {/* MAGIC POLISH BUTTON */}
                       <button onClick={handleMagicPolish} className="absolute right-0 top-0 text-[#71767B] hover:text-[#1D9BF0] transition-colors">
                           <Sparkles size={18} />
                       </button>
                   </div>
                   <div className="flex justify-end">
                      <button onClick={handleSubmit} className="px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors">
                         {hasProfile ? 'Post' : 'Create'}
                      </button>
                   </div>
                </div>
             )}
          </div>
       </div>

       {/* BOTTOM PILL */}
       {showPill && (
         <div className="absolute bottom-8 left-0 right-0 flex justify-center z-[70] pointer-events-none">
            <div className={`flex items-center gap-4 px-3 py-2 rounded-full pointer-events-auto shadow-2xl transition-all ${THEME.pill}`}>
               <div className="w-10 h-10 flex items-center justify-center">
                  {meta.left ? (
                     <button onClick={() => handleAction(meta.left.action)} className="w-full h-full flex items-center justify-center rounded-full text-[#71767B] hover:text-white hover:bg-white/10">
                        {meta.left.icon}
                     </button>
                  ) : <div className="w-3 h-3 rounded-full border-2 border-[#222] border-dashed" />}
               </div>

               <button 
                  onClick={() => handleAction(meta.center.action)}
                  className={`
                     w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform
                     ${isCreating ? 'bg-[#222] text-[#555] rotate-45' : 'bg-[#E7E9EA] text-black hover:scale-105'}
                  `}
               >
                  {meta.center.icon}
               </button>

               <div className="w-10 h-10 flex items-center justify-center">
                  {meta.right ? (
                     <button onClick={() => handleAction(meta.right.action)} className="w-full h-full flex items-center justify-center rounded-full text-[#71767B] hover:text-white hover:bg-white/10">
                        {meta.right.icon}
                     </button>
                  ) : <div className="w-3 h-3 rounded-full border-2 border-[#222] border-dashed" />}
               </div>
            </div>
         </div>
       )}

    </div>
  );
}