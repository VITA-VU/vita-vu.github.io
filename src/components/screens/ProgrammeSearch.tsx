import React, { useState, useMemo } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { LanguageToggle } from '../LanguageToggle';
import { Search } from 'lucide-react';
import logo from '../imgs/VU-logo-RGB.png';

interface ProgrammeSearchProps {
  onContinue: (programme: string) => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  goHome?: () => void;
  goBack?: () => void;
  selectedAvatar?: string;
}

const programmes = [
  { id: 'psychology', name: 'Psychology', description: 'Study human behavior and mental processes' },
  { id: 'business-analytics', name: 'Business Analytics', description: 'Data-driven business decision making' },
  { id: 'physics', name: 'Physics', description: 'Explore the fundamental laws of nature' },
  { id: 'computer-science', name: 'Computer Science', description: 'Software development and computational thinking' },
  { id: 'economics', name: 'Economics', description: 'Markets, policy, and global trade' },
  { id: 'law', name: 'Law', description: 'Legal systems and justice' },
  { id: 'medicine', name: 'Medicine', description: 'Healthcare and medical science' },
  { id: 'biology', name: 'Biology', description: 'Life sciences and ecosystems' }
];

export function ProgrammeSearch({ onContinue, currentLang, onLangChange, goBack, goHome, selectedAvatar }: ProgrammeSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const avatarTopic = selectedAvatar || 'Griffon';
  
  // map avatar id -> src (used to show selected avatar speaking)
  const avatarMap = useMemo(() => {
    try {
      const imgs = import.meta.glob('../imgs/avatar_griffon/*.{png,jpg,svg}', { eager: true }) as Record<string, any>;
      return Object.entries(imgs).reduce<Record<string, string>>((acc, [path, mod]) => {
        const id = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || path;
        acc[id] = mod.default || mod;
        return acc;
      }, {});
    } catch {
      return {};
    }
  }, []);

  const filteredProgrammes = programmes.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-white">
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

       </div>
        <LanguageToggle currentLang={currentLang} onToggle={onLangChange} />
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Avatar speaking bubble (title + intro) */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-20">
              <img
                src={avatarMap[avatarTopic || '']}
                alt="selected avatar"
                className=" object-cover rounded-full shadow"
                width="200px"
                height="100px"
              />
          </div>

          <div className="relative max-w-prose flex-1">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h2 className="text-[1.375rem]">Which programme do you want to explore?</h2>
              <p className="text-[1rem] text-gray-600">Search or pick a programme below to explore options that match your interests.</p>
              <div
                style={{
                  position: 'absolute',
                  left: -8,
                  top: 24,
                  width: 16,
                  height: 16,
                  background: '#F8FAFC',
                  borderTop: '1px solid #E5E7EB',
                  borderLeft: '1px solid #E5E7EB',
                  transform: 'rotate(45deg)',
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search programmes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-[44px] pl-12 pr-4 py-2 bg-input-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vita-gold focus:border-transparent"
          />
        </div>
        
        {/* Programme List */}
        <div className="space-y-2">
          {filteredProgrammes.map((programme) => (
            <VitaCard
              key={programme.id}
              variant={selected === programme.id ? 'emphasis' : 'base'}
              onClick={() => setSelected(programme.id)}
            >
              <h3 className="text-[1rem] mb-1">{programme.name}</h3>
              <p className="text-[0.8125rem] text-gray-600">{programme.description}</p>
            </VitaCard>
          ))}
        </div>
        
        <VitaButton
          variant="primary"
          onClick={() => selected && onContinue(selected)}
          disabled={!selected}
          className="w-full"
        >
          Continue
        </VitaButton>
      </div>
    </div>
  );
}
