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

  const [showTutorialWelcome, setShowTutorialWelcome] = useState(false);
  const [tutorialEnabled, setTutorialEnabled] = useState(false);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleLanguageChange = (language: 'EN' | 'NL') => {
    updateState({ language });
  };

  //
  // ─── GLOBAL NAVIGATION ───────────────────────────────────────────────────────────
  //

  // ⭐ Home button always goes back to splash
  const goHome = () => {
    updateState({ screen: 'splash' });
  };

  // ⭐ Back button logic based on active screen
  const goBack = () => {
    switch (state.screen) {
      case 'avatar':
        updateState({ screen: 'consent' });
        break;

      case 'basic-details':
        updateState({ screen: 'avatar' });
        break;

      case 'programme-search':
        updateState({ screen: 'basic-details' });
        break;

      case 'programme-preview':
        updateState({ screen: 'programme-search' });
        break;

      case 'choose-path':
        updateState({ screen: 'basic-details' });
        break;

      case 'micro-riasec':
      case 'style-picker':
        updateState({ screen: 'choose-path' });
        break;

      case 'task':
        updateState({ screen: 'programme-preview' });
        break;

      case 'result':
        updateState({ screen: 'task' });
        break;

      default:
        break;
    }
  };

  //
  // ─── EXISTING HANDLERS (UNCHANGED) ──────────────────────────────────────────────
  //

  const handleSplashStart = () => updateState({ screen: 'consent' });

  const handleConsentPath = (path: 'explore' | 'help') => {
    updateState({ userPath: path, screen: 'avatar' });
  };

  const handleAvatarContinue = (data: { avatar?: string; pronouns?: string }) => {
    updateState({ userData: { ...state.userData, ...data }, screen: 'basic-details' });
  };

  const handleAvatarSkip = () => updateState({ screen: 'basic-details' });

  const handleBasicDetailsContinue = (data: { firstName: string; age: string; profile: string }) => {
    updateState({
      userData: { ...state.userData, ...data },
      screen: state.userPath === 'explore' ? 'programme-search' : 'choose-path'
    });
  };

  const handleProgrammeSelect = (programme: string) => {
    updateState({ selectedProgramme: programme, screen: 'programme-preview' });
  };

  const handleProgrammeTryTask = () => {
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

  const handleProgrammeSeeAnother = () => updateState({ screen: 'programme-search' });

  const handleChoosePath = (choice: 'random' | 'riasec' | 'pick-style') => {
    if (choice === 'random') {
      const variants: TaskVariant[] = ['psychology', 'business-analytics', 'physics'];
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      updateState({ taskVariant: randomVariant, screen: 'task' });
    } else if (choice === 'riasec') {
      updateState({ screen: 'micro-riasec' });
    } else {
      updateState({ screen: 'style-picker' });
    }
  };

  const handleRIASECComplete = (styles: string[]) => {
    const map: Record<string, TaskVariant> = {
      I: 'physics',
      R: 'physics',
      A: 'psychology',
      S: 'psychology',
      E: 'business-analytics',
      C: 'business-analytics'
    };

    updateState({
      riasecStyles: styles,
      taskVariant: map[styles[0]] || 'psychology',
      screen: 'task'
    });
  };

  const handleStylePickerComplete = (styles: string[]) => {
    const map: Record<string, TaskVariant> = {
      I: 'physics',
      R: 'physics',
      A: 'psychology',
      S: 'psychology',
      E: 'business-analytics',
      C: 'business-analytics'
    };

    updateState({
      riasecStyles: styles,
      taskVariant: map[styles[0]] || 'psychology',
      screen: 'task'
    });
  };

  const handleTaskComplete = () => updateState({ screen: 'result' });

  const handleResultSeeWeek = (programme: string) => {
    updateState({ selectedProgramme: programme, screen: 'programme-preview' });
  };

  const handleResultTryAnother = () => {
    const variants: TaskVariant[] = ['psychology', 'business-analytics', 'physics'];
    const i = variants.indexOf(state.taskVariant || 'psychology');
    updateState({ taskVariant: variants[(i + 1) % variants.length], screen: 'task' });
  };

  //
  // ─── RENDER SCREEN WITH PASSED NAV PROPS ─────────────────────────────────────────
  //

  const renderScreen = () => {
    const sharedNav = { goHome, goBack, currentLang: state.language, onLangChange: handleLanguageChange };

    switch (state.screen) {
      case 'splash':
        return (
          <Splash
            onStart={handleSplashStart}
            {...sharedNav}
            tutorialEnabled={tutorialEnabled}
            onTutorialToggle={() => setTutorialEnabled(!tutorialEnabled)}
          />
        );

      case 'consent':
        return (
          <ConsentAndGoal
            onChoosePath={handleConsentPath}
            {...sharedNav}
          />
        );

      case 'avatar':
        return (
          <AvatarPick
            onContinue={handleAvatarContinue}
            onSkip={handleAvatarSkip}
            {...sharedNav}
            selectedAvatar={state.userData?.avatar}
          />
        );

      case 'basic-details':
        return (
          <BasicDetails
            onContinue={handleBasicDetailsContinue}
            {...sharedNav}
            selectedAvatar={state.userData?.avatar}
          />
        );

      case 'programme-search':
        return (
          <ProgrammeSearch
            onContinue={handleProgrammeSelect}
            {...sharedNav}
          />
        );

      case 'programme-preview':
        return (
          <ProgrammePreview
            programme={state.selectedProgramme || 'psychology'}
            onTryTask={handleProgrammeTryTask}
            onSeeAnother={handleProgrammeSeeAnother}
            {...sharedNav}
          />
        );

      case 'choose-path':
        return (
          <ChoosePath
            onChoose={handleChoosePath}
            {...sharedNav}
          />
        );

      case 'micro-riasec':
        return (
          <MicroRIASEC
            onComplete={handleRIASECComplete}
            {...sharedNav}
            selectedAvatar={state.userData?.avatar}
          />
        );

      case 'style-picker':
        return (
          <StylePicker
            onComplete={handleStylePickerComplete}
            {...sharedNav}
          />
        );

      case 'task':
        return (
          <TaskScreen
            taskVariant={state.taskVariant || 'psychology'}
            onComplete={handleTaskComplete}
            {...sharedNav}
          />
        );

      case 'result':
        return (
          <ResultAndNextStep
            onSeeWeek={handleResultSeeWeek}
            onTryAnother={handleResultTryAnother}
            {...sharedNav}
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
        onStart={() => { setShowTutorialWelcome(false); setTutorialEnabled(true); }}
        onSkip={() => { setShowTutorialWelcome(false); setTutorialEnabled(false); }}
      />

      <TutorialManager
        currentScreen={state.screen}
        enabled={tutorialEnabled}
        onComplete={() => setTutorialEnabled(false)}
      />
    </div>
  );
}
