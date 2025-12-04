import React, { useState, useMemo, useEffect } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaInput } from '../vita-ui/VitaInput';
import { LanguageToggle } from '../LanguageToggle';
import logo from '../imgs/VU-logo-RGB.png';
import { initializeStudent } from '../api/requests';
import ProgressBar from '../vita-ui/ProgressBar';
interface AvatarAndDetailsProps {
  onContinue: (data: { avatar?: string; pronouns?: string; firstName?: string; age?: string; profile?: string; hasProgramInMind?: 'yes' | 'no' }) => void;
  onSkip?: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  goBack?: () => void;
  goHome?: () => void;
}

type Step = 'avatar' | 'pronouns' | 'chat';
type ChatStep = 'greeting' | 'name' | 'pronouns' | 'age' | 'profile' | 'programInMind';

interface ChatMessage {
  sender: 'user' | 'avatar';
  text: string;
  timestamp: number;
}

const pronounOptions = [
  { value: 'She / Her', label: 'She / Her' },
  { value: 'He / Him', label: 'He / Him' },
  { value: 'They / Them', label: 'They / Them' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const programmeOptions = [
  { value: 'N&T', label: 'Nature & Technical (NT)' },
  { value: 'N&H', label: 'Nature & Health (NG)' },
  { value: 'C&M', label: 'Culture & Society (CM)' },
  { value: 'E&S', label: 'Economics & Society (EM)' },
  { value: 'Combination', label: 'Combination' },
  { value: 'Other', label: 'Other' },
];

async function initializeProfile(selectedAvatar: string) {
  initializeStudent();
}

export function AvatarAndDetails({ onContinue, onSkip, currentLang, onLangChange, goBack, goHome }: AvatarAndDetailsProps) {
  const [step, setStep] = useState<Step>('avatar');
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>();
  const [pronouns, setPronouns] = useState('');
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [profile, setProfile] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [programme, setProgramme] = useState('');
  const [chatStep, setChatStep] = useState<ChatStep>('greeting');
  const [showPronounsDropdown, setShowPronounsDropdown] = useState(false);
  const [showProgrammeDropdown, setShowProgrammeDropdown] = useState(false);
  const [hasProgramInMind, setHasProgramInMind] = useState<'yes' | 'no' | ''>('');
  const [showProgramInMindDropdown, setShowProgramInMindDropdown] = useState(false);

  // Dynamically import all images from avatar_griffon folder
  const avatarImages = useMemo(() => {
    const images = import.meta.glob('../imgs/avatar_griffon/*.{png,jpg,svg}', { eager: true });
    return Object.entries(images).map(([path, mod]: any) => ({
      id: path.split('/').pop()?.replace(/\.[^/.]+$/, ''),
      src: mod.default || mod,
      title: path.split('/').pop()?.replace(/\.[^/.]+$/, ''),
    }));
  }, []);

  // Map avatar id -> src
  const avatarMap = useMemo(() => {
    const images = import.meta.glob('../imgs/avatar_griffon/*.{png,jpg,svg}', { eager: true }) as Record<string, any>;
    return Object.entries(images).reduce<Record<string, string>>((acc, [path, mod]) => {
      const id = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || path;
      acc[id] = mod.default || mod;
      return acc;
    }, {});
  }, []);

  // Add avatar message with typing animation
  const addAvatarMessage = (text: string, delay: number = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'avatar', text, timestamp: Date.now() }]);
      setIsTyping(false);
    }, delay);
  };

  // Add user message
  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { sender: 'user', text, timestamp: Date.now() }]);
  };

  // Initialize chat
  useEffect(() => {
    if (step === 'chat' && messages.length === 0) {
      addAvatarMessage(`Hello! I'm your Griffon guide. What's your name?`, 500);
    }
  }, [step]);

  // Handle avatar selection
  const handleAvatarSelect = () => {
    if (!selectedAvatar) {
      alert('Please select an avatar');
      return;
    }
    localStorage.setItem('avatar', selectedAvatar);
    setStep('chat');
  };

  // Handle chat responses
  const handleUserResponse = (text: string) => {
    if (!text.trim()) return;

    addUserMessage(text);

    if (chatStep === 'greeting') {
      setFirstName(text);
      localStorage.setItem('firstName', text);
      addAvatarMessage(`Nice to meet you, ${text}! What pronouns do you use?`, 400);
      setChatStep('pronouns');
    } else if (chatStep === 'pronouns') {
      setChatStep('age');
      setTimeout(() => {
        addAvatarMessage(`Got it! How old are you?`, 800);
      }, 500);
    } else if (chatStep === 'age') {
      setAge(text);
      localStorage.setItem('age', text);
      addAvatarMessage('Cool! What profile did you complete in high school?', 800);
      setChatStep('profile');
    }
  };

  // Handle pronouns selection
  const handlePronounsSelect = (selectedValue: string) => {
    const selectedLabel = pronounOptions.find(opt => opt.value === selectedValue)?.label || selectedValue;
    setPronouns(selectedValue);
    localStorage.setItem('pronouns', selectedValue);
    //addUserMessage(selectedLabel);
    setShowPronounsDropdown(false);
    handleUserResponse(selectedValue);
  };

  // Handle programme selection
  const handleProgrammeSelect = (selectedValue: string) => {
    const selectedLabel = programmeOptions.find(opt => opt.value === selectedValue)?.label || selectedValue;
    addUserMessage(selectedLabel);
    setProfile(selectedLabel);
    localStorage.setItem('profile', selectedValue);
    // ask follow-up question instead of finishing immediately
    addAvatarMessage('Quick question: do you already have a study programme in mind?', 800);
    setChatStep('programInMind');
    setTimeout(() => {
      setShowProgrammeDropdown(false);
    }, 500);
  };

  // Handle program-in-mind selection (yes/no)
  const handleProgramInMindSelect = (val: 'yes' | 'no') => {
    setHasProgramInMind(val);
    localStorage.setItem('hasProgramInMind', val  === 'yes' ? 'Yes' : 'No');
    addUserMessage(val === 'yes' ? 'Yes' : 'No');
    addAvatarMessage(`Thanks — that's all I need. Let's get started!`, 800);
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { goHome?.(); if (typeof window !== 'undefined') { window.location.hash = '#/splash'; } }} 
            aria-label="Go home"
            className="flex items-center"
          >
            <img src={logo} alt="VU Logo" width="150" height="100" className="cursor-pointer" />
          </button>
        </div>
        <ProgressBar bgColor={"#D4a017"} progress={0} />
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Step 1: Avatar Selection */}
        {step === 'avatar' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[1.375rem] mb-2">Pick your Griffon</h2>
              <p className="text-[1rem] text-gray-600">
                Choose one that best represents you!
              </p>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4" data-tutorial="avatar-grid">
              {avatarImages.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`flex items-center justify-center p-2 rounded-md border-4 transition ${
                    selectedAvatar === avatar.id
                      ? 'border-vita-gold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={selectedAvatar === avatar.id ? { backgroundColor: 'rgba(212,160,23,0.1)' } : undefined}
                >
                  <img 
                    src={avatar.src} 
                    alt={avatar.title} 
                    className="w-[100px] h-[100px] object-cover rounded-sm"
                    width="500px"
                    height="500px"
                  />
                </button>
              ))}
            </div>

            <VitaButton
              variant="primary"
              onClick={handleAvatarSelect}
              className="w-full"
            >
              Next
            </VitaButton>
          </div>
        )}

        {/* Step 2: Chat */}
        {step === 'chat' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-[1.375rem] mb-2">Tell us about yourself</h2>
              <p className="text-[1rem] text-gray-600">
                Chat with your Griffon to share some more details.
              </p>
            </div>

            {/* Chat Messages */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto border border-gray-200">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.sender === 'avatar' && (
                    <div className="flex-shrink-0 bg-vita-gold/10 rounded-full flex items-center justify-center overflow-hidden">
                      {avatarMap[selectedAvatar || ''] ? (
                        <img src={avatarMap[selectedAvatar || '']} 
                          alt="avatar" 
                          className="object-cover"                    
                          width="100px"
                          height="100px"/>
                      ) : (
                        <span className="text-xs text-gray-600">{(selectedAvatar && selectedAvatar.charAt(0).toUpperCase()) || 'G'}</span>
                      )}
                    </div>
                  )}
                  <div className={`max-w-[70%] ${msg.sender === 'avatar' ? 'relative' : ''}`}>
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        msg.sender === 'avatar'
                          ? 'bg-gray-200 text-gray-900'
                          : 'bg-vita-gold text-white rounded-lg'
                      }`}
                      style={msg.sender !== 'avatar' ? { backgroundColor: 'rgba(212,160,23,1)' } : undefined}
                    >
                      <p>{msg.text}</p>
                    </div>
                    {msg.sender === 'avatar' && (
                      <div
                        style={{
                          position: 'absolute',
                          left: -6,
                          top: 12,
                          width: 12,
                          height: 12,
                          background: '#E5E7EB',
                          borderRadius: '0 8px 0 0',
                          transform: 'rotate(45deg)',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-vita-gold/10 rounded-full flex items-center justify-center">
                    {avatarMap[selectedAvatar || ''] ? (
                      <img src={avatarMap[selectedAvatar || '']} 
                          alt="avatar" 
                          className="object-cover" 
                          width="100px"
                          height="100px" />
                    ) : (
                      <span className="text-xs text-gray-600">G</span>
                    )}
                  </div>
                  <div className="bg-gray-200 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {!isTyping && (
              <div className="flex gap-2">
                {chatStep === 'pronouns' ? (
                  <div className="flex-1 relative">
                    <button
                      onClick={() => setShowPronounsDropdown(!showPronounsDropdown)}
                      className="w-full border rounded px-3 py-2 text-sm text-left bg-white hover:bg-gray-50"
                    >
                      {pronouns ? pronounOptions.find(p => p.value === pronouns)?.label : 'Select pronouns...'}
                      <span className="float-right">▼</span>
                    </button>
                    {showPronounsDropdown && (
                      <div className="absolute top-full left-0 right-0 border rounded mt-1 bg-white shadow-lg z-10">
                        {pronounOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handlePronounsSelect(opt.value)}
                            className="w-full text-left px-3 py-2 hover:bg-vita-gold/10 text-sm"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : chatStep === 'profile' ? (
                  <div className="flex-1 relative">
                    <button
                      onClick={() => setShowProgrammeDropdown(!showProgrammeDropdown)}
                      className="w-full border rounded px-3 py-2 text-sm text-left bg-white hover:bg-gray-50"
                    >
                      {programme || 'Select a profile...'}
                      <span className="float-right">▼</span>
                    </button>
                    {showProgrammeDropdown && (
                      <div className="absolute top-full left-0 right-0 border rounded mt-1 bg-white shadow-lg z-10">
                        {programmeOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleProgrammeSelect(opt.value)}
                            className="w-full text-left px-3 py-2 hover:bg-vita-gold/10 text-sm"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : chatStep === 'programInMind' ? (
                <div className="flex-1 relative">
                  {!hasProgramInMind && (
                    <>
                      <label className="block text-sm text-gray-700 mb-1">
                        Do you already have a study programme in mind?
                      </label>

                      <button
                        onClick={() => setShowProgramInMindDropdown(!showProgramInMindDropdown)}
                        className="w-full border rounded px-3 py-2 text-sm text-left bg-white hover:bg-gray-50"
                      >
                        {hasProgramInMind ? (hasProgramInMind === 'yes' ? 'Yes' : 'No') : 'Select...'}
                        <span className="float-right">▼</span>
                      </button>

                      {showProgramInMindDropdown && (
                        <div className="absolute top-full left-0 right-0 border rounded mt-1 bg-white shadow-lg z-10">
                          <button
                            className="w-full text-left px-3 py-2 hover:bg-vita-gold/10 text-sm"
                            onClick={() => {
                              setShowProgramInMindDropdown(false);
                              handleProgramInMindSelect('yes');
                            }}
                          >
                            Yes
                          </button>

                          <button
                            className="w-full text-left px-3 py-2 hover:bg-vita-gold/10 text-sm"
                            onClick={() => {
                              setShowProgramInMindDropdown(false);
                              handleProgramInMindSelect('no');
                            }}
                          >
                            No
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* CTA shown AFTER user selects Yes/No */}
                  {hasProgramInMind && (
                    <div className="mt-4">
                      <VitaButton
                        variant="primary"
                        onClick={() =>
                          onContinue({
                            avatar: selectedAvatar,
                            pronouns,
                            firstName,
                            age,
                            profile,
                            hasProgramInMind: hasProgramInMind as 'yes' | 'no',
                          })
                        }
                        className="w-full"
                      >
                        {hasProgramInMind === 'yes'
                          ? "Let's go look at some programmes!"
                          : "Let's go learn some more about you!"}
                      </VitaButton>
                    </div>
                  )}
                </div>
              ): (
                  <>
                    <input
                      type="text"
                      id="chat-input"
                      className="flex-1 border rounded px-3 py-2 text-sm"
                      placeholder="Type your response..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.currentTarget;
                          handleUserResponse(target.value);
                          target.value = '';
                        }
                      }}
                    />
                    <VitaButton
                      variant="primary"
                      onClick={() => {
                        const input = document.getElementById('chat-input') as HTMLInputElement;
                        if (input) {
                          handleUserResponse(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Send
                    </VitaButton>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}