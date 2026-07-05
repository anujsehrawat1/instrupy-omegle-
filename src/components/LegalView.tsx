import React from 'react';
import { AppView } from '../types';

interface LegalViewProps {
  view: 'TERMS' | 'PRIVACY' | 'GUIDELINES';
  onBack: () => void;
}

export default function LegalView({ view, onBack }: LegalViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-2 bg-white font-sans text-[#222222]">
      {/* Top Header Banner */}
      <div className="border border-slate-300 p-4 bg-slate-50 mb-6 flex items-center justify-between gap-4 rounded-none">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline select-none">
            <span className="text-3xl font-extrabold tracking-tighter text-[#1a0dab]">ins</span>
            <span className="text-3xl font-extrabold tracking-tighter text-[#ff8c00]">trupy</span>
          </div>
          <span className="text-sm font-semibold italic text-slate-500">
            Legal, Liability & Safety Hub
          </span>
        </div>
        
        <button
          onClick={onBack}
          className="bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold px-4 py-1.5 rounded-none text-[#1a0dab] cursor-pointer"
        >
          ← Back to Home
        </button>
      </div>

      {view === 'TERMS' && (
        <div className="border border-slate-300 p-6 bg-white rounded-none">
          <h1 className="text-xl font-bold mb-4 text-rose-700 uppercase tracking-wide border-b border-rose-200 pb-2 flex items-center gap-2">
            ⚖️ TERMS OF SERVICE & COMPREHENSIVE LIABILITY WAIVER
          </h1>
          <p className="text-xs text-rose-600 font-bold mb-4 border-l-2 border-rose-500 pl-3 py-1">
            IMPORTANT LEGAL NOTICE: PLEASE READ THIS AGREEMENT CAREFULLY. BY ENROLLING, CLICKING TO CHAT, ENTERING TEXT, OR BROADCASTING STREAM CONTENT ON INSTRUPY, YOU ENTER INTO A BINDING LEGAL AGREEMENT WITH THE OPERATORS AND AGREE TO WAIVE SUBSTANTIAL LEGAL RIGHTS REGARDING LIABILITY, CIVIL CLAIMS, DAMAGES, AND LITIGATION.
          </p>
          
          <div className="space-y-5 text-xs text-slate-600 leading-relaxed text-justify">
            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">1. Acceptance of Agreement & Age Restrictions</strong>
              <p>
                By accessing, browsing, or utilizing the services provided by <strong>instrupy</strong> ("the Platform"), you confirm that you are at least 18 years of age. If you are under the age of 18, you are strictly prohibited from using the platform under any circumstances. We do not knowingly permit minors to access this platform. If you are a parent or legal guardian and discover that your minor child has bypassed access blockades to use this service, please immediately restrict their internet access. 
              </p>
              <p>
                If you do not agree to the complete Terms of Service, liability waivers, or privacy policy guidelines stated herein, your sole and exclusive remedy is to exit the Platform immediately and cease all interactions with our communication channels.
              </p>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">2. Nature of Platform & Zero Retention Architecture</strong>
              <p>
                instrupy acts purely as an automated, transient, peer-to-peer (P2P) signaling and connection mediator. The Platform does not control, supervise, verify, screen, or moderate real-time communications in progress. You explicitly acknowledge that any stranger you match with is a random internet user whose identity, intentions, age, location, and statements have NOT been checked, certified, or guaranteed by the Platform.
              </p>
              <p>
                Because the Platform utilizes a temporary, zero-storage client-side memory architecture, all text-transcripts, signaling streams, and user webcam buffers exist purely in the active memory of your browser. Disconnecting or skipping matches instantly purges this data. Consequently, the Platform operates with <strong>zero records</strong> of your conversation, meaning we have no capability to recover, audit, or review past interactions for forensic, civil, or private investigation purposes.
              </p>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">3. Complete Exclusion of Liability (Absolute Waiver)</strong>
              <p className="font-semibold text-slate-800">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL INSTRUPY, ITS CREATORS, DEVELOPERS, OPERATORS, SHAREHOLDERS, OR REPRESENTATIVES BE HELD LIABLE FOR ANY DAMAGES WHATSOEVER (INCLUDING, WITHOUT LIMITATION, DIRECT, INDIRECT, CONSEQUENTIAL, INCIDENTAL, SPECIAL, OR EXEMPLARY DAMAGES) ARISING OUT OF THE USE OF, OR INABILITY TO USE, THIS SERVICE.
              </p>
              <p>
                This total disclaimer of liability applies to, but is not limited to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>
                  <strong>Financial Fraud & Scams:</strong> Monetary losses, credit card details leaked, cryptocurrency transfers, or gift card scams perpetrated by deceptive strangers you match with under false pretenses.
                </li>
                <li>
                  <strong>Cybersecurity Vulnerabilities:</strong> Any hacking, IP leaking, malware injection, ransomware transfers, or fishing links distributed by malicious third-parties utilizing the chat box or WebRTC connection signaling.
                </li>
                <li>
                  <strong>Illegal Conduct & Crimes:</strong> Any unlawful behavior, harassment, threats, obscene materials, identity theft, or civil copyright infringements initiated by other users.
                </li>
                <li>
                  <strong>Physical or Mental Harm:</strong> Emotional distress, trauma, offline encounters, stalking, or any other negative real-world consequence resulting from sharing contact info or social media coordinates.
                </li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">4. Complete User Indemnification</strong>
              <p>
                You hereby agree to defend, indemnify, and hold completely harmless instrupy and its developers from and against any and all claims, lawsuits, administrative proceedings, liabilities, losses, costs, damages, and expenses (including attorney's fees) arising directly or indirectly from:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Your violation of these Terms of Service or Community Guidelines.</li>
                <li>Your interaction, speech, or video content broadcasted to other participants.</li>
                <li>Any illegal acts, privacy infringements, or intellectual property violations committed by you.</li>
                <li>Your negligent or intentional misuse of the connection environment.</li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">5. Zero Warranties & "As-Is" Access</strong>
              <p>
                This Platform is provided on an <strong>"AS-IS"</strong> and <strong>"AS-AVAILABLE"</strong> basis, with all faults and without warranties of any kind. We explicitly disclaim all representations, conditions, or guarantees (implied, statutory, or otherwise), including warranties of merchantability, fitness for a particular purpose, non-infringement, security, uptime, speed, or accuracy of matching.
              </p>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">6. Governing Law & Dispute Resolution</strong>
              <p>
                Any legal action, claim, or dispute arising out of or relating to these terms or your use of instrupy shall be governed by, and construed in accordance with, the local laws of the operator's jurisdiction, without regard to conflict of law principles. You agree to submit to the exclusive personal jurisdiction and venue of the courts located within that territory for the adjudication of any legal actions.
              </p>
              <p>
                Should any provision of these Terms be found invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect, and the invalid clause shall be severed or modified to the minimum extent necessary to make it valid and enforceable.
              </p>
            </section>
          </div>
        </div>
      )}

      {view === 'PRIVACY' && (
        <div className="border border-slate-300 p-6 bg-white rounded-none">
          <h1 className="text-xl font-bold mb-4 text-[#1a0dab] uppercase tracking-wide border-b border-slate-200 pb-2">
            🔒 EXTENSIVE PRIVACY POLICY & ANONYMITY SYSTEM
          </h1>
          <p className="text-xs text-rose-600 font-semibold mb-4 border-l-2 border-rose-500 pl-3 py-1">
            Effective Date: July 4, 2026. This policy outlines how instrupy guarantees anonymity and handles data.
          </p>
          
          <div className="space-y-5 text-xs text-slate-600 leading-relaxed text-justify">
            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">1. The Principle of Zero-Retention Privacy</strong>
              <p>
                Our core architectural value is absolute user privacy and zero data tracking. Unlike typical commercial networks, we do not require registration, login, email authentication, or phone verification to chat.
              </p>
              <p>
                We do not maintain server-side databases to store your private conversation transcripts, webcam frames, or chat signaling logs. The moment you click <strong>"SKIP"</strong>, <strong>"STOP"</strong>, or close your browser tab, all ephemeral chat objects are permanently erased from your device's active RAM memory. Because of this zero-retention design, there are no log files or chat histories in our backend to be compromised, hacked, subpoenaed, or leaked.
              </p>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">2. Local Storage Preferences</strong>
              <p>
                To provide a persistent setup experience, we utilize your browser's local sandbox storage (<code>localStorage</code>) to save non-identifiable user configurations. These configurations are stored exclusively on your hardware and are never transmitted to our servers or third parties. Stored configurations include:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li><strong>Language Preference:</strong> Your selected language code (e.g., Hindi, English, Spanish).</li>
                <li><strong>Strict Matching:</strong> Whether you want matchmaking to prioritize users sharing exact interest tags.</li>
                <li><strong>Audio Choices:</strong> Whether notification sounds are toggled on or off.</li>
                <li><strong>Daily Poll Status:</strong> Whether you have submitted a vote on the daily homepage poll, and your device's poll vote cache.</li>
                <li><strong>College Matching Verification:</strong> If you verify your university email, a secure, local <code>edu</code> verified flag is stored. Your raw, plain-text email is <strong>never</strong> saved, tracked, or shared.</li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">3. Third-Party Connections & WebRTC Signaling</strong>
              <p>
                When utilizing Video Chat, connections are established via peer-to-peer media transport protocols (such as WebRTC signaling proxies). While signaling servers facilitate the initial handshake, the resulting media and text traffic are distributed directly between the matched users' browsers. You acknowledge that because WebRTC sets up direct peer channels, sophisticated attackers may attempt to resolve your network IP address using specialized browser inspect tools. To mitigate this risk, we highly recommend using a Virtual Private Network (VPN) while interacting on public peer networks.
              </p>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">4. Forensic Law Enforcement Requests</strong>
              <p>
                Because our platform does not store personal names, phone numbers, permanent IPs, timestamps, or conversation logs, we have <strong>no data to retrieve or provide</strong> to law enforcement authorities, civil litigants, or private investigators. We cannot assist in tracking down, locating, or identifying a stranger you matched with, as no historical logs exist on our systems. If you encounter any user violating critical public laws or child protection regulations, please capture screens immediately to report to relevant authorities directly.
              </p>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">5. Cookies & Tracking</strong>
              <p>
                instrupy does not employ tracking cookies, tracking pixels, or user behavior analytics suites. We do not sell, rent, trade, or distribute your preferences to data brokers or advertising networks. Our platform is funded entirely out-of-pocket by developers who support free, anonymous, track-free communication on the web.
              </p>
            </section>
          </div>
        </div>
      )}

      {view === 'GUIDELINES' && (
        <div className="border border-slate-300 p-6 bg-white rounded-none">
          <h1 className="text-xl font-bold mb-4 text-[#ff8c00] uppercase tracking-wide border-b border-slate-200 pb-2">
            🛡️ COMPREHENSIVE COMMUNITY SAFETY GUIDELINES
          </h1>
          <p className="text-xs text-rose-600 font-semibold mb-4 border-l-2 border-rose-500 pl-3 py-1">
            Rules of Conduct: Help keep instrupy safe, clean, and cooperative.
          </p>
          
          <div className="space-y-5 text-xs text-slate-600 leading-relaxed text-justify">
            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">1. Human Dignity & Zero Harassment Policy</strong>
              <p>
                You must treat all chat participants with fundamental human respect. We enforce a zero-tolerance policy against:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Xenophobia, racism, religious discrimination, sexism, homophobia, or transphobia.</li>
                <li>Direct threats of physical violence, self-harm encouragement, extortion, or extortion threats.</li>
                <li>Stalking, targeted bullying, or systematic intimidation of other chatters.</li>
                <li>Sharing other people's private personal information (Doxing), including real-world addresses, phone numbers, or private social media links without explicit, mutual consent.</li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">2. Protection of Minors (Severe Notice)</strong>
              <p>
                You must not use the Platform if you are under 18 years of age. Users are strictly prohibited from utilizing our channels to target, contact, exploit, or cause harm to minors. Any suspicious behavior targeting minors will be blocked immediately. We encourage users to immediately contact law enforcement or reporting portals (like NCMEC) if they witness child exploitation online.
              </p>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">3. Commercial Spam, Bots, and Advertisers</strong>
              <p>
                instrupy is built exclusively for authentic human-to-human relationships. The following automated behaviors are strictly forbidden:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Deploying custom chat scripts, automated conversational bots, or scraper bots.</li>
                <li>Spamming marketing URLs, redirect links, or typing pre-programmed promotional sales messages.</li>
                <li>Attempting to manipulate or crash the matching loop by opening multiple parallel sessions on virtual browsers or sandboxed containers.</li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">4. Safe Video Broadcasting Standards</strong>
              <p>
                The Webcam Video Chat feature is strictly reserved for consensual, safe visual communication. You are explicitly forbidden from broadcasting:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Nudity, sexual acts, obscene or pornographic material.</li>
                <li>Violent, shocking, graphic, or bloody media.</li>
                <li>Prerecorded video files or static pictures masquerading as live webcam streams to deceive users.</li>
                <li>Illegal content, substances, or weapons.</li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <strong className="text-slate-800 uppercase font-bold text-sm block border-b border-slate-100 pb-0.5">5. Reporting and Community Defense</strong>
              <p>
                Our community depends on you! If you match with a bot, scammer, advertiser, or abusive user, use the <strong>"Report Abuse"</strong> buttons inside the active chat panel, or submit detailed logs to our Homepage Feedback & Abuse Report Box. We regularly analyze reported behavior logs and deploy automatic IP-level blocks to safeguard active, friendly chatters.
              </p>
            </section>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            localStorage.setItem('instrupy_consent_accepted', 'true');
            onBack();
          }}
          className="bg-[#1a0dab] hover:bg-[#0f0096] text-white font-bold uppercase text-xs tracking-wider px-8 py-3.5 rounded-none cursor-pointer transition-colors border border-[#1a0dab]"
        >
          I Accept - Return to Homepage
        </button>
      </div>
    </div>
  );
}
