import React, { useState } from "react";

// Here we define the structure of each line of code in the exercise
type CodeLine = {
  id: number;
  text: string;
};

// Here we define the starting order of the lines, this order is wrong on purpose
const initialLines: CodeLine[] = [
  { id: 1, text: "  return sum / numbers.length;" },
  { id: 2, text: "  let sum = 0;" },
  { id: 3, text: "  for (const n of numbers) {" },
  { id: 4, text: "    sum = sum + n;" },
  { id: 5, text: "  }" },
  { id: 6, text: "function mean(numbers: number[]) {" },
  { id: 7, text: "}" }
];

// Here we define the correct order as a sequence of ids
const correctOrder = [6, 2, 3, 4, 5, 1, 7];

// With this component we show the coding reorder microtask
export const CodeReorderTaskExample: React.FC = () => {
  // Here we keep the current order of the lines in a state variable
  const [lines, setLines] = useState<CodeLine[]>(initialLines);

  // Here we store feedback for the student after they press Check
  const [feedback, setFeedback] = useState<string | null>(null);

  // With this function we swap the selected line with the previous one
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLines = [...lines];
    const temp = newLines[index - 1];
    newLines[index - 1] = newLines[index];
    newLines[index] = temp;
    setLines(newLines);
    setFeedback(null);
  };

  // With this function we swap the selected line with the next one
  const moveDown = (index: number) => {
    if (index === lines.length - 1) return;
    const newLines = [...lines];
    const temp = newLines[index + 1];
    newLines[index + 1] = newLines[index];
    newLines[index] = temp;
    setLines(newLines);
    setFeedback(null);
  };

  // With this function we compare the current order with the correct order
  const checkAnswer = () => {
    const currentOrder = lines.map((line) => line.id);
    const isCorrect = currentOrder.every(
      (id, idx) => id === correctOrder[idx]
    );
    if (isCorrect) {
      setFeedback("Nice, this order gives a correct mean function.");
    } else {
      setFeedback("This order is not correct yet, we try one more time.");
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 24 }}>
      <h2>Coding reorder microtask</h2>
      <p>
        We imagine a core course in programming.
        The student must put the lines in the correct order to create a mean function.
      </p>

      <ol>
        {lines.map((line, index) => (
          <li
            key={line.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 4
            }}
          >
            <code style={{ flex: 1 }}>{line.text}</code>
            <div style={{ marginLeft: 8 }}>
              <button onClick={() => moveUp(index)}>Up</button>
              <button
                onClick={() => moveDown(index)}
                style={{ marginLeft: 4 }}
              >
                Down
              </button>
            </div>
          </li>
        ))}
      </ol>

      <button onClick={checkAnswer}>Check answer</button>

      {feedback && (
        <p style={{ marginTop: 8 }}>
          {feedback}
        </p>
      )}
    </div>
  );
};
