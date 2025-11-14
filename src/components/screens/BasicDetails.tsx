import React, { useState, useEffect, useMemo } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaInput } from '../vita-ui/VitaInput';
import { VitaSelect } from '../vita-ui/VitaSelect';
import { LanguageToggle } from '../LanguageToggle';
// import { griffonAvatars } from '../griffons/GriffonAvatars';
import logo from '../imgs/VU-logo-RGB.png';

interface BasicDetailsProps {

onContinue: (data: { firstName: string; age: string; profile: string }) => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  selectedAvatar?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
  goHome?: () => void;
  goBack?: () => void;
}

type ChatStep = 'greeting' | 'name' | 'age' | 'profile' | 'complete';

interface ChatMessage {
  sender: 'avatar' | 'user';
  text: string;
  timestamp: number;
}

export function BasicDetails({ onContinue, currentLang, onLangChange, selectedAvatar, goBack, goHome}: BasicDetailsProps) {
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [profile, setProfile] = useState('');
  const [chatStep, setChatStep] = useState<ChatStep>('greeting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const profileOptions = [
    { value: '', label: 'Select your profile' },
    { value: 'science', label: 'Nature & Technical (NT)' },
    { value: 'health', label: 'Nature & Health (NG)' },
    { value: 'culture', label: 'Culture & Society (CM)' },
    { value: 'economics', label: 'Economics & Society (EM)' },
    { value: 'combination', label: 'Combination profile' },
    { value: 'other', label: 'Other' },
    { value: 'not_applicable', label: 'Not applicable' }
  ];

  // map avatar id -> src by importing all images in the avatar folder
  const avatarMap = useMemo(() => {
    const imgs = import.meta.glob('../imgs/avatar_griffon/*.{png,jpg,svg}', { eager: true }) as Record<string, any>;
    return Object.entries(imgs).reduce<Record<string, string>>((acc, [path, mod]) => {
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

  // Initial greeting
  useEffect(() => {
    addAvatarMessage(`Hi there! I'm your Griffon guide. Let me help you get started with a few quick questions.`, 500);
    setTimeout(() => {
      setChatStep('name');
      addAvatarMessage("First up, what's your first name?", 2000);
    }, 2500);
  }, []);

  const handleNameSubmit = () => {
    if (!firstName) return;
    addUserMessage(firstName);
    setChatStep('age');
    addAvatarMessage(`Nice to meet you, ${firstName}! How old are you?`, 1000);
  };

  const handleAgeSubmit = () => {
    if (!age) return;
    addUserMessage(age);
    setChatStep('profile');
    addAvatarMessage("Great! Last question - what's your high school profile?", 1000);
  };

  const handleProfileSubmit = () => {
    if (!profile) return;
    const selectedOption = profileOptions.find(opt => opt.value === profile);
    addUserMessage(selectedOption?.label || profile);
    setChatStep('complete');
    addAvatarMessage("Perfect! I've got everything I need. Let's continue your journey!", 1000);
    setTimeout(() => {
      onContinue({ firstName, age, profile });
    }, 2500);
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button 
  onClick={() => goHome?.()} 
  aria-label="Go Home"
  className="flex items-center"
>
  <img  src={logo}  alt="VU Logo" width='150' height='100' />
</button>

{goBack && (
  <button 
    onClick={goBack} 
    aria-label="Go Back"
    className="ml-3 text-sm text-vita-deep-blue hover:underline"
  >
    ← Back
  </button>
)}        </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-6">
        {/* Messages */}
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {msg.sender === 'avatar' && (
                <div className="flex-shrink-0 w-12 h-12 bg-vita-gold/10 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarMap[selectedAvatar || 'Griffon'] ? (
                    <img src={avatarMap[selectedAvatar || 'Griffon']} alt={selectedAvatar || 'avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-gray-600">{(selectedAvatar && selectedAvatar.charAt(0).toUpperCase())}</span>
                  )}
                </div>
              )}
              <div
                className={`max-w-[70%] p-4 rounded-2xl ${
                  msg.sender === 'avatar'
                    ? 'bg-gray-100 text-gray-900 rounded-tl-none'
                    : 'bg-[#D4A017]/[10] text-black rounded-tr-none'
                }`}
                  style={msg.sender !== 'avatar' ? { backgroundColor: 'rgba(212,160,23,1)' } : undefined}

              >
                <p className="text-[1rem]">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-vita-gold/10 rounded-full flex items-center justify-center overflow-hidden">
                {avatarMap[selectedAvatar || ''] ? (
                  <img src={avatarMap[selectedAvatar || '']} alt={selectedAvatar || 'avatar'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-gray-600">{(selectedAvatar && selectedAvatar.charAt(0).toUpperCase())}</span>
                )}
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="border-t border-gray-100 pt-4">
          {chatStep === 'name' && (
            <div className="space-y-3">
              <VitaInput
                label="Your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Type your name..."
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
              <VitaButton
                variant="primary"
                onClick={handleNameSubmit}
                disabled={!firstName}
                className="w-full"
              >
                Send
              </VitaButton>
            </div>
          )}
          
          {chatStep === 'age' && (
            <div className="space-y-3">
              <VitaInput
                label="Your age"
                inputType="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Type your age..."
                onKeyPress={(e) => e.key === 'Enter' && handleAgeSubmit()}
              />
              <VitaButton
                variant="primary"
                onClick={handleAgeSubmit}
                disabled={!age}
                className="w-full"
              >
                Send
              </VitaButton>
            </div>
          )}
          
          {chatStep === 'profile' && (
            <div className="space-y-3">
              <VitaSelect
                label="High school profile"
                options={profileOptions}
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
              />
              <VitaButton
                variant="primary"
                onClick={handleProfileSubmit}
                disabled={!profile}
                className="w-full"
              >
                Send
              </VitaButton>
            </div>
          )}
          
          {chatStep === 'complete' && (
            <div className="text-center text-gray-600">
              <p>Preparing your experience...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}