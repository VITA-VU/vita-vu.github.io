import React, { useState } from "react";

// Here we describe one step in the timeline of a project
type TaskStep = {
  id: number;
  title: string;
  duration: string;      // we keep a small human label for time such as "20 minutes"
  description: string;   // we keep a short explanation of this step
};

// Here we describe one project envelope
type Project = {
  id: number;
  name: string;
  domain: string;
  problem: string;
  steps: TaskStep[];     // we keep the suggested correct order of steps here
};

// Here we define four example projects
// In a real system we would receive this from the back end as JSON
const projects: Project[] = [
  {
    id: 1,
    name: "Excavation planning",
    domain: "Archaeology",
    problem: "Plan a one day excavation of a small site with limited time and budget.",
    steps: [
      {
        id: 11,
        title: "Request permission and check regulations",
        duration: "30 minutes",
        description: "We make sure we can legally work on the site."
      },
      {
        id: 12,
        title: "Lay out the grid and mark units",
        duration: "20 minutes",
        description: "We divide the site into clear squares so we can record finds."
      },
      {
        id: 13,
        title: "Excavate carefully and document finds",
        duration: "4 hours",
        description: "We remove soil slowly and log where every artefact comes from."
      },
      {
        id: 14,
        title: "Store and label the finds",
        duration: "40 minutes",
        description: "We place artefacts in bags and boxes with clear labels."
      }
    ]
  },
  {
    id: 2,
    name: "Survey design",
    domain: "Social sciences",
    problem: "Design a short survey to study how students feel about online exams.",
    steps: [
      {
        id: 21,
        title: "Define the research question",
        duration: "25 minutes",
        description: "We decide exactly what we want to learn from the survey."
      },
      {
        id: 22,
        title: "Write and test the survey questions",
        duration: "50 minutes",
        description: "We draft questions and test them with a small pilot."
      },
      {
        id: 23,
        title: "Choose the sample and invitation plan",
        duration: "35 minutes",
        description: "We decide who will be invited and how."
      },
      {
        id: 24,
        title: "Prepare data collection and storage",
        duration: "30 minutes",
        description: "We set up the survey tool and plan where data will be stored."
      }
    ]
  },
  {
    id: 3,
    name: "Data story",
    domain: "Data science",
    problem: "Explain to a city council how traffic changes during the week with simple visuals.",
    steps: [
      {
        id: 31,
        title: "Clean the raw traffic data",
        duration: "45 minutes",
        description: "We remove duplicates and fix obvious data issues."
      },
      {
        id: 32,
        title: "Explore patterns with simple plots",
        duration: "40 minutes",
        description: "We look at daily and hourly patterns in the traffic data."
      },
      {
        id: 33,
        title: "Draft a simple visual story",
        duration: "30 minutes",
        description: "We sketch a sequence of two or three clear charts."
      },
      {
        id: 34,
        title: "Check that a non expert can follow",
        duration: "20 minutes",
        description: "We show the story to a friend and see if it is clear."
      }
    ]
  },
  {
    id: 4,
    name: "Health brochure",
    domain: "Communication and health",
    problem: "Create a one page brochure that explains a health recommendation for students.",
    steps: [
      {
        id: 41,
        title: "Identify the key message",
        duration: "20 minutes",
        description: "We agree on one main take away we want students to remember."
      },
      {
        id: 42,
        title: "Collect accurate and simple facts",
        duration: "30 minutes",
        description: "We gather trusted information and remove jargon."
      },
      {
        id: 43,
        title: "Draft text and visuals for the brochure",
        duration: "45 minutes",
        description: "We write short sentences and choose simple icons or pictures."
      },
      {
        id: 44,
        title: "Ask for feedback from a target reader",
        duration: "25 minutes",
        description: "We test the brochure with a student and adjust unclear parts."
      }
    ]
  }
];

