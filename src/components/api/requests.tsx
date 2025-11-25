import React, { useState, useEffect } from 'react';
import { TaskCard } from '../vita-ui/TaskCard';
import { parse } from 'path';

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
    .then(parsedValue => {
      // return {
      //   studentVector: parsedValue.student_vector,
      //   programs: parsedValue.eligible_programs
      // };
      localStorage.setItem('studentVector', JSON.stringify(parsedValue.student_vector));
    });
}

export function updateStudent() 
  {
  var student_vector = localStorage.getItem('studentVector') || '[0,0,0,0,0,0]';
  student_vector = student_vector.replace(/[\[\]\s]/g, ''); //remove brackets and spaces
  const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        student_vector: (student_vector).split(',').map(Number),
        program: localStorage.getItem('currentTask') || '',
        task_answer: localStorage.getItem('answer') || '',
        //TODO: update preferences
        task_preference: 1,
        //task_preference: localStorage.getItem('taskEnjoyment') || '',
        avatar_chosen: localStorage.getItem('avatar') || '',
        demo: {name: localStorage.getItem('firstName') || '',
        age: localStorage.getItem('age') || '',
        hs_profile: localStorage.getItem('profile') || '' }
       })
  };
   fetch('https://' + hostname + '/student/update/', requestOptions)
      .then(response => response.json())
      .then(parsedValue => {localStorage.setItem('studentVector', JSON.stringify(parsedValue.student_vector))
      return parsedValue; })
      .then(parsedValue => {
        localStorage.setItem("stop", JSON.stringify(parsedValue.should_stop))
      return parsedValue; })
      .then(parsedValue =>localStorage.setItem("next", JSON.stringify(parsedValue.next_action)));
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
        program: localStorage.getItem('currentTask') || '',
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
      .then(parsedValue => {return parsedValue.next_task; });
}

export const returnTask = async() => {
  //TODO: add check for with/without riasec then return task and handle
    return await updateStudentRIASEC();
} 

export async function fetchMicrotask() {
  var student_vector = localStorage.getItem('studentVector') || '[0,0,0,0,0,0]';
  student_vector = student_vector.replace(/[\[\]\s]/g, ''); //remove brackets and spaces
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ 
        student_vector: (student_vector).split(',').map(Number),
        program: localStorage.getItem('currentTask') || '',
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

export const returnFetchMicrotask = async() => {
    return await fetchMicrotask();
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

