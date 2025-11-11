import { TutorialStep } from './TutorialSpotlight';

// Tutorial steps for each screen
export const tutorialSteps: Record<string, TutorialStep[]> = {
  splash: [
    {
      target: '[data-tutorial="language-toggle"]',
      title: 'Switch Languages',
      description: 'Toggle between English and Dutch at any time during your journey.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="start-button"]',
      title: 'Begin Your Journey',
      description: 'Click here to start exploring academic programmes at VU Amsterdam.',
      position: 'top'
    }
  ],
  
  consent: [
    {
      target: '[data-tutorial="explore-path"]',
      title: 'I Know What I Want',
      description: 'Choose this if you already have a specific programme in mind and want to explore it through tasks.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="help-path"]',
      title: 'Help Me Choose',
      description: 'Not sure which programme? Let us guide you through personality-based or random tasks to discover your fit.',
      position: 'top'
    }
  ],
  
  avatar: [
    {
      target: '[data-tutorial="avatar-grid"]',
      title: 'Pick Your Avatar',
      description: 'Choose a griffon that represents your interests or personality. This is just for fun!',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="pronouns-select"]',
      title: 'Set Your Pronouns',
      description: 'Let us know how you\'d like to be addressed throughout the app.',
      position: 'bottom'
    }
  ],
  
  basicDetails: [
    {
      target: '[data-tutorial="first-name-input"]',
      title: 'Tell Us Your Name',
      description: 'We\'ll use your first name to personalize your experience.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="age-input"]',
      title: 'Share Your Age',
      description: 'This helps us tailor recommendations to your stage of life.',
      position: 'bottom'
    }
  ],
  
  programmeSearch: [
    {
      target: '[data-tutorial="search-input"]',
      title: 'Search Programmes',
      description: 'Type to search for programmes by name, like "Psychology" or "Business".',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="programme-list"]',
      title: 'Browse & Select',
      description: 'Tap any programme card to see a detailed preview and try a sample task.',
      position: 'bottom'
    }
  ],
  
  programmePreview: [
    {
      target: '[data-tutorial="programme-card"]',
      title: 'Programme Overview',
      description: 'See key details about this programme, including what you\'ll study.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="try-task-button"]',
      title: 'Try a Sample Task',
      description: 'Experience what studying this programme is like through a short, interactive task.',
      position: 'top'
    }
  ],
  
  choosePath: [
    {
      target: '[data-tutorial="random-task"]',
      title: 'Surprise Me!',
      description: 'Jump straight into a random task and discover something unexpected.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="riasec-path"]',
      title: 'Personality Match',
      description: 'Answer a few quick questions based on RIASEC personality types to find your fit.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="style-picker"]',
      title: 'Visual Style Picker',
      description: 'Choose study styles that appeal to you visually for a personalized task.',
      position: 'bottom'
    }
  ],
  
  microRIASEC: [
    {
      target: '[data-tutorial="riasec-question"]',
      title: 'Quick Questions',
      description: 'Select the option that resonates most with you. There are no wrong answers!',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="progress-indicator"]',
      title: 'Track Your Progress',
      description: 'See how many questions you have left to complete.',
      position: 'top'
    }
  ],
  
  stylePicker: [
    {
      target: '[data-tutorial="style-cards"]',
      title: 'Pick What Appeals to You',
      description: 'Select the learning styles that look most interesting. You can choose multiple!',
      position: 'bottom'
    }
  ],
  
  task: [
    {
      target: '[data-tutorial="timer-pill"]',
      title: 'Task Timer',
      description: 'This shows how much time the task typically takes. Take your time!',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="task-content"]',
      title: 'Try the Task',
      description: 'This is a real example of what you might do in this programme. Give it a try!',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="submit-button"]',
      title: 'Submit Your Work',
      description: 'When you\'re done, click here to see your results and next steps.',
      position: 'top'
    }
  ],
  
  result: [
    {
      target: '[data-tutorial="result-card"]',
      title: 'Your Results',
      description: 'See how you did and what this means for your programme fit.',
      position: 'bottom'
    },
    {
      target: '[data-tutorial="see-week-button"]',
      title: 'Explore More',
      description: 'See what a full week in this programme looks like.',
      position: 'top'
    },
    {
      target: '[data-tutorial="try-another-button"]',
      title: 'Try Another Task',
      description: 'Want to explore a different programme? Try another task!',
      position: 'top'
    }
  ]
};

// Full flow tutorials (multi-screen)
export const flowTutorials = {
  explore: ['splash', 'consent', 'avatar', 'basicDetails', 'programmeSearch', 'programmePreview', 'task', 'result'],
  help: ['splash', 'consent', 'avatar', 'basicDetails', 'choosePath', 'microRIASEC', 'task', 'result']
};
