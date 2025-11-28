import React, { useState, useRef } from "react";

// Here we define a few keywords that a simple rule based scorer will look for
const keywords = ["careful", "context", "preserve", "documentation", "record"];

// With this component we show the video plus short description microtask
export const VideoDescribeTaskExample: React.FC = () => {
  // Here we track whether the student has played the video at least once
  const [hasPlayed, setHasPlayed] = useState(false);

  // Here we track the text that the student writes
  const [answer, setAnswer] = useState("");

  // Here we keep a simple rating string to show back to the student
  const [rating, setRating] = useState<string | null>(null);

  // Here we keep a ref to the video element in case we want to inspect it later
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // With this handler we mark that the student pressed play
  const handlePlay = () => {
    setHasPlayed(true);
  };

  // With this function we apply a very simple scoring rule on the answer
  // Later we can replace this with a call to an LLM back end
  const rateAnswer = () => {
    const trimmed = answer.trim();

    if (!trimmed) {
      setRating("Empty answer.");
      return;
    }

    const length = trimmed.length;
    const lower = trimmed.toLowerCase();
    const hasKeyword = keywords.some((k) => lower.includes(k));

    if (length < 20) {
      setRating("Short answer, we mark this as weak.");
    } else if (hasKeyword) {
      setRating("Good answer, we captured the key idea.");
    } else {
      setRating(
        "Average answer, we have some information but we miss the key idea."
      );
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 24 }}>
      <h2>Video and description microtask</h2>
      <p>
        Look at this video of a chemistry explanation (20 seconds)
      </p>

      <video
        ref={videoRef}
        width={320}
        controls
        onPlay={handlePlay}
        style={{ display: "block", marginBottom: 12, background: "black" }}
      >
        {/* Here we would provide a real video file such as excavation.mp4.
            For now we keep a placeholder source name,
            the player will still show the frame. */}
        <source src="video_example.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {!hasPlayed && (
        <p style={{ fontSize: 12 }}>
          We play the video before we answer.
        </p>
      )}

      <textarea
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          setRating(null);
        }}
        rows={4}
        style={{ width: "100%", marginBottom: 8 }}
        placeholder="We write here what we understood."
      />

      <button onClick={rateAnswer}>Submit answer</button>

      {rating && (
        <p style={{ marginTop: 8 }}>
          {rating}
        </p>
      )}
    </div>
  );
};
