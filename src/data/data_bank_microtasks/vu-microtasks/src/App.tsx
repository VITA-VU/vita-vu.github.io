import React from "react";

// Here we import the three earlier microtask examples
import { CodeReorderTaskExample } from "./CodeReorderTaskExample";
import { PictureGroupingTaskExample } from "./PictureGroupingTaskExample";
import { VideoDescribeTaskExample } from "./VideoDescribeTaskExample";

// Here we import the new choose a project plus timeline microtask
import { ProjectChoiceAndTimelineTask } from "./ProjectChoiceAndTimelineTask";

// With this component we show all four microtasks on one page
const App: React.FC = () => {
  return (
    // Here we center the content and keep it narrow so it feels readable
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>VU microtask playground</h1>
      <p>
        On this page we can click through four interactive microtasks.
        We use this as a demo before we connect any back end or AI.
      </p>

      {/* Here we show the original coding reorder microtask */}
      <CodeReorderTaskExample />

      {/* Here we show the original picture grouping microtask */}
      <PictureGroupingTaskExample />

      {/* Here we show the original video description microtask */}
      <VideoDescribeTaskExample />

      {/* Here we show the new project choice plus timeline microtask */}
      <ProjectChoiceAndTimelineTask />
    </div>
  );
};

export default App;
