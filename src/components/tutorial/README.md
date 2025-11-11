# VITA Discovery Tutorial System

An interactive tutorial/walkthrough system that guides users through the VITA Discovery app with spotlight highlights and helpful hints.

## Components

### TutorialSpotlight
The main spotlight component that creates an overlay with a radial gradient cutout to highlight specific elements.

**Features:**
- Dynamic positioning based on target element
- Pulsing gold ring animation around highlighted elements
- Tooltip with step information and progress dots
- Configurable position (top, bottom, left, right)
- Skip and navigation controls

### TutorialManager
Manages tutorial state and coordinates the tutorial flow across different screens.

**Features:**
- Auto-resets when screen changes
- Shows floating help button when tutorial is dismissed
- Handles step progression and completion
- Integrates with tutorialSteps configuration

### TutorialWelcome
Initial welcome modal that appears on first load.

**Features:**
- Introduces the tutorial feature
- Explains benefits with icons
- Allows users to start or skip

### TutorialToggle
Settings menu component to enable/disable tutorials.

**Features:**
- Accessible from app header
- Toggle switch with visual feedback
- Helpful tips when enabled

## Tutorial Steps Configuration

Tutorial steps are defined in `tutorialSteps.ts`. Each screen can have its own set of steps.

### Adding Tutorial Steps to a Screen

1. **Add data-tutorial attributes to your JSX elements:**

```tsx
<div data-tutorial="my-button">
  <VitaButton onClick={handleClick}>Click Me</VitaButton>
</div>
```

2. **Define steps in tutorialSteps.ts:**

```typescript
export const tutorialSteps: Record<string, TutorialStep[]> = {
  myScreen: [
    {
      target: '[data-tutorial="my-button"]',  // CSS selector
      title: 'Click This Button',
      description: 'This button does something important!',
      position: 'bottom',  // Optional: top, bottom, left, right
      offset: { x: 0, y: 0 }  // Optional: fine-tune position
    }
  ]
};
```

## Usage in App.tsx

```tsx
import { TutorialManager } from './components/tutorial/TutorialManager';
import { TutorialWelcome } from './components/tutorial/TutorialWelcome';

export default function App() {
  const [tutorialEnabled, setTutorialEnabled] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  return (
    <div>
      {/* Your app content */}
      
      <TutorialWelcome
        show={showWelcome}
        onStart={() => {
          setShowWelcome(false);
          setTutorialEnabled(true);
        }}
        onSkip={() => {
          setShowWelcome(false);
        }}
      />
      
      <TutorialManager
        currentScreen={currentScreen}
        enabled={tutorialEnabled}
        onComplete={() => setTutorialEnabled(false)}
      />
    </div>
  );
}
```

## Styling

The tutorial uses:
- **Gold accent color** (`--vita-gold`) for highlights and rings
- **Pulsing animation** for attention-grabbing effect
- **Radial gradient overlay** with 70% opacity black background
- **Z-index layers**: 9998 (overlay), 9999 (ring), 10000 (tooltip), 10001 (modals)

## Best Practices

1. **Keep steps focused**: Each step should highlight one specific action
2. **Use clear language**: Describe what the user should do, not just what the feature is
3. **Logical progression**: Order steps in the natural flow of usage
4. **Limit steps per screen**: 2-4 steps per screen is ideal
5. **Test positioning**: Make sure tooltips don't overflow the viewport
6. **Make targets clickable**: Don't prevent interaction with highlighted elements

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation supported (ESC to close modals)
- Focus management for modal dialogs
- High contrast spotlight effect
- Skip functionality always available
