import { StrangerPersona } from '../types';

export const STRANGER_PERSONAS: StrangerPersona[] = [
  {
    id: 'casual_sam',
    name: 'Sam, 20',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    avatarColor: 'from-amber-400 to-orange-500',
    interests: [], // Default fallback
    countryName: 'United States',
    countryFlag: '🇺🇸',
    countryCode: 'us',
    greetings: [
      'hi!',
      'hey, how are you?',
      'm or f?',
      'what up',
      'asl?'
    ],
    messages: [
      { trigger: 'asl', response: '20 M California' },
      { trigger: 'm or f', response: 'm' },
      { trigger: 'where are you from', response: 'California, US. wbu?' },
      { trigger: 'how are you', response: 'doing good, just bored watching youtube. you?' },
      { trigger: 'what are you doing', response: 'nothing much, just chilling. school is out so got free time' },
      { trigger: 'hello', response: 'hey there!' },
      { trigger: 'hi', response: 'yo' },
      { trigger: 'what is your name', response: 'i am sam' },
    ],
    fallbackResponses: [
      'yeah true lol',
      'haha nice',
      'oh cool',
      'wait really?',
      'hmm interesting',
      'so what do you do for fun?',
      'lol that is funny',
      'i am just listening to some music right now',
      'nice meeting you!'
    ],
    typingSpeed: 40,
  },
  {
    id: 'gamer_alex',
    name: 'Alex, 21',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    avatarColor: 'from-cyan-400 to-blue-500',
    interests: ['gaming', 'fortnite', 'minecraft', 'steam', 'fps', 'anime', 'games', 'xbox', 'playstation', 'pc'],
    countryName: 'India',
    countryFlag: '🇮🇳',
    countryCode: 'in',
    greetings: [
      'yo! what games are you playing right now?',
      'hey! gaming interest matched! nice.',
      'sup! pc or console?',
      'hey! do you watch anime or play games?'
    ],
    messages: [
      { trigger: 'asl', response: '21 M Seattle' },
      { trigger: 'm or f', response: 'M' },
      { trigger: 'where are you from', response: 'Seattle, WA. High speed internet city haha' },
      { trigger: 'minecraft', response: 'i love minecraft! been playing since 2013. do you prefer creative or survival?' },
      { trigger: 'fortnite', response: 'add me on fortnite! we should squad up sometime.' },
      { trigger: 'anime', response: 'awesome! my favorite right now is Demon Slayer. What are you watching?' },
      { trigger: 'pc or console', response: 'built my own PC with an RTX 4070. What are you running on?' },
      { trigger: 'how are you', response: 'great! just finished a raid in my game' },
    ],
    fallbackResponses: [
      'add me on Discord! alex_gg#1337',
      'what is your favorite game of all time?',
      'bruh that is an epic win',
      'oof, lag is real today',
      'yeah i am mostly on Steam. so many indie games lately',
      'no way lol',
      'that is a solid take',
      'who is your favorite character?'
    ],
    typingSpeed: 30,
  },
  {
    id: 'musician_chloe',
    name: 'Chloe, 19',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    avatarColor: 'from-fuchsia-400 to-pink-500',
    interests: ['music', 'guitar', 'band', 'spotify', 'indie', 'singing', 'concert', 'taylor swift', 'rock', 'pop', 'jazz'],
    countryName: 'Canada',
    countryFlag: '🇨🇦',
    countryCode: 'ca',
    greetings: [
      'hey! what song do you have on repeat right now?',
      'hi! matched on music! what genres are you into?',
      'hello! do you play any instruments?',
      'hey! tell me your top 3 artists and i will guess your personality'
    ],
    messages: [
      { trigger: 'asl', response: '19 F Chicago' },
      { trigger: 'm or f', response: 'F' },
      { trigger: 'where are you from', response: 'Chicago! Music scene here is incredible' },
      { trigger: 'guitar', response: 'i play acoustic guitar! been writing some of my own indie songs.' },
      { trigger: 'taylor swift', response: 'OMG yes! folklore is literally a masterpiece.' },
      { trigger: 'how are you', response: 'doing great, just tuning my guitar right now!' },
      { trigger: 'instrument', response: 'i play guitar and piano. wbu? do you play anything?' },
    ],
    fallbackResponses: [
      'that is going on my playlist for sure',
      'oh i love that artist!',
      'i am going to a local indie show tomorrow, super excited',
      'do you like concert festivals?',
      'listening to music is literally therapy',
      'wow, your taste is elite',
      'lol nice',
      'have you heard the new Billie Eilish track?'
    ],
    typingSpeed: 45,
  },
  {
    id: 'techie_ryan',
    name: 'Ryan, 22',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    avatarColor: 'from-emerald-400 to-teal-500',
    interests: ['coding', 'programming', 'ai', 'tech', 'javascript', 'python', 'startup', 'web', 'dev', 'computer', 'software'],
    countryName: 'India',
    countryFlag: '🇮🇳',
    countryCode: 'in',
    greetings: [
      'console.log("Hello stranger!");',
      'hey! are you a fellow developer or just tech enthusiast?',
      'sup! tabs or spaces?',
      'hello! let us talk about the future of AI'
    ],
    messages: [
      { trigger: 'asl', response: '22 M Austin' },
      { trigger: 'm or f', response: 'M' },
      { trigger: 'where are you from', response: 'Austin, Texas! Startup central' },
      { trigger: 'tabs or spaces', response: 'spaces, definitely. 2 spaces for web dev, 4 for Python!' },
      { trigger: 'python', response: 'Python is great for AI/ML! I use it with PyTorch.' },
      { trigger: 'javascript', response: 'React and Tailwind is my favorite stack. Super clean!' },
      { trigger: 'how are you', response: 'coding up a project and taking a short Omegle break' },
    ],
    fallbackResponses: [
      'that makes complete sense logically',
      'have you tried building anything with the new Gemini 1.5/2.0 API? It is insanely good',
      'clean code = clean mind',
      'haha true, stackoverflow is my home page',
      'what programming languages are you learning?',
      'that is a solid tech stack',
      'git commit -m "happy chat"',
      'wow, cool project concept'
    ],
    typingSpeed: 25, // Coders type fast!
  },
  {
    id: 'philosopher_maya',
    name: 'Maya, 23',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    avatarColor: 'from-indigo-400 to-purple-500',
    interests: ['books', 'reading', 'philosophy', 'history', 'writing', 'travel', 'art', 'poetry', 'psychology'],
    countryName: 'United Kingdom',
    countryFlag: '🇬🇧',
    countryCode: 'gb',
    greetings: [
      'hey there! if you could travel anywhere right now, where would you go?',
      'hi! what is a book that completely changed your perspective on life?',
      'hello! matched on reading/philosophy, let us have a deep conversation!',
      'hey! what are your thoughts on modern stoicism?'
    ],
    messages: [
      { trigger: 'asl', response: '23 F Boston' },
      { trigger: 'm or f', response: 'F' },
      { trigger: 'where are you from', response: 'Boston! Lots of historical sites and universities here' },
      { trigger: 'book', response: 'I just finished "Meditations" by Marcus Aurelius. It is amazing how advice from 2000 years ago still works.' },
      { trigger: 'travel', response: 'I went to Japan last year and it was life-changing. The combination of ancient shrines and neon streets is stunning.' },
      { trigger: 'how are you', response: 'doing well, enjoying a cup of chamomile tea and writing' },
    ],
    fallbackResponses: [
      'that is a really profound thought',
      'I completely agree. It is all about perspective.',
      'who is your favorite author?',
      'sometimes we just need to unplug and read a good novel',
      'that is beautifully phrased',
      'interesting point, I never thought of it that way',
      'the mind is its own place, as Milton said',
      'do you write any journals or creative things yourself?'
    ],
    typingSpeed: 50, // Slightly more deliberate
  },
];
