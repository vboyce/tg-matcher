//import {initJsPsych} from 'jspsych';
let jsPsych = initJsPsych({
    override_safe_mode: true
});

function shuffle(arr) {
    var i = arr.length, j, temp;
    while(--i > 0){
      j = Math.floor(Math.random()*(i+1));
      temp = arr[j];
      arr[j] = arr[i];
      arr[i] = temp;
    }
  }

function counterbalance(item_types, items){
    let select_items=[]
    for (let i = 0; i < item_types.length; i++) { // for each grouping
        let relevant = items.filter(item => {return (item_types[i].includes(item.item_type))}) // items of this grouping

        let relevant_ids=[];
        shuffle(relevant_ids)
        relevant.forEach(item => {
            if (!relevant_ids.includes(item.id)){relevant_ids.push(item.id)}});
            for (let j=0; j<item_types[i].length; j++){
            let item_type=item_types[i][j];
            let frac=relevant_ids.length/item_types[i].length;
            let start=Math.floor(j*frac);
            let end=Math.floor((j+1)*frac);
            for(let k=start; k<end; k++){
                let id = relevant_ids[k];
                relevant.forEach(item=>{
                    if(item.id==id & item.item_type==item_type){
                        select_items.push(item)
                    }});
            }
        }    
    }
    shuffle(select_items)
    return(select_items)
}

function fetchJSONData() {
    fetch("./sample.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error
                    (`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => 
              console.log(data))
        .catch((error) => 
               console.error("Unable to fetch data:", error));
}

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
    type : jsPsychHtmlButtonResponse,
    stimulus : WELCOME_INSTRUCTION,
    choices : ["Continue"],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};


let instructions_screen = {
    type : jsPsychHtmlKeyboardResponse,
    stimulus : jsPsych.timelineVariable('text'),
    choices : [" "],
    response_ends_trial : true,
    on_finish: function (data) {
        data.rt = Math.round(data.rt);
    }
};

let end_experiment = {
    type : jsPsychHtmlButtonResponse,
    stimulus : POST_TEST_INSTRUCTION,
    choices : ["Continue"]
}


let send_data ={
    type: jsPsychCallFunction,
    async: true,
    func: function(done){
            proliferate.submit({"trials": jsPsych.data.get().values()});
          }
    }

    
let trial = {
    
    type: jsPsychHtmlButtonResponse,
    stimulus:jsPsych.timelineVariable("all_text"),
    choices: choices,
    button_html: function(){
            
        var html = '<button class="tangram"><img width="100" src="images/tangram_%choice%.png"> </button>';
        
        return html;
        
    },
    prompt: "TODO PROMPT",
    data:{gameId:jsPsych.timelineVariable("gameId"),
          tangram:jsPsych.timelineVariable("tangram"),
          condition:jsPsych.timelineVariable("condition"),
          text:jsPsych.timelineVariable("all_text")},
    css_classes: ['tangram'],
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
    type: jsPsychHtmlKeyboardResponse,
    choices: [],
    stimulus: function(){
        var last_trial_correct= jsPsych.data.get().last(1).values()[0].correct;
        if (last_trial_correct){ return ("Correct!")}
        else {return (`<div style="font-size:60px; color:#FF0000"><p>Incorrect!</p></div>`)}
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


function main() {
    // Make sure you have updated your key in globals.js

    let timeline=getTimeline()
    jsPsych.run(timeline);

}

window.addEventListener('load', main);

