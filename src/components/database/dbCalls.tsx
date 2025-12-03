import axios from "axios";
import { time } from "console";

export async function createUser() {
    try {
        const res =  await axios.post("http://localhost:3001/create", {
        avatar: localStorage.getItem('avatar'),
        name: localStorage.getItem('firstName'),
        age: parseInt(localStorage.getItem('age') || "0"),
        profile: localStorage.getItem('profile'),
        programme: localStorage.getItem('currentProgram') || "none",
        });
        localStorage.setItem('userId', res.data.id);
        return res.data.id;
  } catch (err) {
    console.error("Failed to fetch interactions:", err);
    return [];
  }
}

export async function incrementTasks() {
    try {
        const res = await axios.post("http://localhost:3001/increment-tasks", {
        id: localStorage.getItem('userId') || "0",
        });
        return res.data;
    } catch (err) {
    console.error("Failed to fetch interactions:", err);
    return [];
  }
}

export async function logQuestionInteraction() {
  try {
    const res = await axios.post("http://localhost:3001/log-question", {
    question_id: localStorage.getItem('taskCode') || "none",
    user_id: localStorage.getItem('userId'),
    opened: localStorage.getItem('learnOpened') || "false",
    answer: localStorage.getItem('answer') || "none",
    timeOnTask: parseInt(localStorage.getItem('taskTime') || "0"),
    feedback: localStorage.getItem('taskEnjoyment'),
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch interactions:", err);
    return [];
  }
}


export async function getInteractions() {
  try {
    const res = await axios.get("http://localhost:3001/interactions");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch interactions:", err);
    return [];
  }
}

