import React, { useState } from "react";

// Here we describe one picture item in the exercise
type PictureItem = {
  id: number;
  label: string;          // here we use text instead of real images for now
  correctGroup: "BC" | "AD";
};

// Here we list our six example artefacts with their correct group
const pictureItems: PictureItem[] = [
  { id: 1, label: "Ancient Greek vase", correctGroup: "BC" },
  { id: 2, label: "Roman coin", correctGroup: "BC" },
  { id: 3, label: "Medieval church", correctGroup: "AD" },
  { id: 4, label: "Stone tool fragment", correctGroup: "BC" },
  { id: 5, label: "Modern printed book", correctGroup: "AD" },
  { id: 6, label: "Early Christian symbol", correctGroup: "AD" }
];

// With this component we show the picture grouping microtask
export const PictureGroupingTaskExample: React.FC = () => {
  // Here we keep the chosen group for each picture id
  const [answers, setAnswers] = useState<Record<number, "BC" | "AD" | "">>(
    () => {
      const initial: Record<number, "BC" | "AD" | ""> = {};
      pictureItems.forEach((item) => {
        initial[item.id] = "";
      });
      return initial;
    }
  );

  // Here we store a feedback message after checking
  const [feedback, setFeedback] = useState<string | null>(null);

  // With this function we change the group for one picture
  const handleChange = (id: number, value: "BC" | "AD" | "") => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value
    }));
    setFeedback(null);
  };

  // With this function we count how many group choices are correct
  const checkAnswer = () => {
    let correctCount = 0;
    pictureItems.forEach((item) => {
      if (answers[item.id] === item.correctGroup) {
        correctCount += 1;
      }
    });

    if (correctCount === pictureItems.length) {
      setFeedback("All artefacts are in the right group.");
    } else {
      setFeedback(
        `We grouped ${correctCount} out of ${pictureItems.length} artefacts correctly.`
      );
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 24 }}>
      <h2>Picture grouping microtask</h2>
      <p>
        We imagine a core course in archaeology.
        The student groups each artefact into BC or AD.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12
        }}
      >
        {pictureItems.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #eee",
              padding: 8,
              borderRadius: 4
            }}
          >
            {/* Here we would normally show an image.
                For now we show a text label in a grey box. */}
            <div
              style={{
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f8f8f8",
                marginBottom: 8
              }}
            >
              <span>{item.label}</span>
            </div>

            <label>
              Group:
              <select
                value={answers[item.id]}
                onChange={(e) =>
                  handleChange(
                    item.id,
                    e.target.value === ""
                      ? ""
                      : (e.target.value as "BC" | "AD")
                  )
                }
                style={{ marginLeft: 8 }}
              >
                <option value="">Choose</option>
                <option value="BC">BC</option>
                <option value="AD">AD</option>
              </select>
            </label>
          </div>
        ))}
      </div>

      <button onClick={checkAnswer} style={{ marginTop: 12 }}>
        Check answer
      </button>

      {feedback && (
        <p style={{ marginTop: 8 }}>
          {feedback}
        </p>
      )}
    </div>
  );
};