// With this component we show the full microtask
// First we let the student choose one project
// Then we let the student reorder the timeline of steps for that chosen project
export const ProjectChoiceAndTimelineTask: React.FC = () => {
  // Here we track whether we are in the project choice phase or the timeline phase
  const [phase, setPhase] = useState<"choice" | "timeline">("choice");

  // Here we store which project id the student has highlighted
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  // Here we store the current order of steps for the chosen project
  // We fill this only when we move into the timeline phase
  const [currentSteps, setCurrentSteps] = useState<TaskStep[] | null>(null);

  // Here we store a feedback message after the student presses Check order
  const [feedback, setFeedback] = useState<string | null>(null);

  // Here we find the selected project object from the id
  const selectedProject =
    selectedProjectId != null
      ? projects.find((p) => p.id === selectedProjectId) || null
      : null;

  // With this function we move from the choice phase to the timeline phase
  const handleContinue = () => {
    if (!selectedProject) {
      return;
    }
    // We create a fresh copy of the steps so we can reorder them
    const clonedSteps = selectedProject.steps.map((step) => ({ ...step }));
    setCurrentSteps(clonedSteps);
    setFeedback(null);
    setPhase("timeline");
  };

  // With this function we swap the step at the given index with the previous one
  const moveStepUp = (index: number) => {
    if (!currentSteps) return;
    if (index === 0) return;
    const newSteps = [...currentSteps];
    const temp = newSteps[index - 1];
    newSteps[index - 1] = newSteps[index];
    newSteps[index] = temp;
    setCurrentSteps(newSteps);
    setFeedback(null);
  };

  // With this function we swap the step at the given index with the next one
  const moveStepDown = (index: number) => {
    if (!currentSteps) return;
    if (index === currentSteps.length - 1) return;
    const newSteps = [...currentSteps];
    const temp = newSteps[index + 1];
    newSteps[index + 1] = newSteps[index];
    newSteps[index] = temp;
    setCurrentSteps(newSteps);
    setFeedback(null);
  };

  // With this function we compare the current order with the recommended order
  const checkOrder = () => {
    if (!selectedProject || !currentSteps) return;

    const correctIds = selectedProject.steps.map((step) => step.id);
    const currentIds = currentSteps.map((step) => step.id);

    const allMatch = correctIds.every((id, idx) => id === currentIds[idx]);

    if (allMatch) {
      setFeedback(
        "This order matches the suggested project plan."
      );
    } else {
      setFeedback(
        "This order is different from the suggested plan. We can adjust and try again."
      );
    }
  };

  // With this function we reset the order to the suggested one
  const resetOrder = () => {
    if (!selectedProject) return;
    const clonedSteps = selectedProject.steps.map((step) => ({ ...step }));
    setCurrentSteps(clonedSteps);
    setFeedback(null);
  };

  // Here we render the project choice phase
  if (phase === "choice") {
    return (
      <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 24 }}>
        <h2>Choose a project envelope</h2>
        <p>
          We imagine four possible projects from one or more core courses.
          The student chooses one envelope to open and then works with a small timeline puzzle.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            marginTop: 16
          }}
        >
          {projects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            return (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                style={{
                  textAlign: "left",
                  border: isSelected ? "2px solid #0077cc" : "1px solid #ccc",
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: isSelected ? "#e6f3ff" : "#fafafa",
                  cursor: "pointer"
                }}
              >
                <h3 style={{ marginTop: 0 }}>{project.name}</h3>
                <p style={{ margin: "4px 0", fontStyle: "italic" }}>
                  Domain: {project.domain}
                </p>
                <p style={{ margin: "4px 0", fontSize: 14 }}>
                  Problem: {project.problem}
                </p>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleContinue}
            disabled={!selectedProject}
            style={{
              padding: "8px 16px",
              fontSize: 14,
              cursor: selectedProject ? "pointer" : "not-allowed"
            }}
          >
            Continue with this project
          </button>
          {!selectedProject && (
            <p style={{ marginTop: 8, fontSize: 12 }}>
              We first choose one project envelope.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Here we render the timeline reorder phase
  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 24 }}>
      {selectedProject && (
        <>
          <h2>Reorder the timeline for this project</h2>
          <p>
            Project: <strong>{selectedProject.name}</strong> 
            {" "} from <strong>{selectedProject.domain}</strong>
          </p>
          <p style={{ marginTop: 4 }}>
            Scenario: {selectedProject.problem}
          </p>
        </>
      )}

      <p style={{ marginTop: 12 }}>
        We now place the steps in the order that makes the most sense for this project.
        We can move each step up or down, then press Check order.
      </p>

      <ol style={{ marginTop: 12 }}>
        {currentSteps &&
          currentSteps.map((step, index) => (
            <li
              key={step.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 6,
                padding: 8,
                marginBottom: 8,
                display: "flex",
                alignItems: "flex-start",
                gap: 8
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>{step.title}</div>
                <div style={{ fontSize: 12, marginTop: 2 }}>
                  Duration: {step.duration}
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  {step.description}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button onClick={() => moveStepUp(index)}>Up</button>
                <button onClick={() => moveStepDown(index)}>Down</button>
              </div>
            </li>
          ))}
      </ol>

      <div style={{ marginTop: 8 }}>
        <button onClick={checkOrder} style={{ marginRight: 8 }}>
          Check order
        </button>
        <button onClick={resetOrder} style={{ marginRight: 8 }}>
          Reset to suggested order
        </button>
        <button
          onClick={() => {
            setPhase("choice");
            setSelectedProjectId(null);
            setCurrentSteps(null);
            setFeedback(null);
          }}
        >
          Choose a different project
        </button>
      </div>

      {feedback && (
        <p style={{ marginTop: 8 }}>
          {feedback}
        </p>
      )}
    </div>
  );
};
