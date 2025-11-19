import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { LanguageToggle } from '../LanguageToggle';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
// import { griffonAvatars } from '../griffons/GriffonAvatars';
import logo from '../imgs/VU-logo-RGB.png';

interface MicroRIASECProps {

onComplete: (styles: string[]) => void;
  onBack: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  selectedAvatar?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
  goHome?: () => void;
  goBack?: () => void;
}

interface Activity {
  id: number;
  text: string;
  riasec: string;
}

// Activity sets for different avatar topics
const activitySets: Record<string, Activity[]> = {
  painting: [
    { id: 1, text: 'Creating abstract art and expressing emotions through colors', riasec: 'A' },
    { id: 2, text: 'Teaching painting workshops to children and adults', riasec: 'S' },
    { id: 3, text: 'Analyzing paint chemistry and developing new pigments', riasec: 'I' },
    { id: 4, text: 'Running an art gallery business and selling paintings', riasec: 'E' },
    { id: 5, text: 'Restoring old paintings with precision and care', riasec: 'R' },
    { id: 6, text: 'Organizing art collections and cataloging artwork', riasec: 'C' },
  ],
  music: [
    { id: 1, text: 'Composing original music and experimenting with sounds', riasec: 'A' },
    { id: 2, text: 'Teaching music lessons and mentoring young musicians', riasec: 'S' },
    { id: 3, text: 'Studying acoustics and sound wave patterns', riasec: 'I' },
    { id: 4, text: 'Managing a music venue or promoting concerts', riasec: 'E' },
    { id: 5, text: 'Building and repairing musical instruments', riasec: 'R' },
    { id: 6, text: 'Cataloging music archives and maintaining sheet music', riasec: 'C' },
  ],
  coding: [
    { id: 1, text: 'Designing creative user interfaces and experiences', riasec: 'A' },
    { id: 2, text: 'Mentoring junior developers and code reviewing', riasec: 'S' },
    { id: 3, text: 'Researching algorithms and solving complex problems', riasec: 'I' },
    { id: 4, text: 'Leading tech startups and pitching products', riasec: 'E' },
    { id: 5, text: 'Building hardware prototypes and IoT devices', riasec: 'R' },
    { id: 6, text: 'Managing databases and organizing code documentation', riasec: 'C' },
  ],
  cooking: [
    { id: 1, text: 'Creating innovative recipes and plating presentations', riasec: 'A' },
    { id: 2, text: 'Teaching cooking classes and sharing culinary skills', riasec: 'S' },
    { id: 3, text: 'Studying food science and molecular gastronomy', riasec: 'I' },
    { id: 4, text: 'Opening a restaurant and managing the business', riasec: 'E' },
    { id: 5, text: 'Operating kitchen equipment and food preparation', riasec: 'R' },
    { id: 6, text: 'Planning menus and managing inventory systems', riasec: 'C' },
  ],
  reading: [
    { id: 1, text: 'Writing creative stories and literary criticism', riasec: 'A' },
    { id: 2, text: 'Running book clubs and facilitating discussions', riasec: 'S' },
    { id: 3, text: 'Analyzing literary themes and historical contexts', riasec: 'I' },
    { id: 4, text: 'Publishing books and managing literary agencies', riasec: 'E' },
    { id: 5, text: 'Bookbinding and physical book restoration', riasec: 'R' },
    { id: 6, text: 'Organizing libraries and cataloging collections', riasec: 'C' },
  ],
  football: [
    { id: 1, text: 'Choreographing creative plays and strategies', riasec: 'A' },
    { id: 2, text: 'Coaching youth teams and mentoring players', riasec: 'S' },
    { id: 3, text: 'Analyzing game statistics and player performance', riasec: 'I' },
    { id: 4, text: 'Managing a sports club and negotiating sponsorships', riasec: 'E' },
    { id: 5, text: 'Training physical fitness and maintaining equipment', riasec: 'R' },
    { id: 6, text: 'Organizing tournaments and managing schedules', riasec: 'C' },
  ],
  tennis: [
    { id: 1, text: 'Developing unique playing styles and techniques', riasec: 'A' },
    { id: 2, text: 'Coaching students and helping them improve', riasec: 'S' },
    { id: 3, text: 'Studying biomechanics and performance science', riasec: 'I' },
    { id: 4, text: 'Organizing tennis tournaments and sponsorships', riasec: 'E' },
    { id: 5, text: 'Maintaining courts and restringing rackets', riasec: 'R' },
    { id: 6, text: 'Managing player rankings and tournament schedules', riasec: 'C' },
  ],
  sewing: [
    { id: 1, text: 'Designing original fashion and creating patterns', riasec: 'A' },
    { id: 2, text: 'Teaching sewing workshops and sharing techniques', riasec: 'S' },
    { id: 3, text: 'Researching textile science and fabric properties', riasec: 'I' },
    { id: 4, text: 'Running a fashion brand and managing production', riasec: 'E' },
    { id: 5, text: 'Operating industrial sewing machines and equipment', riasec: 'R' },
    { id: 6, text: 'Organizing inventory and managing pattern libraries', riasec: 'C' },
  ],
  photography: [
    { id: 1, text: 'Creating artistic compositions and experimental shots', riasec: 'A' },
    { id: 2, text: 'Teaching photography classes and guiding others', riasec: 'S' },
    { id: 3, text: 'Understanding optics and camera technology', riasec: 'I' },
    { id: 4, text: 'Running a photography business and finding clients', riasec: 'E' },
    { id: 5, text: 'Building camera equipment and darkroom setups', riasec: 'R' },
    { id: 6, text: 'Cataloging photo archives and organizing shoots', riasec: 'C' },
  ],
  hiking: [
    { id: 1, text: 'Discovering unique trails and photographing nature', riasec: 'A' },
    { id: 2, text: 'Leading group hikes and teaching outdoor safety', riasec: 'S' },
    { id: 3, text: 'Studying ecology and environmental conservation', riasec: 'I' },
    { id: 4, text: 'Starting an outdoor adventure tourism company', riasec: 'E' },
    { id: 5, text: 'Building trails and maintaining outdoor equipment', riasec: 'R' },
    { id: 6, text: 'Planning routes and managing expedition logistics', riasec: 'C' },
  ],
  robotics: [
    { id: 1, text: 'Designing creative robot behaviors and interactions', riasec: 'A' },
    { id: 2, text: 'Mentoring robotics teams and teaching programming', riasec: 'S' },
    { id: 3, text: 'Researching AI and machine learning algorithms', riasec: 'I' },
    { id: 4, text: 'Leading robotics startups and product development', riasec: 'E' },
    { id: 5, text: 'Building and assembling robot prototypes', riasec: 'R' },
    { id: 6, text: 'Managing robot testing schedules and documentation', riasec: 'C' },
  ],
  debate: [
    { id: 1, text: 'Crafting persuasive rhetorical arguments', riasec: 'A' },
    { id: 2, text: 'Coaching debate teams and mentoring speakers', riasec: 'S' },
    { id: 3, text: 'Researching complex topics and analyzing evidence', riasec: 'I' },
    { id: 4, text: 'Leading political campaigns and advocacy groups', riasec: 'E' },
    { id: 5, text: 'Setting up debate venues and audio equipment', riasec: 'R' },
    { id: 6, text: 'Organizing debate tournaments and judging criteria', riasec: 'C' },
  ],
  chess: [
    { id: 1, text: 'Developing creative opening strategies and gambits', riasec: 'A' },
    { id: 2, text: 'Teaching chess to beginners and hosting clubs', riasec: 'S' },
    { id: 3, text: 'Analyzing game theory and calculating variations', riasec: 'I' },
    { id: 4, text: 'Organizing chess tournaments and sponsorships', riasec: 'E' },
    { id: 5, text: 'Crafting chess sets and board designs', riasec: 'R' },
    { id: 6, text: 'Managing player ratings and tournament records', riasec: 'C' },
  ],
  'lab-science': [
    { id: 1, text: 'Designing innovative experiments and visualizations', riasec: 'A' },
    { id: 2, text: 'Teaching lab techniques and supervising students', riasec: 'S' },
    { id: 3, text: 'Conducting research and analyzing data', riasec: 'I' },
    { id: 4, text: 'Leading research teams and securing funding', riasec: 'E' },
    { id: 5, text: 'Operating lab equipment and maintaining instruments', riasec: 'R' },
    { id: 6, text: 'Managing lab inventory and safety protocols', riasec: 'C' },
  ],
  theatre: [
    { id: 1, text: 'Performing creative interpretations and improvising', riasec: 'A' },
    { id: 2, text: 'Directing community theater and teaching drama', riasec: 'S' },
    { id: 3, text: 'Analyzing scripts and studying dramatic theory', riasec: 'I' },
    { id: 4, text: 'Producing shows and managing theater companies', riasec: 'E' },
    { id: 5, text: 'Building sets and operating stage equipment', riasec: 'R' },
    { id: 6, text: 'Scheduling rehearsals and managing production logistics', riasec: 'C' },
  ],
  architecture: [
    { id: 1, text: 'Designing innovative buildings and creative spaces', riasec: 'A' },
    { id: 2, text: 'Collaborating with communities on public projects', riasec: 'S' },
    { id: 3, text: 'Analyzing structural engineering and materials science', riasec: 'I' },
    { id: 4, text: 'Managing architecture firms and client relations', riasec: 'E' },
    { id: 5, text: 'Building scale models and construction prototypes', riasec: 'R' },
    { id: 6, text: 'Organizing blueprints and project documentation', riasec: 'C' },
  ],
  ecology: [
    { id: 1, text: 'Creating nature photography and environmental art', riasec: 'A' },
    { id: 2, text: 'Leading conservation efforts and community education', riasec: 'S' },
    { id: 3, text: 'Researching ecosystems and studying wildlife', riasec: 'I' },
    { id: 4, text: 'Managing environmental NGOs and policy advocacy', riasec: 'E' },
    { id: 5, text: 'Conducting field work and habitat restoration', riasec: 'R' },
    { id: 6, text: 'Maintaining species databases and research records', riasec: 'C' },
  ],
  entrepreneurship: [
    { id: 1, text: 'Brainstorming innovative business ideas and branding', riasec: 'A' },
    { id: 2, text: 'Building teams and mentoring employees', riasec: 'S' },
    { id: 3, text: 'Analyzing market trends and consumer behavior', riasec: 'I' },
    { id: 4, text: 'Leading startups and pitching to investors', riasec: 'E' },
    { id: 5, text: 'Developing product prototypes and MVPs', riasec: 'R' },
    { id: 6, text: 'Managing finances and organizing business operations', riasec: 'C' },
  ],
  volunteering: [
    { id: 1, text: 'Creating awareness campaigns and creative outreach', riasec: 'A' },
    { id: 2, text: 'Helping communities and supporting vulnerable people', riasec: 'S' },
    { id: 3, text: 'Researching social issues and effective interventions', riasec: 'I' },
    { id: 4, text: 'Leading nonprofit organizations and fundraising', riasec: 'E' },
    { id: 5, text: 'Building homes and hands-on community projects', riasec: 'R' },
    { id: 6, text: 'Coordinating volunteer schedules and managing programs', riasec: 'C' },
  ],
  languages: [
    { id: 1, text: 'Translating poetry and creative literary works', riasec: 'A' },
    { id: 2, text: 'Teaching languages and facilitating cultural exchange', riasec: 'S' },
    { id: 3, text: 'Studying linguistics and language acquisition theory', riasec: 'I' },
    { id: 4, text: 'Managing translation agencies and international business', riasec: 'E' },
    { id: 5, text: 'Interpreting in real-time settings and conferences', riasec: 'R' },
    { id: 6, text: 'Organizing language databases and grammar resources', riasec: 'C' },
  ],
  // Default set for other avatars
  default: [
    { id: 1, text: 'Creating innovative designs and artistic projects', riasec: 'A' },
    { id: 2, text: 'Helping and teaching others in your field', riasec: 'S' },
    { id: 3, text: 'Researching and analyzing complex information', riasec: 'I' },
    { id: 4, text: 'Leading projects and managing business ventures', riasec: 'E' },
    { id: 5, text: 'Working with tools and building physical things', riasec: 'R' },
    { id: 6, text: 'Organizing systems and maintaining detailed records', riasec: 'C' },
  ],
};

