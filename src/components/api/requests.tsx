import React, { useState, useEffect } from 'react';
import { TaskCard, TaskCardProps } from '../vita-ui/TaskCard';
import { parse } from 'path';
import { useAppContext } from '../../App';

//NOTE: had to shut off CORS in browser to make this work

const hostname = 'unrazored-jacqueline-cleanlier.ngrok-free.dev';

export function resetStudent() {
  return fetch('https://' + hostname + '/student/reset/', {
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
  return fetch('https://' + hostname + '/student/init/', requestOptions)
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

  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        student_vector: (student_vector).split(',').map(Number),
        //TODO: different accepted values
        program: localStorage.getItem('currentProgram') || '',
        //program: 'Mathematics',        
        task_answer: localStorage.getItem('answer') || '',
        task_preference: parseInt(localStorage.getItem('taskEnjoyment') || '0'),
        avatar_chosen: localStorage.getItem('avatar') || '',
        program_vectors: cleanProgramVectors(),
        demo: {name: localStorage.getItem('firstName') || '',
        age: localStorage.getItem('age') || '',
        hs_profile: localStorage.getItem('profile') || '' }
       })
  };
   return fetch('https://' + hostname + '/student/update/', requestOptions)
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

export async function updateStudentRIASEC() 
  {
  var student_vector = localStorage.getItem('studentVector') || '[0,0,0,0,0,0]';
  student_vector = student_vector.replace(/[\[\]\s]/g, ''); //remove brackets and spaces
  var riasec_vector = localStorage.getItem('microRASEC') || '[R,I,A,S,E,C]'
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
   return fetch('https://' + hostname + '/student/update/', requestOptions)
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

export async function returnTask(type: string, setTask: (t: TaskCardProps) => void) {
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
  if (t !==null) {

  const optionArray = Object.entries(t.options).map(([key, value]) => ({
    key,
    text: value.text,
    riasec: value.riasec,
  }));

  setTask({
    ...t,
    learnBullets: t.tiny_learn,
    options: optionArray,
  });

  localStorage.setItem('currentProgram', t.program)
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
  return fetch('https://' + hostname + '/student/fetch-task/', requestOptions)
    .then(response => response.json())
    .then(parsedValue => {return parsedValue.task; });    
  }

export async function getRecommendations() {
  var student_vector = localStorage.getItem('studentVector') || '[0,0,0,0,0,0]';
  student_vector = student_vector.replace(/[\[\]\s]/g, ''); //remove brackets and spaces
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        student_vector: (student_vector).split(',').map(Number),
        avatar_chosen: localStorage.getItem('avatar') || '',
        demo: {name: localStorage.getItem('firstName') || '',
        age: localStorage.getItem('age') || '',
        hs_profile: localStorage.getItem('profile') || '' }
       })
  };
  return fetch('https://' + hostname + '/student/recommend/', requestOptions)
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

