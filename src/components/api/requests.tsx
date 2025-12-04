import React, { useState, useEffect } from 'react';
import { TaskCard, TaskCardProps } from '../vita-ui/TaskCard';
import { parse } from 'path';
import { useAppContext } from '../../App';

//NOTE: had to shut off CORS in browser to make this work

const hostname = 'localhost:8000'; // 'unrazored-jacqueline-cleanlier.ngrok-free.dev';

export function resetStudent() {
  return fetch('http://' + hostname + '/student/reset/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'}})
    .then(response => response.json())
    .then(parsedValue => {
      localStorage.setItem('studentVector', JSON.stringify(parsedValue.student_vector));
    });
  }

export function initializeStudent() {
  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        avatar_chosen: localStorage.getItem('avatar') || '',
        hs_profile: localStorage.getItem('profile') || '' ,
        demo: {name: localStorage.getItem('firstName') || '',
        age: localStorage.getItem('age') || '',
        hs_profile: localStorage.getItem('profile') || '' }
       })
  };
  return fetch('http://' + hostname + '/student/init/', requestOptions)
    .then(response => response.json())
    .then(parsedValue =>{localStorage.setItem('studentVector', JSON.stringify(parsedValue.student_vector))
      return parsedValue; })
    .then(parsedValue => {localStorage.setItem('eligiblePrograms', JSON.stringify(parsedValue.eligible_programs))
      return parsedValue; })
    .then(parsedValue => {localStorage.setItem('programVectors', JSON.stringify(parsedValue.program_vectors))})
}

export async function updateStudent() 
  {
  var student_vector = localStorage.getItem('studentVector') || '[0,0,0,0,0,0]';
  student_vector = student_vector.replace(/[\[\]\s]/g, ''); //remove brackets and spaces
  var parsedVectors = JSON.parse(localStorage.getItem('programVectors') || '')
  const programVectors = Array.isArray(parsedVectors) ? parsedVectors[0] : parsedVectors;

  const usedTaskIds = JSON.parse(localStorage.getItem('usedTaskIds') || '[]');
  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        student_vector: (student_vector).split(',').map(Number),
        program: localStorage.getItem('currentProgram') || '',
        task_answer: localStorage.getItem('answer') || '',
        task_preference: localStorage.getItem('taskEnjoyment') === '1' ? 'positive' : 'negative',
        is_correct: localStorage.getItem('isCorrect') === 'true' ? true : localStorage.getItem('isCorrect') === 'false' ? false : null,
        signal_type: localStorage.getItem('signalType') || 'personality',
        used_task_ids: usedTaskIds,
        avatar_chosen: localStorage.getItem('avatar') || '',
        program_vectors: cleanProgramVectors(),
        demo: {name: localStorage.getItem('firstName') || '',
        age: localStorage.getItem('age') || '',
        hs_profile: localStorage.getItem('profile') || '' }
       })
  };
   return fetch('http://' + hostname + '/student/update/', requestOptions)
      .then(response => response.json())
      .then(parsedValue => {localStorage.setItem('studentVector', JSON.stringify(parsedValue.student_vector))
      return parsedValue; })
      .then(parsedValue => {
        localStorage.setItem("stop", JSON.stringify(parsedValue.should_stop))
      return parsedValue; })
            .then(parsedValue =>{localStorage.setItem("next", JSON.stringify(parsedValue.next_action))
      return parsedValue; })
      .then(parsedValue =>{localStorage.setItem("programVectors", JSON.stringify(parsedValue.program_vectors))
      return parsedValue; })
      .then(parsedValue => {
        // Store meta info for debug panel
        if (parsedValue.next_task?.meta) {
          localStorage.setItem('entropy', String(parsedValue.next_task.meta.entropy ?? ''));
          localStorage.setItem('aptProb', String(parsedValue.next_task.meta.apt_prob ?? ''));
          localStorage.setItem('policy', parsedValue.next_task.meta.policy ?? '');
        }
        if (parsedValue.next_task) {
          localStorage.setItem('signalType', parsedValue.next_task.signalType ?? 'personality');
          localStorage.setItem('taskType', parsedValue.next_task.type ?? 'mcq');
        }
        return parsedValue;
      })
      .then(parsedValue => {return parsedValue.next_task; });
}