export function MicroRIASEC({ onComplete, onBack, currentLang, onLangChange, selectedAvatar, goBack, goHome }: MicroRIASECProps) {
  // Get the avatar topic for activities
  const avatarTopic = selectedAvatar || 'default';
  const activities = activitySets[avatarTopic] || activitySets.default;
  // const avatarData = griffonAvatars.find(a => a.id === selectedAvatar);
  // const topicName = avatarData?.title.toLowerCase() || 'general interest';
  
  const [items, setItems] = useState(activities);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [touchDraggedItem, setTouchDraggedItem] = useState<number | null>(null);
  
  const handleDragStart = (id: number) => {
    setDraggedItem(id);
  };
  
  const handleDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === targetId) return;
    
    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetId);
    
    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    
    setItems(newItems);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Touch handlers for mobile
  const handleMoveUp = (id: number) => {
    const index = items.findIndex(item => item.id === id);
    if (index > 0) {
      const newItems = [...items];
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
      setItems(newItems);
    }
  };

  const handleMoveDown = (id: number) => {
    const index = items.findIndex(item => item.id === id);
    if (index < items.length - 1) {
      const newItems = [...items];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setItems(newItems);
    }
  };
  
  const handleComplete = () => {
    // Calculate RIASEC scores based on ordering
    // Items at the top (positions 0-1) get more weight
    const scores: Record<string, number> = {
      R: 0, I: 0, A: 0, S: 0, E: 0, C: 0
    };
    
    items.forEach((item, index) => {
      // Top items get more points (6 for first, 5 for second, etc.)
      const points = items.length - index;
      scores[item.riasec] += points;
    });
    
    // Sort by score and return top 2
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([letter]) => letter)
      .slice(0, 2);
    
    onComplete(sorted);
  };
  
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
      
      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">


        <div>
          <h2 className="text-[1.375rem] mb-2">Organize by preference</h2>
          <p className="text-[1rem] text-gray-600">
            Drag and drop these activities from most appealing (top) to least appealing (bottom).
          </p>
        </div>
        
        {/* Ordering List */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`bg-white border-2 rounded-lg p-4 transition-all ${
                draggedItem === item.id
                  ? 'border-vita-gold shadow-lg opacity-50'
                  : 'border-gray-200 hover:border-vita-gold/50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center gap-2 cursor-move">
                  <GripVertical size={20} className="text-gray-400" />
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-vita-gold/10 text-vita-gold text-[0.875rem]">
                    {index + 1}
                  </div>
                </div>
                <p className="flex-1 text-[1rem] text-gray-900 pt-1">
                  {item.text}
                </p>
                <div className="flex-shrink-0 flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(item.id);
                    }}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ChevronUp size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(item.id);
                    }}
                    disabled={index === items.length - 1}
                    className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ChevronDown size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-[0.875rem] text-blue-900">
            💡 <strong>Tip:</strong> Drag items up or down to reorder them. Your preferences help us understand what type of programmes might interest you.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <VitaButton
            variant="ghost"
            onClick={onBack}
          >
            Back
          </VitaButton>
          <VitaButton
            variant="primary"
            onClick={handleComplete}
            className="flex-1"
          >
            Continue
          </VitaButton>
        </div>
      </div>
    </div>
  );
}