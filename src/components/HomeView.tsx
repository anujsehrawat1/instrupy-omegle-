import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface HomeViewProps {
  interests: string[];
  setInterests: React.Dispatch<React.SetStateAction<string[]>>;
  onStartChat: (mode: AppView) => void;
}

const POPULAR_TAGS = ['gaming', 'music', 'coding', 'anime', 'memes', 'books', 'travel', 'movies', 'politics', 'chat'];

export default function HomeView({ interests, setInterests, onStartChat }: HomeViewProps) {
  const [tagInput, setTagInput] = useState('');

  const [strictMatch, setStrictMatch] = useState(() => localStorage.getItem('instrupy_strict_match') === 'true');
  const [enableSound, setEnableSound] = useState(() => localStorage.getItem('instrupy_enable_sound') !== 'false');

  // Pending chat mode state for legal consent dialog
  const [pendingChatMode, setPendingChatMode] = useState<AppView | null>(null);
  
  // Consent checkboxes
  const [checkAge, setCheckAge] = useState(false);
  const [checkLiability, setCheckLiability] = useState(false);
  const [checkPrivacy, setCheckPrivacy] = useState(false);

  useEffect(() => {
    localStorage.setItem('instrupy_strict_match', String(strictMatch));
  }, [strictMatch]);

  useEffect(() => {
    localStorage.setItem('instrupy_enable_sound', String(enableSound));
  }, [enableSound]);

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !interests.includes(cleanTag)) {
      setInterests(prev => [...prev, cleanTag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setInterests(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
      setTagInput('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-2 bg-white font-sans text-[#222222]">
      
      {/* Top Header Banner */}
      <div className="border border-slate-300 p-4 bg-slate-50 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline select-none">
            <span className="text-3xl font-extrabold tracking-tighter text-[#1a0dab]">ins</span>
            <span className="text-3xl font-extrabold tracking-tighter text-[#ff8c00]">trupy</span>
          </div>
          <span className="text-sm font-semibold italic text-slate-500">
            Talk to strangers!
          </span>
        </div>
      </div>

      {/* Intro block */}
      <div className="border border-slate-300 p-6 mb-6 rounded-none bg-white">
        <p className="text-sm leading-relaxed mb-4 text-justify">
          <strong>instrupy (ins-tru-py)</strong> is a simple, anonymous alternative way to meet new friends! When you use instrupy, you are picked completely at random to talk one-on-one with a stranger. To help you stay safe, all chats are completely anonymous unless you choose to share your identity (which is highly discouraged!). You can stop a chat at any time by clicking "Stop" or pressing the <strong>Escape</strong> key.
        </p>
        <p className="text-xs text-rose-600 font-semibold border-l-2 border-rose-500 pl-3 py-1">
          You must be 18 years or older to use instrupy. Chat logs are private, client-side, and deleted instantly upon disconnection.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Interest Panel */}
        <div className="md:col-span-2 border border-slate-300 p-5 bg-white rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                What do you want to talk about? (Add interests)
              </h2>
              {interests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInterests([])}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
            
            {/* Tag Inputs */}
            <div className="border border-slate-300 p-2 min-h-[44px] bg-white flex flex-wrap gap-1.5 focus-within:border-blue-500 mb-4 rounded-none">
              {interests.map(interest => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#f0f4f9] text-[#1a0dab] border border-blue-200 text-xs font-semibold rounded-none"
                >
                  #{interest}
                  <button
                    onClick={() => handleRemoveTag(interest)}
                    className="text-[#ff8c00] hover:text-red-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={interests.length === 0 ? "gaming, music, anime..." : "add more..."}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 min-w-[100px]"
              />
            </div>

            {/* Suggestions list */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Popular suggestions:
              </p>
              <div className="flex flex-wrap gap-1">
                {POPULAR_TAGS.map(tag => {
                  const isSelected = interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => isSelected ? handleRemoveTag(tag) : handleAddTag(tag)}
                      className={`text-xs px-2 py-0.5 border rounded-none transition-all ${
                        isSelected
                          ? 'bg-[#1a0dab] text-white border-[#1a0dab] font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Settings (Checkbox filter options) */}
            <div className="border-t border-slate-200 pt-4 mt-4 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Matching & Sound Filters:</span>
              <label className={`flex items-start gap-2 text-xs text-slate-700 select-none ${interests.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={strictMatch && interests.length > 0}
                  disabled={interests.length === 0}
                  onChange={e => setStrictMatch(e.target.checked)}
                  className={`mt-0.5 accent-[#1a0dab] ${interests.length === 0 ? 'cursor-not-allowed' : ''}`}
                />
                <span><strong>Strict Match:</strong> Try harder to pair only with users sharing active interests (requires longer waiting times).</span>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableSound}
                  onChange={e => setEnableSound(e.target.checked)}
                  className="mt-0.5 accent-[#1a0dab]"
                />
                <span><strong>Sound effects:</strong> Play notification sounds on connection events and incoming chat messages.</span>
              </label>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              * Adding interests helps pair you with strangers who share common hobbies. If no shared match is found, you will be paired with a random stranger.
            </p>
          </div>
        </div>

        {/* Start Buttons Panel */}
        <div className="border border-slate-300 p-5 bg-slate-50 rounded-none flex flex-col justify-center gap-4 text-center">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Start Chatting:
          </p>

          <button
            onClick={() => {
              const alreadyAccepted = localStorage.getItem('instrupy_consent_accepted') === 'true';
              if (alreadyAccepted) {
                onStartChat('CHAT_TEXT');
              } else {
                setPendingChatMode('CHAT_TEXT');
                setCheckAge(false);
                setCheckLiability(false);
                setCheckPrivacy(false);
              }
            }}
            className="w-full py-3.5 px-4 bg-[#1a0dab] hover:bg-[#0f0096] text-white font-extrabold uppercase text-sm tracking-wider rounded-none shadow-none cursor-pointer transition-colors"
            id="start_text_chat"
          >
            Text Chat
          </button>

          <div className="text-xs text-slate-400 font-bold">OR</div>

          <button
            onClick={() => {
              const alreadyAccepted = localStorage.getItem('instrupy_consent_accepted') === 'true';
              if (alreadyAccepted) {
                onStartChat('CHAT_VIDEO');
              } else {
                setPendingChatMode('CHAT_VIDEO');
                setCheckAge(false);
                setCheckLiability(false);
                setCheckPrivacy(false);
              }
            }}
            className="w-full py-3.5 px-4 bg-[#ff8c00] hover:bg-[#e07b00] text-white font-extrabold uppercase text-sm tracking-wider rounded-none shadow-none cursor-pointer transition-colors"
            id="start_video_chat"
          >
            Video Chat
          </button>

          <div className="border-t border-slate-300 pt-3 mt-1.5 text-left text-[11px] text-slate-600 space-y-1 bg-white p-2.5 border border-slate-200">
            <span className="font-bold text-[#1a0dab] block uppercase text-[10px] tracking-wider mb-0.5">LEGAL AGREEMENT PRE-REQUISITE</span>
            <p className="leading-relaxed">
              By clicking "Text Chat" or "Video Chat", you explicitly acknowledge and agree that you are <strong>18 years of age or older</strong>, and fully accept our binding <strong>Terms of Service</strong>, absolute <strong>Limitation of Liability (Waiver)</strong>, and zero-data retention <strong>Privacy Policy</strong> before continuing. You chat at your own risk.
            </p>
          </div>

          <p className="text-[10px] text-slate-500 leading-normal">
            Anonymity is preserved. Connections are client-side simulated for fast demonstration.
          </p>
        </div>

      </div>

      {/* Safety & Guidelines Section (New!) */}
      <div className="border border-slate-300 p-5 mt-6 bg-white rounded-none">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 border-b border-slate-200 pb-1">Safety Tips & Frequently Asked Questions</h3>
        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
          <div>
            <strong className="text-slate-800 block mb-0.5">1. How do I protect my privacy?</strong>
            Never share your name, age, gender, phone number, social handles, or address with random strangers online. If anyone asks for personal data or tries to redirect you to another site, please stop the chat instantly.
          </div>
          <div>
            <strong className="text-slate-800 block mb-0.5">2. Can I use webcam video chat safely?</strong>
            Webcam streams are client-side only. Do not stream anything offensive or personal. Report any suspicious behavior using the report tools during a video match.
          </div>
          <div>
            <strong className="text-slate-800 block mb-0.5">3. Does "Strict Match" actually work?</strong>
            Yes! If checked, our matchmaking algorithm will search primarily for active users who typed matching interest tags. If none are found, you will eventually match with any open chatter to minimize waiting times.
          </div>
        </div>
      </div>

      {/* Double Consent Verification Dialog */}
      {pendingChatMode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999] overflow-y-auto font-sans">
          <div className="bg-white border border-slate-300 max-w-xl w-full p-6 shadow-2xl relative text-slate-800 rounded-none">
            <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#1a0dab] uppercase tracking-widest">
                LEGAL REQUIREMENT: ACCEPT BEFORE CHATTING
              </h2>
              <button
                onClick={() => setPendingChatMode(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-2xl p-1 cursor-pointer leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-xs font-bold text-slate-700 mb-4 text-justify">
              To connect you anonymously, please review and check EACH of the following statements. This ensures a safe environment and protects all parties involved:
            </p>

            <div className="space-y-3.5 mb-5">
              {/* Checkbox 1 */}
              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer select-none hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={checkAge}
                  onChange={e => setCheckAge(e.target.checked)}
                  className="mt-1 accent-[#1a0dab] shrink-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-normal">
                  <strong>Age Verification:</strong> I confirm and warrant that I am at least <strong>18 years of age or older</strong>. I agree that under-age users are strictly prohibited.
                </span>
              </label>

              {/* Checkbox 2 */}
              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer select-none hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={checkLiability}
                  onChange={e => setCheckLiability(e.target.checked)}
                  className="mt-1 accent-[#1a0dab] shrink-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-normal">
                  <strong>Total Waiver of Liability:</strong> I agree that the developers, creators, owners, and operators of instrupy hold <strong>absolute zero liability</strong> for any illegal acts, physical or emotional harm, financial scams, hacking, or identity theft committed by matched strangers.
                </span>
              </label>

              {/* Checkbox 3 */}
              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 cursor-pointer select-none hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={checkPrivacy}
                  onChange={e => setCheckPrivacy(e.target.checked)}
                  className="mt-1 accent-[#1a0dab] shrink-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-normal">
                  <strong>Privacy & Zero Logs Agreement:</strong> I acknowledge that instrupy operates a <strong>strict zero-data retention policy</strong>. Chat transcripts are client-side only and wiped immediately upon disconnection. Therefore, no forensic logs can be retrieved.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                type="button"
                onClick={() => setPendingChatMode(null)}
                className="w-full sm:w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold uppercase text-xs tracking-wider rounded-none transition-colors border border-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!(checkAge && checkLiability && checkPrivacy)}
                onClick={() => {
                  localStorage.setItem('instrupy_consent_accepted', 'true');
                  onStartChat(pendingChatMode);
                  setPendingChatMode(null);
                }}
                className={`w-full sm:w-2/3 py-3 px-4 font-bold uppercase text-xs tracking-wider rounded-none transition-colors border ${
                  (checkAge && checkLiability && checkPrivacy)
                    ? 'bg-[#1a0dab] hover:bg-[#0f0096] text-white cursor-pointer border-[#1a0dab]'
                    : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                }`}
              >
                I Agree - Connect Me Now
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-4.5 text-center leading-normal border-t border-slate-100 pt-3">
              By clicking "I Agree", you enter into a binding covenant releasing the platform and its operators from any and all legal liabilities.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
