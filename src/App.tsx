import React, { useState } from 'react';
import { Splash } from './components/screens/Splash';
import { ConsentAndGoal } from './components/screens/ConsentAndGoal';
import { AvatarPick } from './components/screens/AvatarPick';
import { BasicDetails } from './components/screens/BasicDetails';
import { ProgrammeSearch } from './components/screens/ProgrammeSearch';
import { ProgrammePreview } from './components/screens/ProgrammePreview';
import { ChoosePath } from './components/screens/ChoosePath';
import { MicroRIASEC } from './components/screens/MicroRIASEC';
import { StylePicker } from './components/screens/StylePicker';
import { TaskScreen } from './components/screens/TaskScreen';
import { ResultAndNextStep } from './components/screens/ResultAndNextStep';
import { TutorialManager } from './components/tutorial/TutorialManager';
import { TutorialWelcome } from './components/tutorial/TutorialWelcome';

type Screen = 
  | 'splash'
  | 'consent'
  | 'avatar'
  | 'basic-details'
  | 'programme-search'
  | 'programme-preview'
  | 'choose-path'
  | 'micro-riasec'
  | 'style-picker'
  | 'task'
  | 'result';

type TaskVariant = 'psychology' | 'business-analytics' | 'physics';

interface AppState {
  screen: Screen;
  language: 'EN' | 'NL';
  userPath?: 'explore' | 'help';
  userData?: {
    avatar?: string;
    pronouns?: string;
    firstName?: string;
    age?: string;
    profile?: string;
  };
  selectedProgramme?: string;
  riasecStyles?: string[];
  taskVariant?: TaskVariant;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    screen: 'splash',
    language: 'EN'
  });
  
  const [showTutorialWelcome, setShowTutorialWelcome] = useState(true);
  const [tutorialEnabled, setTutorialEnabled] = useState(false);
  
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };
  
  const handleLanguageChange = (language: 'EN' | 'NL') => {
    updateState({ language });
  };
  
  // Navigation handlers
  const handleSplashStart = () => {
    updateState({ screen: 'consent' });
  };
  
  const handleConsentPath = (path: 'explore' | 'help') => {
    updateState({ 
      userPath: path,
      screen: 'avatar'
    });
  };
  
  const handleAvatarContinue = (data: { avatar?: string; pronouns?: string }) => {
    updateState({
      userData: { ...state.userData, ...data },
      screen: 'basic-details'
    });
  };
  
  const handleAvatarSkip = () => {
    updateState({ screen: 'basic-details' });
  };
  
  const handleBasicDetailsContinue = (data: { firstName: string; age: string; profile: string }) => {
    updateState({
      userData: { ...state.userData, ...data },
      screen: state.userPath === 'explore' ? 'programme-search' : 'choose-path'
    });
  };
  
  const handleProgrammeSelect = (programme: string) => {
    updateState({
      selectedProgramme: programme,
      screen: 'programme-preview'
    });
  };
  
  const handleProgrammeTryTask = () => {
    // Map programme to task variant
    const taskMap: Record<string, TaskVariant> = {
      'psychology': 'psychology',
      'business-analytics': 'business-analytics',
      'physics': 'physics'
    };
    
    updateState({
      taskVariant: taskMap[state.selectedProgramme || 'psychology'] || 'psychology',
      screen: 'task'
    });
  };
  
  const handleProgrammeSeeAnother = () => {
    updateState({ screen: 'programme-search' });
  };
  
  const handleChoosePath = (choice: 'random' | 'riasec' | 'pick-style') => {
    if (choice === 'random') {
      const variants: TaskVariant[] = ['psychology', 'business-analytics', 'physics'];
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      updateState({
        taskVariant: randomVariant,
        screen: 'task'
      });
    } else if (choice === 'riasec') {
      updateState({ screen: 'micro-riasec' });
    } else if (choice === 'pick-style') {
      updateState({ screen: 'style-picker' });
    }
  };
  
  const handleRIASECComplete = (styles: string[]) => {
    // Map RIASEC to task
    const taskMap: Record<string, TaskVariant> = {
      'I': 'physics',
      'R': 'physics',
      'A': 'psychology',
      'S': 'psychology',
      'E': 'business-analytics',
      'C': 'business-analytics'
    };
    
    const taskVariant = taskMap[styles[0]] || 'psychology';
    
    updateState({
      riasecStyles: styles,
      taskVariant,
      screen: 'task'
    });
  };
  
  const handleStylePickerComplete = (styles: string[]) => {
    const taskMap: Record<string, TaskVariant> = {
      'I': 'physics',
      'R': 'physics',
      'A': 'psychology',
      'S': 'psychology',
      'E': 'business-analytics',
      'C': 'business-analytics'
    };
    
    const taskVariant = taskMap[styles[0]] || 'psychology';
    
    updateState({
      riasecStyles: styles,
      taskVariant,
      screen: 'task'
    });
  };
  
  const handleTaskComplete = () => {
    updateState({ screen: 'result' });
  };
  
  const handleResultSeeWeek = (programme: string) => {
    updateState({
      selectedProgramme: programme,
      screen: 'programme-preview'
    });
  };
  
  const handleResultTryAnother = () => {
    const variants: TaskVariant[] = ['psychology', 'business-analytics', 'physics'];
    const currentIndex = variants.indexOf(state.taskVariant || 'psychology');
    const nextIndex = (currentIndex + 1) % variants.length;
    
    updateState({
      taskVariant: variants[nextIndex],
      screen: 'task'
    });
  };
  
  const handleBack = () => {
    if (state.screen === 'micro-riasec' || state.screen === 'style-picker') {
      updateState({ screen: 'choose-path' });
    }
  };
  
  // Render current screen
  const renderScreen = () => {
    switch (state.screen) {
      case 'splash':
        return (
          <Splash
            onStart={handleSplashStart}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
            tutorialEnabled={tutorialEnabled}
            onTutorialToggle={() => setTutorialEnabled(!tutorialEnabled)}
          />
        );
      
      case 'consent':
        return (
          <ConsentAndGoal
            onChoosePath={handleConsentPath}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
          />
        );
      
      case 'avatar':
        return (
          <AvatarPick
            onContinue={handleAvatarContinue}
            onSkip={handleAvatarSkip}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
          />
        );
      
      case 'basic-details':
        return (
          <BasicDetails
            onContinue={handleBasicDetailsContinue}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
            selectedAvatar={state.userData?.avatar}
          />
        );
      
      case 'programme-search':
        return (
          <ProgrammeSearch
            onContinue={handleProgrammeSelect}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
          />
        );
      
      case 'programme-preview':
        return (
          <ProgrammePreview
            programme={state.selectedProgramme || 'psychology'}
            onTryTask={handleProgrammeTryTask}
            onSeeAnother={handleProgrammeSeeAnother}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
          />
        );
      
      case 'choose-path':
        return (
          <ChoosePath
            onChoose={handleChoosePath}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
          />
        );
      
      case 'micro-riasec':
        return (
          <MicroRIASEC
            onComplete={handleRIASECComplete}
            onBack={handleBack}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
            selectedAvatar={state.userData?.avatar}
          />
        );
      
      case 'style-picker':
        return (
          <StylePicker
            onComplete={handleStylePickerComplete}
            onBack={handleBack}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
          />
        );
      
      case 'task':
        return (
          <TaskScreen
            taskVariant={state.taskVariant || 'psychology'}
            onComplete={handleTaskComplete}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
          />
        );
      
      case 'result':
        return (
          <ResultAndNextStep
            onSeeWeek={handleResultSeeWeek}
            onTryAnother={handleResultTryAnother}
            currentLang={state.language}
            onLangChange={handleLanguageChange}
          />
        );
      
      default:
        return <div>Screen not found</div>;
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      {renderScreen()}
      
      <TutorialWelcome
        show={showTutorialWelcome}
        onStart={() => {
          setShowTutorialWelcome(false);
          setTutorialEnabled(true);
        }}
        onSkip={() => {
          setShowTutorialWelcome(false);
          setTutorialEnabled(false);
        }}
      />
      
      <TutorialManager
        currentScreen={state.screen}
        enabled={tutorialEnabled}
        onComplete={() => setTutorialEnabled(false)}
      />
    </div>
  );
}