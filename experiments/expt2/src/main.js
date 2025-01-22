import FullscreenPlugin from "@jspsych/plugin-fullscreen";
import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import HtmlKeyboardResponsePlugin from "@jspsych/plugin-html-keyboard-response";
import CallFunctionPlugin from "@jspsych/plugin-call-function";
import PreloadPlugin from "@jspsych/plugin-preload";
import { shuffle, counterbalance, fetchJSONData} from "./helper.js";

import {stimuli} from "./stimuli.js"
import {WELCOME_INSTRUCTION} from "./instructions.js"
//const stimuli = require('./test.json');
console.log(stimuli)

let choices=['A','B','C','D','E','F','G','H','I','J', 'K','L']
shuffle(choices)

function get_images_to_preload(){
    let images=choices.map(c => "images/tangram_"+c+".png")
    return(images)
}
let all_images=get_images_to_preload()


let welcome_screen = {
    type : HtmlButtonResponsePlugin,
    stimulus : WELCOME_INSTRUCTION,
    choices : ["Continue"],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};


let instructions_screen = {
    type : HtmlKeyboardResponsePlugin,
    stimulus : jsPsych.timelineVariable('text'),
    choices : [" "],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
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
    
    type: jsPsychHtmlButtonResponse,
    stimulus:jsPsych.timelineVariable("all_text"),
    choices: choices,
    button_html: choices.map((choice,ind)=>{

        var html = '<button class="tangram">'+
                    '<img src="images/tangram_'+choice+'.png">'+
                    '</button>';
        
        return html;
        
    }),
    prompt: `<div class=feedback><div>`,
    data:{gameId:jsPsych.timelineVariable("gameId"),
          tangram:jsPsych.timelineVariable("tangram"),
          condition:jsPsych.timelineVariable("condition"),
          text:jsPsych.timelineVariable("all_text")},
    css_classes: ['tangram-display'],
    on_finish: function(data){
        data.selected=choices[data.response]
        if(jsPsych.pluginAPI.compareKeys(choices[data.response], jsPsych.timelineVariable('tangram'))){
            data.correct = true;
          } else {
            data.correct = false; 
          }
}
}

let feedback ={
    type: jsPsychHtmlButtonResponse,
    stimulus:jsPsych.timelineVariable("all_text"),
    choices: choices,
    button_html: choices.map((choice,ind)=>{

        var html = '<button class="tangram">'+
                    '<img src="images/tangram_'+choice+'.png">'+
                    '</button>';
        
        return html;
        
    }),
    css_classes: ['tangram-display'],
    prompt: function(){
        var last_trial_correct= jsPsych.data.get().last(1).values()[0].correct;
        if (last_trial_correct){ return (`<div class="feedback"><p style="color:darkgreen">Correct!</p></div>`)}
        else {return (`<div class="feedback"><p style=" color:#FF0000">Incorrect!</p></div>`)}
    },
    trial_duration: function(){
        var last_trial_correct= jsPsych.data.get().last(1).values()[0].correct;
        if (last_trial_correct){return(900)}
        else {return (900)}
    }

}

let preload={
    type: jsPsychPreload,
    images: all_images,

}
export function getTimeline() {
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
