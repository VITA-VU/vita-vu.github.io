import React, { useState } from 'react';
import { VitaButton } from '../vita-ui/VitaButton';
import { VitaChip } from '../vita-ui/VitaChip';
import { MediaStrip } from '../vita-ui/MediaStrip';
import { LanguageToggle } from '../LanguageToggle';
import logo from '../imgs/VU-logo-RGB.png';

interface ProgrammePreviewProps {

programme: string;
  onTryTask: () => void;
  onSeeAnother: () => void;
  currentLang: 'EN' | 'NL';
  onLangChange: (lang: 'EN' | 'NL') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  goHome?: () => void;
  goBack?: () => void;
}

export function ProgrammePreview({ 
  programme, 
  onTryTask, 
  onSeeAnother,
  currentLang,
  onLangChange,
  goBack, goHome
}: ProgrammePreviewProps) {
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'period'>('day');
  
  const programmeTitles: Record<string, string> = {
    'psychology': 'Psychology',
    'business-analytics': 'Business Analytics',
    'physics': 'Physics'
  };
  
  const daySchedule = [
    { time: '09:00 - 11:00', title: 'Research Methods Lecture', type: 'Lecture' },
    { time: '11:15 - 13:00', title: 'Statistics Tutorial', type: 'Tutorial' },
    { time: '14:00 - 16:00', title: 'Lab Session', type: 'Practical' }
  ];
  
  const mediaItems = [
    { type: 'video' as const, caption: 'Student vlog' },
    { type: 'document' as const, caption: 'Course page' },
    { type: 'faq' as const, caption: 'FAQ' }
  ];
  
  return (
    <div className="min-h-screen bg-white pb-20">
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
      
      {/* Content - Desktop uses 3 column layout */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">


        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['day', 'week', 'period'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 min-h-[44px] capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-vita-gold text-vita-near-black'
                  : 'text-gray-600 hover:text-vita-near-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Programme Header */}
        <div className="bg-gradient-to-r from-vita-gold/10 to-vita-deep-blue/10 rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-[1.375rem]">{programmeTitles[programme] || programme}</h2>
            <VitaChip variant="success" size="small">
              Timetable verified · Oct 2025
            </VitaChip>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="md:grid md:grid-cols-3 md:gap-6 space-y-6 md:space-y-0">
          <div className="md:col-span-2">
            {activeTab === 'day' && (
              <div className="space-y-3">
                <h3 className="text-[1rem]">Monday Schedule</h3>
                {daySchedule.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-[0.8125rem] text-gray-600">{item.time}</span>
                      <VitaChip variant="info" size="small">{item.type}</VitaChip>
                    </div>
                    <p className="text-[1rem]">{item.title}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'week' && (
              <div className="space-y-3">
                <h3 className="text-[1rem]">Weekly Overview</h3>
                <div className="grid grid-cols-5 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                    <div key={day} className="bg-white border border-gray-200 rounded-lg p-2">
                      <div className="text-[0.8125rem] mb-2">{day}</div>
                      <div className="space-y-1">
                        <div className="h-12 bg-vita-gold/20 rounded text-[0.625rem] p-1">Lecture</div>
                        {index < 3 && <div className="h-12 bg-vita-deep-blue/20 rounded text-[0.625rem] p-1">Tutorial</div>}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[0.8125rem] text-gray-600">Total contact hours: 16 hours/week</p>
              </div>
            )}
            
            {activeTab === 'period' && (
              <div className="space-y-3">
                <h3 className="text-[1rem]">Assessment Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-vita-gold rounded-full"></div>
                    <span className="text-[1rem]">Week 4: Research proposal (20%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-vita-gold rounded-full"></div>
                    <span className="text-[1rem]">Week 7: Midterm exam (30%)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-vita-gold rounded-full"></div>
                    <span className="text-[1rem]">Week 10: Final project (50%)</span>
                  </div>
                </div>
                <VitaChip variant="warning" size="medium">
                  Watch out: Heavy workload in weeks 7-10
                </VitaChip>
              </div>
            )}
          </div>
          
          {/* Media Strip */}
          <div className="md:col-span-1">
            <h3 className="text-[1rem] mb-3">Learn more</h3>
            <MediaStrip items={mediaItems} />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-3 pt-6">
          <VitaButton variant="primary" onClick={onTryTask}>
            Try a 60 second task for this programme
          </VitaButton>
          <VitaButton variant="ghost" onClick={onSeeAnother}>
            See another programme
          </VitaButton>
        </div>
      </div>
    </div>
  );
}
