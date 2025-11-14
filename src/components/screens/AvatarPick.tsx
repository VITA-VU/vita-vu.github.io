import React, { useState, useMemo, useEffect } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaInput } from '../vita-ui/VitaInput';
import { AvatarTile } from '../vita-ui/AvatarTile';
import { LanguageToggle } from '../LanguageToggle';
// import { griffonAvatars } from '../griffons/GriffonAvatars';
// import from '../imgs/avatar_griffon/*.png';
import logo from '../imgs/VU-logo-RGB.png';

interface AvatarPickProps {
onContinue: (data: { avatar?: string; pronouns?: string }) => void;
  onSkip: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export function AvatarPick({ onContinue, onSkip, currentLang, onLangChange }: AvatarPickProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>();
  const [pronouns, setPronouns] = useState('');

  // Dynamically import all images from avatar_griffon folder
  const avatarImages = useMemo(() => {
    const images = import.meta.glob('../imgs/avatar_griffon/*.{png,jpg,svg}', { eager: true });
    return Object.entries(images).map(([path, mod]: any) => ({
      id: path.split('/').pop()?.replace(/\.[^/.]+$/, ''),
      src: mod.default || mod,
      title: path.split('/').pop()?.replace(/\.[^/.]+$/, ''),
    }));
  }, []);

  // useEffect(() => {
  //   console.log('selectedAvatar:', selectedAvatar);
  // }, [selectedAvatar]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img src={logo} alt="VU Logo" width='150' height='100'/>        </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">


        <div>
          <h2 className="text-[1.375rem] mb-2">Pick your griffon</h2>
          <p className="text-[1rem] text-gray-600">
            Choose an avatar that best represents you. You can change it later if you want.
          </p>
        </div>
        
        {/* Avatar Grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4" data-tutorial="avatar-grid">
          {avatarImages.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
              className={`flex items-center justify-center p-2 rounded-md border-4 transition width=120 height=120 ${
                selectedAvatar === avatar.id
                  ? 'border-3-red-500 bg-red-100'
                  : 'border-3-gray-200 hover:border-gray-300'
              }`}
            > 
              <img 
                src={avatar.src} 
                alt={avatar.title} 
                className="w-[100px] h-[100px] object-cover rounded-sm"
              />
            </button>
          ))}
        </div>

        {/* Pronouns Input */}
        <div data-tutorial="pronouns-select" className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Pronouns</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { value: 'she/her', label: 'She / Her' },
              { value: 'he/him', label: 'He / Him' },
              { value: 'they/them', label: 'They / Them' },
              { value: 'none', label: 'Prefer not to say' },
              { value: 'custom', label: 'Custom' },
            ].map((opt) => (
              <label key={opt.value} className="inline-flex items-center gap-2 p-2 border rounded-md cursor-pointer">
                <input
                  type="radio"
                  name="pronouns-select"
                  value={opt.value}
                  checked={pronouns === opt.value}
                  onChange={(e) => setPronouns(e.target.value)}
                  className="mt-0.5 accent-vita-gold"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* Custom pronouns text field */}
          {pronouns === 'custom' && (
            <div className="mt-2">
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                placeholder="Enter your pronouns"
                onChange={(e) => setPronouns(e.target.value)}
              />
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <VitaButton
            variant="primary"
            onClick={() => onContinue({ avatar: selectedAvatar, pronouns })}
            className="flex-1"
          >
            Continue
          </VitaButton>
          <VitaButton
            variant="ghost"
            onClick={onSkip}
            className="flex-1"
          >
            Skip
          </VitaButton>
        </div>
      </div>
    </div>

  );
}
