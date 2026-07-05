import React, { useState, useEffect, useRef } from 'react';
import { AppView, Message, StrangerPersona, SimulationConfig } from '../types';
import { STRANGER_PERSONAS } from '../data/personas';
import { io, Socket } from 'socket.io-client';

const playNotificationSound = (type: 'connect' | 'message') => {
  const enabled = localStorage.getItem('instrupy_enable_sound') !== 'false';
  if (!enabled) return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'connect') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    console.warn('Audio sound failed to play', e);
  }
};

interface ChatViewProps {
  mode: AppView;
  interests: string[];
  onBackToHome: () => void;
}

export default function ChatView({ mode, interests, onBackToHome }: ChatViewProps) {
  // Chat state
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      sender: 'system',
      text: 'Welcome! Click the blue "New" button to match with a random stranger.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [matchedPersona, setMatchedPersona] = useState<StrangerPersona | null>(null);
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [isStrangerVideoReady, setIsStrangerVideoReady] = useState(false);

  // Camera and Audio status
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCamEnabled, setIsCamEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const strangerVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');

  // Skip/Stop state machine
  // States: 'idle' (shows 'Stop') | 'really' (shows 'Really?') | 'new' (shows 'New')
  const [skipState, setSkipState] = useState<'idle' | 'really' | 'new'>('new');

  // Real-time backend
  const socketRef = useRef<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  // Simulation controls state
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [simConfig, setSimConfig] = useState<SimulationConfig>({
    autoReply: true,
    strangerDisconnectProbability: 0,
    selectedPersonaId: 'random',
  });
  const [customReplyText, setCustomReplyText] = useState('');
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  // Refs for auto-scroll and timer intervals
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const matchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userLocation, setUserLocation] = useState<{countryName: string, countryCode: string} | null>(null);

  useEffect(() => {
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then(res => res.json())
      .then(data => {
        setUserLocation({
          countryName: data.country || 'Unknown',
          countryCode: data.country_code || 'UN'
        });
      })
      .catch(() => {
        setUserLocation({ countryName: 'Unknown', countryCode: 'UN' });
      });
  }, []);

  const mainBodyRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [screenType, setScreenType] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1150) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setScreenType('mobile');
      } else if (w < 1150) {
        setScreenType('tablet');
      } else {
        setScreenType('desktop');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isConnected && strangerVideoRef.current && remoteStreamRef.current) {
      strangerVideoRef.current.srcObject = remoteStreamRef.current;
      strangerVideoRef.current.play().then(() => setIsStrangerVideoReady(true)).catch(e => console.warn(e));
    }
  }, [isConnected]);

  // Handle Resize for height fix
  useEffect(() => {
    if (!mainBodyRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(mainBodyRef.current);
    return () => observer.disconnect();
  }, [mode]);

  const updateDevicesList = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setVideoDevices([
          { deviceId: 'webcam-1', kind: 'videoinput', label: 'Integrated HD Webcam', groupId: 'g1' } as MediaDeviceInfo,
          { deviceId: 'external-cam-2', kind: 'videoinput', label: 'External USB Camera', groupId: 'g2' } as MediaDeviceInfo
        ]);
        setAudioDevices([
          { deviceId: 'mic-1', kind: 'audioinput', label: 'Default System Mic', groupId: 'g3' } as MediaDeviceInfo,
          { deviceId: 'mic-2', kind: 'audioinput', label: 'Headset Microphone', groupId: 'g4' } as MediaDeviceInfo
        ]);
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      let videoInputs = devices.filter(d => d.kind === 'videoinput');
      let audioInputs = devices.filter(d => d.kind === 'audioinput');

      if (videoInputs.length === 0) {
        videoInputs = [
          { deviceId: 'webcam-1', kind: 'videoinput', label: 'Integrated HD Webcam', groupId: 'g1' } as MediaDeviceInfo,
          { deviceId: 'external-cam-2', kind: 'videoinput', label: 'External USB Camera', groupId: 'g2' } as MediaDeviceInfo
        ];
      }
      if (audioInputs.length === 0) {
        audioInputs = [
          { deviceId: 'mic-1', kind: 'audioinput', label: 'Default System Mic', groupId: 'g3' } as MediaDeviceInfo,
          { deviceId: 'mic-2', kind: 'audioinput', label: 'Headset Microphone', groupId: 'g4' } as MediaDeviceInfo
        ];
      }

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);
      if (videoInputs.length > 0 && !selectedVideoId) {
        setSelectedVideoId(videoInputs[0].deviceId);
      }
      if (audioInputs.length > 0 && !selectedAudioId) {
        setSelectedAudioId(audioInputs[0].deviceId);
      }
    } catch (e) {
      console.warn('Error listing devices', e);
      setVideoDevices([
        { deviceId: 'webcam-1', kind: 'videoinput', label: 'Integrated HD Webcam', groupId: 'g1' } as MediaDeviceInfo,
        { deviceId: 'external-cam-2', kind: 'videoinput', label: 'External USB Camera', groupId: 'g2' } as MediaDeviceInfo
      ]);
      setAudioDevices([
        { deviceId: 'mic-1', kind: 'audioinput', label: 'Default System Mic', groupId: 'g3' } as MediaDeviceInfo,
        { deviceId: 'mic-2', kind: 'audioinput', label: 'Headset Microphone', groupId: 'g4' } as MediaDeviceInfo
      ]);
    }
  };

  useEffect(() => {
    updateDevicesList();

    // Connect to backend dynamically via Vite proxy
    socketRef.current = io('/');

    const setupWebRTC = async (room: string, isInitiator: boolean) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      iceCandidateQueue.current = [];
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
      }

      pc.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (strangerVideoRef.current) {
          strangerVideoRef.current.srcObject = event.streams[0];
          strangerVideoRef.current.play().then(() => setIsStrangerVideoReady(true)).catch(e => console.warn(e));
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit('webrtc_ice_candidate', { roomId: room, candidate: event.candidate });
        }
      };

      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('webrtc_offer', { roomId: room, sdp: offer });
      }
    };

    socketRef.current.on('connected_to_stranger', (data) => {
      setRoomId(data.roomId);
      roomIdRef.current = data.roomId;
      setIsConnecting(false);
      setIsConnected(true);
      playNotificationSound('connect');
      
      if (mode === 'CHAT_VIDEO') {
        setupWebRTC(data.roomId, data.isInitiator);
      }
      
      setMessages(prev => {
        const msgs = [...prev];
        msgs.push({ id: Math.random().toString(), sender: 'system', text: "You're now chatting with a random stranger! Say hi!", timestamp: new Date() });
        if (data.partnerLocation && data.partnerLocation.countryName) {
           msgs.push({
             id: Math.random().toString(),
             sender: 'country',
             text: data.partnerLocation.countryName,
             countryCode: data.partnerLocation.countryCode,
             timestamp: new Date()
           });
        }
        return msgs;
      });
    });

    socketRef.current.on('receive_message', (data) => {
      setIsStrangerTyping(false);
      setMessages(prev => [
        ...prev,
        { id: Math.random().toString(), sender: 'stranger', text: data.message, timestamp: new Date() }
      ]);
      playNotificationSound('message');
    });

    socketRef.current.on('stranger_typing', (data) => {
      setIsStrangerTyping(data.isTyping);
    });

    socketRef.current.on('stranger_disconnected', (data) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (strangerVideoRef.current) {
        strangerVideoRef.current.srcObject = null;
      }
      remoteStreamRef.current = null;
      setIsStrangerVideoReady(false);
      
      setIsConnected(false);
      setIsStrangerTyping(false);
      setRoomId(null);
      roomIdRef.current = null;
      setMessages(prev => [
        ...prev,
        { id: Math.random().toString(), sender: 'system', text: 'Stranger has disconnected.', timestamp: new Date() }
      ]);
      
      if (data && data.autoSkip) {
        setTriggerAutoSkip(true);
      } else {
        setSkipState('new');
      }
    });

    socketRef.current.on('stranger_reported_you', () => {
      setMessages(prev => [
        ...prev,
        { id: Math.random().toString(), sender: 'system', text: 'Stranger reported you for inappropriate behavior.', timestamp: new Date() }
      ]);
    });

    socketRef.current.on('webrtc_offer', async (data) => {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      if (socketRef.current && roomIdRef.current) {
        socketRef.current.emit('webrtc_answer', { roomId: roomIdRef.current, sdp: answer });
      }
      
      for (const candidate of iceCandidateQueue.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      }
      iceCandidateQueue.current = [];
    });

    socketRef.current.on('webrtc_answer', async (data) => {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data));
      
      for (const candidate of iceCandidateQueue.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e));
      }
      iceCandidateQueue.current = [];
    });

    socketRef.current.on('webrtc_ice_candidate', async (data) => {
      if (!peerConnectionRef.current) return;
      if (!peerConnectionRef.current.remoteDescription) {
        iceCandidateQueue.current.push(data);
        return;
      }
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data));
      } catch (e) {
        console.error('Error adding ice candidate', e);
      }
    });

    return () => {
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [mode]);

  const [triggerAutoSkip, setTriggerAutoSkip] = useState(false);
  useEffect(() => {
    if (triggerAutoSkip) {
      setTriggerAutoSkip(false);
      startConnecting();
    }
  }, [triggerAutoSkip]);

  // Smart auto-scrolling: only scrolls to bottom if already scrolled to latest or if it's the user's own message
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage && lastMessage.sender === 'you';
    const isSystemOrNewChat = lastMessage && (lastMessage.sender === 'system' && (lastMessage.text.includes('Welcome!') || lastMessage.text.includes('Looking for')));

    if (isMyMessage || isSystemOrNewChat) {
      container.scrollTop = container.scrollHeight;
    } else {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, isStrangerTyping]);

  // Handle local video streams in Video Mode
  useEffect(() => {
    if (mode === 'CHAT_VIDEO' && isCamEnabled) {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia is not supported or permitted in this environment');
        setIsCamEnabled(false);
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: selectedVideoId ? { deviceId: { exact: selectedVideoId } } : true,
        audio: selectedAudioId ? { deviceId: { exact: selectedAudioId } } : true,
      };

      const updatePeerConnection = (newStream: MediaStream) => {
        if (peerConnectionRef.current) {
          const videoTrack = newStream.getVideoTracks()[0];
          const audioTrack = newStream.getAudioTracks()[0];
          const senders = peerConnectionRef.current.getSenders();
          
          if (videoTrack) {
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender) videoSender.replaceTrack(videoTrack).catch(e => console.warn(e));
          }
          if (audioTrack) {
            const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
            if (audioSender) audioSender.replaceTrack(audioTrack).catch(e => console.warn(e));
          }
        }
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          setHasMediaPermission(true);
          setLocalStream(stream);
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          updatePeerConnection(stream);
          updateDevicesList();
        })
        .catch(err => {
          console.warn('Error accessing camera/microphone with constraints:', err);
          // Fallback to default if device-specific constraints fail
          if (selectedVideoId || selectedAudioId) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
              .then(stream => {
                setHasMediaPermission(true);
                setLocalStream(stream);
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                  localVideoRef.current.srcObject = stream;
                }
                updatePeerConnection(stream);
                updateDevicesList();
              })
              .catch(fallbackErr => {
                console.warn('Fallback getUserMedia failed:', fallbackErr);
                setHasMediaPermission(false);
                setIsCamEnabled(false);
              });
          } else {
            setHasMediaPermission(false);
            setIsCamEnabled(false);
          }
        });
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode, isCamEnabled, selectedVideoId, selectedAudioId]);

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamEnabled(videoTrack.enabled);
      }
    } else {
      setIsCamEnabled(prev => !prev);
    }
  };

  // Keyboard shortcut: Escape to Stop/Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.repeat) {
        e.preventDefault();
        handleStopSkipAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skipState, isConnected, isConnecting, matchedPersona]);

  const [hasMediaPermission, setHasMediaPermission] = useState(false);

  // Initialize a new connection
  const startConnecting = async () => {
    if (mode === 'CHAT_VIDEO' && !hasMediaPermission) {
      addSystemMessage("Error: Camera and Microphone access denied. Please grant permissions to search in Video Mode.");
      return;
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (matchTimerRef.current) clearTimeout(matchTimerRef.current);

    setMessages([]);
    setIsConnecting(true);
    setIsConnected(false);
    setMatchedPersona(null);
    setRoomId(null);
    roomIdRef.current = null;
    setIsStrangerVideoReady(false);
    setSkipState('idle');
    setCustomReplyText('');
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (strangerVideoRef.current) {
      strangerVideoRef.current.srcObject = null;
    }
    
    setSharedInterests([]);

    // Retrieve settings
    const langCode = localStorage.getItem('instrupy_language') || 'en';
    const langNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese'
    };
    const currentLangName = langNames[langCode] || 'English';

    const college = localStorage.getItem('instrupy_college') || '';
    const isCollegeVerified = !!localStorage.getItem('instrupy_college_verified');
    const strict = localStorage.getItem('instrupy_strict_match') === 'true';

    let searchMsg = 'Looking for someone you can chat with...';
    if (isCollegeVerified && college) {
      searchMsg = `Looking for other students from your college environment (${college.split('@')[1] || 'edu'})...`;
    } else if (strict && interests.length > 0) {
      searchMsg = `Strict Match active: Finding users who share: ${interests.join(', ')}...`;
    } else if (langCode !== 'en') {
      searchMsg = `Looking for someone speaking ${currentLangName}...`;
    }

    addSystemMessage(searchMsg);

    let currentLocation = userLocation;
    if (!currentLocation) {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        currentLocation = {
          countryName: data.country || 'Unknown',
          countryCode: data.country_code || 'UN'
        };
        setUserLocation(currentLocation);
      } catch (err) {
        currentLocation = { countryName: 'Unknown', countryCode: 'UN' };
        setUserLocation(currentLocation);
      }
    }

    if (socketRef.current) {
      socketRef.current.emit('start_search', { mode, interests, location: currentLocation });
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
    };
  }, []);

  const addSystemMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      { id: Math.random().toString(), sender: 'system', text, timestamp: new Date() }
    ]);
  };

  const handleConfirmReport = () => {
    setShowReportConfirm(false);
    addSystemMessage('You reported this stranger');
    
    if (isConnected && socketRef.current && roomId) {
      socketRef.current.emit('report_user', { roomId });
    }
  };

  const scheduleStrangerMessage = (text: string, persona: StrangerPersona, initialDelay = 1000) => {
    setIsStrangerTyping(true);

    const charCount = text.length;
    const typingTime = Math.max(800, charCount * (persona.typingSpeed / 1.5)); // slightly speed up simulated text

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      setIsStrangerTyping(false);
      setMessages(prev => [
        ...prev,
        { id: Math.random().toString(), sender: 'stranger', text, timestamp: new Date() }
      ]);
      
      // Play pop notification sound
      playNotificationSound('message');
    }, initialDelay + typingTime);
  };

  const handleSendMessage = () => {
    const cleanMsg = inputMessage.trim();
    if (!cleanMsg) return;

    if (isConnected) {
      setMessages(prev => [
        ...prev,
        { id: Math.random().toString(), sender: 'you', text: cleanMsg, timestamp: new Date() }
      ]);

      if (socketRef.current && roomId) {
        socketRef.current.emit('send_message', { roomId, message: cleanMsg });
        socketRef.current.emit('typing', { roomId, isTyping: false });
      }
    }

    setInputMessage('');
  };

  const handleStopSkipAction = () => {
    if (isConnecting) {
      setIsConnecting(false);
      if (matchTimerRef.current) clearTimeout(matchTimerRef.current);
      if (socketRef.current) socketRef.current.emit('stop_search');
      addSystemMessage('Stranger searching stopped.');
      setSkipState('new');
      return;
    }

    if (skipState === 'new') {
      startConnecting();
    } else if (skipState === 'idle') {
      if (isConnected) {
        setSkipState('really');
      } else {
        startConnecting();
      }
    } else if (skipState === 'really') {
      setIsConnected(false);
      addSystemMessage('Stranger has logged out.');
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setIsStrangerTyping(false);
      
      const hasMessages = messages.some(m => m.sender === 'you' || m.sender === 'stranger');
      if (socketRef.current && roomId) {
        socketRef.current.emit('disconnect_stranger', { roomId, autoSkip: !hasMessages });
      }
      setRoomId(null);
      startConnecting();
    }
  };

  const handleForceStrangerReply = () => {
    if (!isConnected || !matchedPersona) return;
    const textToForce = customReplyText.trim() || "Hello!";
    scheduleStrangerMessage(textToForce, matchedPersona, 0);
    setCustomReplyText('');
  };

  const handleForceStrangerDisconnect = () => {
    if (!isConnected) return;
    setIsConnected(false);
    setIsStrangerTyping(false);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    addSystemMessage('Stranger has disconnected.');
    startConnecting();
  };

  let buttonText = 'New';
  let buttonStyle = 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 font-extrabold';

  if (isConnecting) {
    buttonText = 'Stop';
    buttonStyle = 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100';
  } else if (isConnected) {
    if (skipState === 'really') {
      buttonText = 'Really?';
      buttonStyle = 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100 font-extrabold';
    } else {
      buttonText = 'Skip';
      buttonStyle = 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100';
    }
  } else {
    buttonText = 'New';
    buttonStyle = 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 font-extrabold';
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-white font-sans text-slate-900 rounded-none overflow-hidden select-none">
      
      {/* Classical Omegle Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-300 shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={onBackToHome}
            className="flex items-baseline cursor-pointer group"
          >
            <span className="text-2xl font-extrabold tracking-tighter text-[#1a0dab]">ins</span>
            <span className="text-2xl font-extrabold tracking-tighter text-[#ff8c00]">trupy</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Matching Interest Badge */}
          {interests.length > 0 && (
            <div className="hidden md:block text-xs text-slate-600 font-medium">
              Interests: <span className="font-bold text-blue-700">{interests.map(t => `#${t}`).join(', ')}</span>
            </div>
          )}

          {/* Red Report Button */}
          <button
            onClick={() => setShowReportConfirm(true)}
            className="px-3 py-1 text-xs font-bold text-rose-600 border border-rose-300 bg-white hover:bg-rose-50 transition-colors rounded-none cursor-pointer"
          >
            Report
          </button>
        </div>
      </header>

      {/* Main Body Grid */}
      <div
        ref={mainBodyRef}
        className={`flex-1 flex overflow-hidden ${
          screenType === 'desktop' ? 'flex-row' : 'flex-col'
        }`}
      >
        
        {/* Left Video Area (Only in VIDEO Mode) */}
        {mode === 'CHAT_VIDEO' && (() => {
          const isMobile = screenType === 'mobile';
          const isTablet = screenType === 'tablet';
          const isPC = screenType === 'desktop';

          const videoBoxHeight = (containerHeight - 22) / 2;

          let containerStyle: React.CSSProperties | undefined = undefined;
          if (isPC && containerHeight > 0) {
            containerStyle = { width: `${videoBoxHeight * (4 / 3) + 16}px` };
          } else if (isTablet) {
            containerStyle = { height: '280px', width: '100%' };
          }

          return (
            <div
              style={containerStyle}
              className={`relative bg-white p-2 shrink-0 min-h-0 ${
                isMobile
                  ? 'w-full max-h-[35dvh] aspect-[4/3] block mx-auto'
                  : isTablet
                  ? 'w-full flex flex-row items-center justify-center gap-3'
                  : 'h-full flex flex-col gap-1.5'
              }`}
            >
              
              {/* Stranger Cam Box */}
              <div
                style={
                  isPC && containerHeight > 0
                    ? { height: `${videoBoxHeight}px` }
                    : undefined
                }
                className={`bg-[#4a4a4a] border border-slate-300 rounded-lg overflow-hidden shadow-sm shrink-0 ${
                  isMobile
                    ? 'relative w-full h-full'
                    : isTablet
                    ? 'relative h-full aspect-[4/3]'
                    : 'relative w-full h-full md:h-auto'
                }`}
              >
                {/* Real stranger WebRTC render (Always mounted to prevent DOM shift animation resets on mobile) */}
                <video
                  ref={strangerVideoRef}
                  autoPlay
                  playsInline
                  onPlaying={() => setIsStrangerVideoReady(true)}
                  className={`w-full h-full object-cover scale-x-[-1] absolute inset-0 z-0 bg-[#4a4a4a] transition-opacity duration-300 ${isConnected && isStrangerVideoReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                />

                {(isConnecting || (isConnected && !isStrangerVideoReady)) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#4a4a4a] z-10">
                    <svg className="w-12 h-12 animate-spin text-white" viewBox="0 0 50 50">
                      <path
                        fill="currentColor"
                        d="M 47,25 A 22,22 0 1,1 25,3 A 20.5,20.5 0 1,0 47,25"
                      />
                    </svg>
                  </div>
                )}

                {!isConnected && !isConnecting && (
                  <div className="absolute inset-0 bg-[#4a4a4a] z-20"></div>
                )}
              </div>
  
              {/* You Cam Box */}
              <div
                style={
                  isPC && containerHeight > 0
                    ? { height: `${videoBoxHeight}px` }
                    : undefined
                }
                className={`bg-[#4a4a4a] rounded-lg overflow-hidden shadow-sm shrink-0 z-10 group ${
                  isMobile
                    ? 'absolute top-4 right-4 w-24 aspect-[4/3] border border-slate-400 shadow-2xl'
                    : isTablet
                    ? 'relative h-full aspect-[4/3] border border-slate-300'
                    : 'relative w-full h-full md:h-auto border border-slate-300'
                }`}
              >
                {isCamEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1] absolute inset-0 z-0"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#4a4a4a]"></div>
                )}

                {/* Hover overlay with dropdown selectors (desktop-only, half width for camera, half for mic) */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-950/90 text-white z-20 hidden lg:group-hover:flex items-center border-t border-slate-700 select-none divide-x divide-slate-700 font-sans">
                  {/* Camera Selector (left 50%) */}
                  <div className="w-1/2 h-full flex items-center px-2">
                    <select
                      value={selectedVideoId}
                      onChange={(e) => setSelectedVideoId(e.target.value)}
                      className="bg-transparent text-white text-[11px] outline-none border-none w-full cursor-pointer focus:ring-0 select-none truncate pr-1"
                    >
                      {videoDevices.length > 0 ? (
                        videoDevices.map((d, idx) => (
                          <option key={d.deviceId || idx} value={d.deviceId} className="bg-slate-900 text-white">
                            {d.label || `Camera ${idx + 1}`}
                          </option>
                        ))
                      ) : (
                        <option value="" className="bg-slate-900 text-white">Default Camera</option>
                      )}
                    </select>
                  </div>

                  {/* Mic Selector (right 50%) */}
                  <div className="w-1/2 h-full flex items-center px-2">
                    <select
                      value={selectedAudioId}
                      onChange={(e) => setSelectedAudioId(e.target.value)}
                      className="bg-transparent text-white text-[11px] outline-none border-none w-full cursor-pointer focus:ring-0 select-none truncate pr-1"
                    >
                      {audioDevices.length > 0 ? (
                        audioDevices.map((d, idx) => (
                          <option key={d.deviceId || idx} value={d.deviceId} className="bg-slate-900 text-white">
                            {d.label || `Microphone ${idx + 1}`}
                          </option>
                        ))
                      ) : (
                        <option value="" className="bg-slate-900 text-white">Default Mic</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
  
            </div>
          );
        })()}

        {/* Middle Message Log Container */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
          
          {/* Scrollable messages box */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col font-sans text-sm select-text">
            <div className="mt-auto flex flex-col">
            {messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="text-xs text-slate-500 font-mono italic my-[1px]">
                    {msg.text}
                  </div>
                );
              }

              if (msg.sender === 'country') {
                return (
                  <div key={msg.id} className="text-sm text-slate-950 font-semibold my-1.5 font-sans flex items-center gap-1.5">
                    {msg.countryCode && (
                      <img
                        src={`https://flagcdn.com/20x15/${msg.countryCode.toLowerCase()}.png`}
                        alt=""
                        className="w-[20px] h-[15px] object-cover align-middle border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span>{msg.text}</span>
                  </div>
                );
              }

              const isYou = msg.sender === 'you';
              return (
                <div key={msg.id} className="leading-snug py-[0.5px]">
                  <span className={`font-extrabold ${isYou ? 'text-[#ff0000]' : 'text-[#0000ff]'}`}>
                    {isYou ? 'You: ' : 'Stranger: '}
                  </span>
                  <span className="text-slate-800 break-words">{msg.text}</span>
                </div>
              );
            })}

            {isStrangerTyping && (
              <div className="text-xs text-slate-400 font-mono animate-pulse">
                Stranger is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom input form block */}
          <div className="p-2 pb-3.5 bg-white flex items-stretch gap-0 shrink-0">
            {/* ESC Stop/New Switch */}
            <button
              onClick={handleStopSkipAction}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              className={`w-20 sm:w-24 h-12 flex flex-col items-center justify-center font-bold text-sm tracking-wide border cursor-pointer select-none transition-colors rounded-none shrink-0 focus:outline-none focus:ring-0 focus-visible:outline-none ${buttonStyle}`}
              id="skip_action_button"
            >
              <span className="text-xs leading-none">
                {buttonText}
              </span>
              <span className="text-[9px] opacity-60 font-mono mt-0.5">Esc</span>
            </button>

            {/* Main Message Field */}
            <input
              ref={inputRef}
              type="text"
              placeholder={
                isConnected
                  ? "Type your message here..."
                  : isConnecting
                  ? "Looking for someone..."
                  : "Click 'New' to match with a stranger"
              }
              value={inputMessage}
              onChange={e => {
                setInputMessage(e.target.value);
                if (socketRef.current && roomId) {
                  socketRef.current.emit('typing', { roomId, isTyping: e.target.value.length > 0 });
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 min-w-0 bg-white border border-slate-400 px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-0 rounded-none disabled:bg-slate-100 disabled:cursor-not-allowed"
              id="chat_input_message"
            />

            {/* SEND button */}
            <button
              onClick={handleSendMessage}
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              disabled={!inputMessage.trim()}
              className={`w-20 sm:w-24 h-12 flex items-center justify-center font-bold text-sm uppercase tracking-wider border rounded-none cursor-pointer transition-colors shrink-0 focus:outline-none focus:ring-0 focus-visible:outline-none ${
                inputMessage.trim()
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
              }`}
              id="chat_send_button"
            >
              Send
            </button>
          </div>

        </div>

      </div>

      {showReportConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl p-6 max-w-sm w-full rounded-none animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-slate-800 mb-2 uppercase tracking-wider">Confirm Report</h3>
            <p className="text-sm text-slate-600 font-medium mb-6 leading-relaxed">
              Are you sure you want to report this stranger?
            </p>
            <div className="flex justify-end gap-3 font-mono">
              <button
                onClick={() => setShowReportConfirm(false)}
                className="px-4 py-2 text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors rounded-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
                className="px-4 py-2 text-xs font-bold border border-rose-600 text-white bg-rose-600 hover:bg-rose-700 transition-colors rounded-none cursor-pointer"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
