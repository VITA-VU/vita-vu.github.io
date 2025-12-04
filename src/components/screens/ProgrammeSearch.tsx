import React, { useState, useMemo } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaCard } from '../vita-ui/VitaCard';
import { LanguageToggle } from '../LanguageToggle';
import { Search } from 'lucide-react';
import logo from '../imgs/VU-logo-RGB.png';
import ProgressBar from '../vita-ui/ProgressBar';

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
  { id: 'ancienct_studies', name: 'Ancient Studies', description: 'Explore ancient civilizations, languages, cultures, and their historical impact.' },
  { id: 'biomedical_science', name: 'Biomedical Sciences', description: 'Study the biological and medical foundations of human health and disease.' },
  { id: 'business_analytics', name: 'Business Analytics', description: 'Use data, statistics, and technology to solve business problems and guide decisions.' },
  { id: 'computer-science', name: 'Computer Science', description: 'Learn algorithms, software development, and the principles of computing systems.' },
  { id: 'communication', name: 'Communication and Information Sciences', description: 'Examine how people create, share, and interpret information across media and technology.' },
  { id: 'economics', name: 'Economics and Business Economics', description: 'Study how markets work, how people make economic decisions, and how economies function.' },
  { id: 'econometrics', name: 'Econometrics and Operations Research', description: 'Apply mathematics, statistics, and modeling to analyze data and optimize complex systems.' },
  { id: 'history', name: 'History', description: 'Investigate past events, cultures, and societies to understand how they shape the present.' },
  { id: 'iba', name: 'International Business Administration', description: 'Learn how global companies operate, focusing on strategy, management, and cross-cultural business.' },
  { id: 'literature', name: 'Literature and Society', description: 'Study literature as a cultural force and explore how stories shape societies and identities.' },
  { id: 'mathematics', name: 'Mathematics', description: 'Develop strong analytical and problem-solving skills through the study of pure and applied mathematics.' },
  { id: 'media', name: 'Media, Art, Design and Architecture', description: 'Explore creative industries, visual culture, design principles, and the built environment.' },
  { id: 'philosophy', name: 'Philosophy', description: 'Examine fundamental questions about knowledge, ethics, reality, and human reasoning.' },
  { id: 'ppe', name: 'Philosophy, Politics and Economics', description: 'Combine analytical tools from philosophy, political science, and economics to understand societal issues.' }
];


export function ProgrammeSearch({ onContinue, currentLang, onLangChange, goBack, goHome, selectedAvatar }: ProgrammeSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const avatarTopic = selectedAvatar || 'Griffon';

  function setSelectedProgramme(programmeId: string, programmeName: string) {
    setSelected(programmeId);
    localStorage.setItem('currentProgram', programmeName);
  }
  
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
        <ProgressBar bgColor={"#D4a017"} progress={25} />
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
              <h2 className="text-[1.375rem]">Which study programme do you have in mind?</h2>
              <p className="text-[1rem] text-gray-600">Search or pick a programme below.</p>
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
              onClick={() => setSelectedProgramme(programme.id, programme.name)}
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
