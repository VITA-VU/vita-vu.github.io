import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Splash } from './components/screens/Splash';
import { ConsentAndGoal } from './components/screens/ConsentAndGoal';
import { AvatarPick } from './components/screens/AvatarPick';
import { AvatarAndDetails } from './components/screens/AvatarDetails';
import { BasicDetails } from './components/screens/BasicDetails';
import { ProgrammeSearch } from './components/screens/ProgrammeSearch';
import { ProgrammePreview } from './components/screens/ProgrammePreview';
//import { ChoosePath } from './components/screens/ChoosePath';
import { MicroRIASEC } from './components/screens/MicroRIASEC';
import { StylePicker } from './components/screens/StylePicker';
import { TaskScreen } from './components/screens/TaskScreen';
import { ResultAndNextStep } from './components/screens/ResultAndNextStep';
import { TaskIntro } from './components/screens/TaskIntro';
import { TutorialManager } from './components/tutorial/TutorialManager';
import { TutorialWelcome } from './components/tutorial/TutorialWelcome';
import { TaskFeedback } from './components/screens/TaskFeedback';
import { initializeStudent, updateStudentRIASEC } from './components/api/requests';

// Global state context (or use localStorage/Redux)
import { createContext, useState, ReactNode } from 'react';

interface UserData {
  avatar?: string;
  pronouns?: string;
  firstName?: string;
  age?: string;
  profile?: string;
}

interface AppContextType {
  userData: UserData;
  setUserData: (data: UserData) => void;
  selectedProgramme?: string;
  setSelectedProgramme: (prog: string) => void;
  userPath?: 'explore' | 'help';
  setUserPath: (path: 'explore' | 'help') => void;
  riasecStyles?: string[];
  setRIASECStyles: (styles: string[]) => void;
  taskVariant?: string;
  setTaskVariant: (variant: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider wrapper
export function AppProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({});
  const [selectedProgramme, setSelectedProgramme] = useState<string>();
  const [userPath, setUserPath] = useState<'explore' | 'help'>();
  const [riasecStyles, setRIASECStyles] = useState<string[]>();
  const [taskVariant, setTaskVariant] = useState<string>();

  return (
    <AppContext.Provider value={{
      userData, setUserData,
      selectedProgramme, setSelectedProgramme,
      userPath, setUserPath,
      riasecStyles, setRIASECStyles,
      taskVariant, setTaskVariant
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Helper hook to use context
export function useAppContext() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}

// Helper components that wrap each route and use hooks inside
function SplashRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <Splash
      onStart={() => navigate('/consent')}
      tutorialEnabled={false}
      onTutorialToggle={() => {}}
      goHome={() => navigate('/')}
      goBack={() => navigate(-1)}
      currentLang="EN"
      onLangChange={() => {}}
    />
  );
}

function ConsentRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <ConsentAndGoal
      onStart={() => navigate('/avatardetails')}
      goHome={() => navigate('/')}
      currentLang="EN"
      onLangChange={() => {}}
    />
  );
}

function AvatarRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <AvatarPick
      onContinue={(data) => {
        ctx.setUserData({ ...ctx.userData, ...data });
        navigate('/basic-details');
      }}
      onSkip={() => navigate('/basic-details')}
      goHome={() => navigate('/')}
      goBack={() => navigate(-1)}
      currentLang="EN"
      onLangChange={() => {}}
    />
  );
}

function AvatarDetailsRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <AvatarAndDetails
      onContinue={(data) => {
        ctx.setUserData({ ...ctx.userData, ...data });
        initializeStudent();
        // navigate based on whether user already has a program in mind
        if (data.hasProgramInMind === 'yes') {
          navigate('/programme-search');
        } else {
          navigate('/micro-riasec');
        }
      }}
      onSkip={() => navigate('/Task-intro')}
      goHome={() => navigate('/')}
      goBack={() => navigate(-1)}
      currentLang="EN"
      onLangChange={() => {}}
      //selectedAvatar={ctx.userData?.avatar}
    />
  );
}

function BasicDetailsRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <BasicDetails
      onContinue={(data) => {
        ctx.setUserData({ ...ctx.userData, ...data });
        navigate('/programme-search');
      }}
      goHome={() => navigate('/')}
      goBack={() => navigate(-1)}
      currentLang="EN"
      onLangChange={() => {}}
      selectedAvatar={ctx.userData?.avatar}
    />
  );
}

function ProgrammeSearchRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <ProgrammeSearch
      onContinue={(prog) => {
        ctx.setSelectedProgramme(prog);
        navigate('/task-intro');
      }}
      goHome={() => navigate('/')}
      goBack={() => navigate(-1)}
      currentLang="EN"
      onLangChange={() => {}}
      selectedAvatar={ctx.userData?.avatar}
    />
  );
}

function TaskIntroRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <TaskIntro
      selectedProgram={ctx.selectedProgramme || ''}
      onContinue={() => {
        const prog = ctx.selectedProgramme || 'psychology';
        const taskMap: Record<string, string> = {
          'psychology': 'psychology',
          'business-analytics': 'business-analytics',
          'physics': 'physics'
        };
        ctx.setTaskVariant(taskMap[prog] || 'psychology');
        navigate('/task');
      }}
      goHome={() => navigate('/')}
      currentLang="EN"
      onLangChange={() => {}}
      selectedAvatar={ctx.userData?.avatar}
    />
  );
}

function TaskRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <TaskScreen
      taskVariant={ctx.taskVariant || 'psychology'}
      onComplete={() => navigate('/task-feedback')}
      goHome={() => navigate('/')}
      currentLang="EN"
      onLangChange={() => {}}
    />
  );
}

function TaskFeedbackRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <TaskFeedback
      onContinue={(stop) => {
        if (stop) {
          navigate('/result');
        } else
        navigate('/task');
      }}
      goHome={() => navigate('/')}
      currentLang="EN"
      onLangChange={() => {}}
      selectedAvatar={ctx.userData?.avatar}
    />
  );
}

function MicroRIASECRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <MicroRIASEC
      onComplete={(styles) => {
        updateStudentRIASEC();
        navigate('/task-intro');
      }}
      goHome={() => navigate('/')}
      goBack={() => navigate(-1)}
      currentLang="EN"
      onLangChange={() => {}}
      selectedAvatar={ctx.userData?.avatar}
    />
  );
}

function StylePickerRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <StylePicker
      onComplete={(styles) => {
        const map: Record<string, string> = {
          I: 'physics', R: 'physics', A: 'psychology',
          S: 'psychology', E: 'business-analytics', C: 'business-analytics'
        };
        ctx.setRIASECStyles(styles);
        ctx.setTaskVariant(map[styles[0]] || 'psychology');
        navigate('/task');
      }}
      goHome={() => navigate('/')}
      goBack={() => navigate(-1)}
      currentLang="EN"
      onLangChange={() => {}}
    />
  );
}

function ResultRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <ResultAndNextStep
      onSeeWeek={(p) => navigate(`/programme/${p}`)}
      onTryAnother={() => navigate('/task')}
      goHome={() => navigate('/')}
      goBack={() => navigate(-1)}
      currentLang="EN"
      onLangChange={() => {}}
      selectedAvatar={ctx.userData?.avatar}
    />
  );
}

function ProgrammePreviewRoute() {
  const navigate = useNavigate();
  const ctx = useAppContext();
  return (
    <ProgrammePreview
      programme={ctx.selectedProgramme || ''}
      onTryTask={() => navigate('/task')}
      onSeeAnother={() => navigate('/programme-search')}
      goHome={() => navigate('/')}
      goBack={() => navigate(-1)}
      currentLang="EN"
      onLangChange={() => {}}
    />
  );
}

// Main App component with routing
function AppRoutes() {
  const [showTutorialWelcome, setShowTutorialWelcome] = React.useState(false);
  const [tutorialEnabled, setTutorialEnabled] = React.useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<SplashRoute />} />
        <Route path="/consent" element={<ConsentRoute />} />
        {/* <Route path="/avatar" element={<AvatarRoute />} /> */}
        <Route path="/avatardetails" element={<AvatarDetailsRoute />} />
        {/* <Route path="/basic-details" element={<BasicDetailsRoute />} /> */}
        <Route path="/programme-search" element={<ProgrammeSearchRoute />} />
        <Route path="/task-intro" element={<TaskIntroRoute />} />
        <Route path="/task" element={<TaskRoute />} />
        {/* <Route path="/choose-path" element={<ChoosePathRoute />} /> */}
        <Route path="/micro-riasec" element={<MicroRIASECRoute />} />
        {/* <Route path="/style-picker" element={<StylePickerRoute />} /> */}
        <Route path="/result" element={<ResultRoute />} />
        {/* <Route path="/programme-preview" element={<ProgrammePreviewRoute />} /> */}
        <Route path="/task-feedback" element={<TaskFeedbackRoute />} />
      </Routes>

      <TutorialWelcome
        show={showTutorialWelcome}
        onStart={() => { setShowTutorialWelcome(false); setTutorialEnabled(true); }}
        onSkip={() => { setShowTutorialWelcome(false); setTutorialEnabled(false); }}
      />

      <TutorialManager
        currentScreen={window.location.pathname}
        enabled={tutorialEnabled}
        onComplete={() => setTutorialEnabled(false)}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
