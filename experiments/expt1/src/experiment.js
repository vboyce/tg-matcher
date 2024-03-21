/**
 * @title expt1
 * @description 
 * @version 0.1.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";

import { initJsPsych } from "jspsych";

import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import CallFunctionPlugin from "@jspsych/plugin-call-function";

import { shuffle, counterbalance, fetchJSONData} from "./helper.js";

import {stimuli} from "./stimuli.js"
//import {stimuli} from "./test.js"
import {choices, all_images, format_stimuli, give_feedback} from "./constants.js"

import {WELCOME_INSTRUCTION, POST_TEST_INSTRUCTION} from "./instructions.js"
/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */

shuffle(stimuli)
const trials=stimuli.length
export async function run({ assetPaths, input = {}, environment, title, version }) {
  const jsPsych = initJsPsych();
  
  let countCorrect=0;
  let done=1;
  let welcome_screen = {
      type : HtmlButtonResponsePlugin,
      stimulus : WELCOME_INSTRUCTION,
      choices : ["Continue"],
      response_ends_trial : true,
  };
   
  let instructions_screen = {
      type : HtmlKeyboardResponsePlugin,
      stimulus : jsPsych.timelineVariable('text'),
      choices : [" "],
      response_ends_trial : true,
  };
  
  let end_experiment = {
      type : HtmlButtonResponsePlugin,
      stimulus : POST_TEST_INSTRUCTION,
      choices : ["Continue"]
  }
  
  let send_data ={
      type: CallFunctionPlugin,
      async: true,
      func: function(done){
              proliferate.submit({"trials": jsPsych.data.get().values()});
            }
      }
  
      
  let trial = {
      
      type: HtmlButtonResponsePlugin,
      stimulus:function(){
        return(`<div class="bonus">Trial `+done+`/`+ trials+
        `  Bonus so far: `+countCorrect+`</div>`+
        format_stimuli(jsPsych.timelineVariable("text"))+
        `<div class="feedback"><p></p> </div>`)},
      choices: choices,
      button_html: choices.map((choice,ind)=>{

          var html = '<button class="tangram">'+
                      '<img src="assets/images/tangram_'+choice+'.png">'+
                      '</button>';
          
          return html;
          
      }),
      data:{gameId:jsPsych.timelineVariable("gameId"),
            tangram:jsPsych.timelineVariable("tangram"),
            condition:jsPsych.timelineVariable("condition"),
            text:jsPsych.timelineVariable("text")},
      css_classes: ['tangram-display'],
      on_finish: function(data){
          data.selected=choices[data.response]
          if(jsPsych.pluginAPI.compareKeys(choices[data.response], jsPsych.timelineVariable('tangram'))){
              data.correct = true;
            } else {
              data.correct = false; 
            }
          if(data.correct){countCorrect++;}
  }
  }
  
  let feedback ={
      type: HtmlButtonResponsePlugin,
      stimulus:function(){
        var last_trial_correct= jsPsych.data.get().last(1).values()[0].correct;
        return(`<div class="bonus">Trial `+done+`/`+ trials+
        `  Bonus so far: `+countCorrect+`</div>`+
        format_stimuli(jsPsych.timelineVariable("text"))+give_feedback(last_trial_correct))},
      choices: choices,
      button_html: choices.map((choice,ind)=>{
  
          var html = '<button class="tangram">'+
                      '<img src="assets/images/tangram_'+choice+'.png">'+
                      '</button>';
          
          return html;
          
      }),
      css_classes: ['tangram-display'],
      trial_duration: function(){
          var last_trial_correct= jsPsych.data.get().last(1).values()[0].correct;
          if (last_trial_correct){return(900)}
          else {return (900)}
      },
      on_finish: function(){
        done++;
      }
  
  }
  
  let preload={
      type: PreloadPlugin,
      images: all_images,
  
  }
  function getTimeline() {
      //////////////// timeline /////////////////////////////////
      let timeline = [];
  
      //timeline.push(welcome_screen);
      timeline.push(preload)
  
      let test={
          timeline: [trial, feedback],
          timeline_variables: stimuli,
          randomize_order: true,
      }
      timeline.push(test)
      timeline.push(end_experiment);
      timeline.push(send_data);
      return timeline;
  }
  
  let timeline=getTimeline();
  await jsPsych.run(timeline);
}