export async function updateStudentRIASEC() 
  {
  var student_vector = localStorage.getItem('studentVector') || '[0,0,0,0,0,0]';
  student_vector = student_vector.replace(/[\[\]\s]/g, ''); //remove brackets and spaces
  var riasec_vector = localStorage.getItem('microRIASEC') || '[R,I,A,S,C,E]'
  riasec_vector =  riasec_vector.replace(/[\[\]\s]/g, '');

  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        student_vector: (student_vector).split(',').map(Number),
        program: 'None',
        program_vectors: cleanProgramVectors(),
        avatar_chosen: localStorage.getItem('avatar') || '',
        demo: {name: localStorage.getItem('firstName') || '',
        age: localStorage.getItem('age') || '',
        hs_profile: localStorage.getItem('profile') || '' },
        micro_riasec: riasec_vector.split(',').map(String),
       })
  };
   return fetch('http://' + hostname + '/student/update/', requestOptions)
      .then(response => response.json())
      .then(parsedValue => {localStorage.setItem('studentVector', JSON.stringify(parsedValue.student_vector))
      return parsedValue; })
      .then(parsedValue => {
        localStorage.setItem("stop", JSON.stringify(parsedValue.should_stop))
      return parsedValue; })
      .then(parsedValue =>{localStorage.setItem("next", JSON.stringify(parsedValue.next_action))
      return parsedValue; })
      .then(parsedValue =>{localStorage.setItem("programVectors", JSON.stringify(parsedValue.program_vectors))
      return parsedValue; })
      .then(parsedValue => {return parsedValue.next_task; });
}

export async function returnTask(type: string, setTask: (t: any) => void) {
  let t;

  if (type === 'RIASEC') {
    console.log('riasec')
    t = await updateStudentRIASEC();
  } else if (type === "programme") {
    console.log('fetch')
    t = await fetchMicrotask()
  }
  else {
    console.log('update')
    t = await updateStudent();
  }

  if (t !== null && t !== undefined) {
    // Store raw task for reference
    localStorage.setItem('currentTask', JSON.stringify(t));
    
    // Only transform options if it's an MCQ with object-style options
    if (t.options && typeof t.options === 'object' && !Array.isArray(t.options)) {
      const optionArray = Object.entries(t.options).map(([key, value]: [string, any]) => ({
        key,
        text: value.text,
        riasec: value.riasec,
      }));
      t = {
        ...t,
        learnBullets: t.tiny_learn,
        options: optionArray,
      };
    }
    
    localStorage.setItem('currentProgram', t.program || '');
    setTask(t);
  }
}

export async function fetchMicrotask() {
  var student_vector = localStorage.getItem('studentVector') || '[0,0,0,0,0,0]';
  student_vector = student_vector.replace(/[\[\]\s]/g, ''); //remove brackets and spaces
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        student_vector: (student_vector).split(',').map(Number),
        program: localStorage.getItem('currentProgram') || '',
        avatar_chosen: localStorage.getItem('avatar') || '',
        demo: {name: localStorage.getItem('firstName') || '',
        age: localStorage.getItem('age') || '',
        hs_profile: localStorage.getItem('profile') || '' }
       })
  };
  return fetch('http://' + hostname + '/student/fetch-task/', requestOptions)
    .then(response => response.json())
    .then(parsedValue => {return parsedValue.task; });    
  }

export async function getRecommendations() {
  var student_vector = localStorage.getItem('studentVector') || '[0,0,0,0,0,0]';
  student_vector = student_vector.replace(/[\[\]\s]/g, ''); //remove brackets and spaces
  
  // Get program_vectors from localStorage (stored by update calls)
  const programVectorsRaw = localStorage.getItem('programVectors');
  let program_vectors = {};
  if (programVectorsRaw) {
    try {
      const parsed = JSON.parse(programVectorsRaw);
      program_vectors = Array.isArray(parsed) ? parsed[0] : parsed;
    } catch (e) {
      console.error('Failed to parse programVectors:', e);
    }
  }
  
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({ 
      student_vector: (student_vector).split(',').map(Number),
      program_vectors: program_vectors,
      avatar_chosen: localStorage.getItem('avatar') || '',
      demo: {name: localStorage.getItem('firstName') || '',
      age: localStorage.getItem('age') || '',
      hs_profile: localStorage.getItem('profile') || '' }
     })
  };
  return fetch('http://' + hostname + '/student/recommend/', requestOptions)
    .then(response => response.json())
    .then(parsedValue => {return parsedValue.recommendations; });    
}

  export const returnRecommendations = async() => {
    return await getRecommendations();
} 

function cleanProgramVectors() {

  var parsedVectors = JSON.parse(localStorage.getItem('programVectors') || '')
  const programVectors = Array.isArray(parsedVectors) ? parsedVectors[0] : parsedVectors;

  // 3. Convert string-based vectors to numbers
  if (programVectors && Array.isArray(programVectors.vector)) {
    programVectors.vector = programVectors.vector.map(
      row => row.map(v => Number(v))
    );
  }
  return programVectors;
}

