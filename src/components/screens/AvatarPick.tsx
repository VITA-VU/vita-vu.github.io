import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaInput } from '../vita-ui/VitaInput';
import { AvatarTile } from '../vita-ui/AvatarTile';
import { LanguageToggle } from '../LanguageToggle';
import { griffonAvatars } from '../griffons/GriffonAvatars';

interface AvatarPickProps {
  onContinue: (data: { avatar?: string; pronouns?: string }) => void;
  onSkip: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
}

export function AvatarPick({ onContinue, onSkip, currentLang, onLangChange }: AvatarPickProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>();
  const [pronouns, setPronouns] = useState('');
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-vita-gold text-[1.125rem]">VITA</span>
          <span className="text-gray-400 text-[0.875rem]">×</span>
          <span className="text-gray-600 text-[0.875rem]">VU Amsterdam</span>
        </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-[1.375rem] mb-2">Pick your griffon</h2>
          <p className="text-[1rem] text-gray-600">
            Choose any avatar you like, this is just for fun
          </p>
        </div>
        
        {/* Avatar Grid */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-3" data-tutorial="avatar-grid">
          {griffonAvatars.map((avatar) => (
            <AvatarTile
              key={avatar.id}
              illustration={<avatar.component />}
              title={avatar.title}
              isSelected={selectedAvatar === avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
            />
          ))}
        </div>
        
        {/* Pronouns Input */}
        <div data-tutorial="pronouns-select">
          <VitaInput
            label="Pronouns (optional)"
            placeholder="She/her, He/him, They/them, Self-describe"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
          />
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
