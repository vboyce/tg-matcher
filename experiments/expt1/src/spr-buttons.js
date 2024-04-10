import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import {range, Pos, TextInfo, GroupInfo, gatherWordInfo} from "./spr_helper.js"

    const info = {
        name: "spr-buttons",
        parameters : {
            style: {
                type: ParameterType.STRING,
                pretty_name: "SPR style",
                default: "all",
                description: "word, line, or all"
            },
            feedback:{
                type: ParameterType.STRING,
                pretty_name: 'Prompt',
                default: "",
                description: 'html for below canvas'
            },
            prompt: {
                type: ParameterType.STRING,
                pretty_name: 'Prompt',
                default: undefined,
                description: 'html for the top'
            },
            stimulus : {
                type :          ParameterType.ARRAY,
                pretty_name :   'Stimulus',
                default :       undefined,
                description :   'The string to be displayed in' +
                    'Self paced reading moving window style'
            },
            button_choices: {
                type: ParameterType.KEYS,
                pretty_name: "Choices",
                default: "ALL_KEYS",
            },
            button_enabled:{
                type: ParameterType.BOOL,
                pretty_name: "Button active",
                default: true
            },
            keys_enabled:{
                type: ParameterType.BOOL,
                pretty_name: "Keys active",
                default: true
            },
            button_html: {
                type: ParameterType.HTML_STRING,
                pretty_name: "Button HTML",
                default: '<button class="jspsych-btn">%choice%</button>',
                array: true,
              },
            trial_duration : {
                type :          ParameterType.FLOAT,
                pretty_name :   "The maximum stimulus duration",
                default :       -1,
                description :   "The maximum amount of time a trial lasts." +
                    "if the timer expires, only the recorded words " +
                    "will have a valid reactiontime. If the value  " +
                    "is no trial terminate timer will be set."
            },
            choices : {
                type :          ParameterType.KEYCODE,
                pretty_name :   "Choices",
                default :       [' '],
                description :   "The keys allowed to advance a word."
            },
            background_color : {
                type :          ParameterType.STRING,
                pretty_name :   "Background color",
                default :       "white",
                description :   "background_color r, g and b value as javascript object such as: " +
                    "\"rgb(230,230,230)\" or \"gray\""
            },
            font_color : {
                type :          ParameterType.STRING,
                pretty_name :   "Font color",
                default :       'rgb(0,0,0)',
                description :   "The rgb values in which the letters will be presented, such as: " +
                    "rgb(0,0,0)"
            },
            font_family : {
                type :          ParameterType.STRING,
                pretty_name :   "The familiy of the font that is used to draw the words.",
                default :       "Open Sans",
                description :   "The final font will be computed from the family, and font size"
            },
            font_size : {
                type :          ParameterType.INT,
                pretty_name :   "The size of the font.",
                default :       18 ,
                description :   "The final font will be computed from the family, and font size"
            },
            width : {
                type :          ParameterType.INT,
                pretty_name :   "width",
                default :       600,
                description :   "The width of the canvas in which the spr moving window is presented."
            },
            height : {
                type :          ParameterType.INT,
                pretty_name :   "height",
                default :       400,
                description :   "The height of the canvas in which the spr moving window is presented"
            },
            grouping_string : {
                type :          ParameterType.STRING,
                pretty_name :   "grouping string",
                default :       null,
                description :   "The string used to split the string in to parts. The parts are "  +
                    "presented together. This allows to present multiple words as "    +
                    "group if the argument isn't specified every single word is "      +
                    "treated as group. You should make sure that the used argument "   +
                    "doesn't appear at other locations than at boundaries of groups, " +
                    "because the grouping character is removed from the string. a " +
                    "'/' can be used quite handy for example."
            }
        }
    };
    // Reused names
    const SPR_CANVAS = "SprCanvas";

    // Reused regular expressions.
    //
    // \p{} is for a unicode property
    // \p{L} matches a "alfabetic" character throughout languages.
    // see https://javascript.info/regexp-unicode
    const CAP_WORD = '(\\p{L}+)';

    // Caputure as word if it is precisely a word.
    const WORD = '^\\p{L}+$';
    const NUMBER = '^[0-9]+$';
    const NEWLINE = '\n';
    const WHITE_SPACE = '\\s';
    const CAP_WHITE_SPACE = '(\\s)';
    const INTERPUNCTION = "\\p{P}";
    const WORD_INTERPUNCTION= "^\\p{L}+\\p{P}$";

    const RE_CAP_WORD = RegExp(CAP_WORD, 'u');
    const RE_WORD = RegExp(WORD, 'u');
    const RE_NUMBER = RegExp(NUMBER, 'u');
    const RE_NEWLINE = RegExp(NEWLINE, 'u');
    const RE_WHITE_SPACE = RegExp(WHITE_SPACE, 'u');
    const RE_CAP_WHITE_SPACE = RegExp(CAP_WHITE_SPACE, 'u');
    const RE_INTERPUNCTION = RegExp(INTERPUNCTION, 'u');
    const RE_WORD_INTERPUNCTION= RegExp(WORD_INTERPUNCTION, 'u');

    // private variables
 
    let group_index = -1;        // the nth_word that should be presented.
    let old_html = "";          // the current display html, in order to
    // restore it when finished.
    let font = "";              // family of the font with px size
    let background_color = "";  // the color of the paper of the text.
    let font_color = "";        // the color of the text.
    let ctx = null;             // 2D drawing context
    let gwidth = 0;             // width of the canvas
    let gheight = 0;            // and the height.
    let valid_keys = null;      // the valid keys or choices for a response
    let gelement = null;        // the element we get from jsPsych.
    let reactiontimes = [];     // store for relevant reactiontimes.
    let groups = [];            // store groups of indices of words
    // to be presented together.
    let words =[];

    /**
     * Setup the variables for use at the start of a new trial
     */
    function setupVariables(display_element, trial_pars) {
        // reset state.
        group_index     = -1;
        ctx             = null;

        font = `${trial_pars.font_size}px ${trial_pars.font_family}`;
        old_html = display_element.innerHTML;
        background_color = trial_pars.background_color;
        font_color = trial_pars.font_color;
        gwidth = trial_pars.width;
        gheight = trial_pars.height;
        valid_keys = trial_pars.choices;
        gelement = display_element;
        reactiontimes = [];
        groups = [];
            
        var new_html = '<div id="jspsych-html-button-response-stimulus">' + trial_pars.prompt + "</div>";
        display_element.innerHTML = new_html;
        var canvas='<canvas id="jspsych-canvas-stimulus" "></canvas>'
        display_element.innerHTML+=canvas 
        var feedback = '<div id="feedback">'+trial_pars.feedback+'</div>'
        display_element.innerHTML+=feedback
        makeButtons(display_element, trial_pars)

        createCanvas(document.getElementById("jspsych-canvas-stimulus"), trial_pars);
        ctx.font = font;
        let stimulus = trial_pars.stimulus;
        [words, groups] =gatherWordInfo(stimulus, trial_pars, ctx);
    }

    /**
     * Setup the canvas for use with this plugin
     *
     * @param {HTMLElement} display_element
     * @param {Object} trial Object with trial information
     */
    function createCanvas(canvas, trial_pars) {
        canvas.setAttribute("width", trial_pars.width);
        canvas.setAttribute("height", trial_pars.height);
        canvas.setAttribute("id", SPR_CANVAS);
        ctx = canvas.getContext('2d');
    }

    function makeButtons(display_element, trial_pars){
        var buttons = [];
        var html=""
        if (Array.isArray(trial_pars.button_html)) {
        if (trial_pars.button_html.length == trial_pars.button_choices.length) {
            buttons = trial_pars.button_html;
        } else {
            console.error(
            "Error in html-button-response plugin. The length of the button_html array does not equal the length of the choices array"
            );
        }
        } else {
        for (var i = 0; i < trial_pars.button_choices.length; i++) {
            buttons.push(trial_pars.button_html);
        }
        }
        html += '<div id="jspsych-html-button-response-btngroup">';
        for (var i = 0; i < trial_pars.button_choices.length; i++) {
            var str = buttons[i].replace(/%choice%/g, trial_pars.button_choices[i]);
            html +=
                '<div class="jspsych-html-button-response-button" style="display: inline-block;'+
                '" id="jspsych-html-button-response-button-' +
                i +
                '" data-choice="' +
                i +
                '">' +
                str +
                "</div>";
        }
        html += "</div>";
        display_element.innerHTML+=html
    }


    /**
     * Draws the stimulus on the canvas.
     */
    function drawStimulus(trial_pars) {

        // draw background
        ctx.fillStyle = background_color;
        ctx.fillRect(0, 0, gwidth, gheight);
        // draw text
        ctx.fillStyle = font_color;
        if (trial_pars.style=="all"){
            for (let j = 0; j < words.length; j++) {
                let word = words[j];
                word.drawText();
                
            }  
        }
        else if (trial_pars.style=="line"){
            for (let i = 0; i < groups.length; i++) {
                let current_group=groups[i]
                for (let j=0; j<current_group.indices.length; j++){
                    let word = words[current_group.indices[j]];
                    if (i <= group_index) {
                        word.drawText();
                    }
                    else {
                        word.drawUnderline();
                    }
                }
            }
        }
        else {
            for (let j = 0; j < words.length; j++) {
                let word = words[j];
                if (j === group_index) {
                    word.drawText();
                }
                else {
                    word.drawUnderline();
                }
            }
        }
    }




    

    /**
     * Callback for when the participant presses a valid key.
     */
    
    /**
     * Determines the expected height of a line, that is: how much should
     * y advance for each line in a text field.
     *
     * It's a hack, but is seems to work. TextMetrics should - in my
     * opinion - support this.
     *
     * Borrowed and adapted from:
     * https://stackoverflow.com/questions/11452022/measure-text-height-on-an-html5-canvas-element/19547748
     */
    

    class SprButtonPlugin{
        /**
         * Initiates the trial.
         * @param {Object} parameter
         */
        static info=info;

        constructor(jsPsych) {
            this.jsPsych=jsPsych;
        }
        
        trial(display_element, trial_pars) {
            var start_time = performance.now();
            let trial_data = {
                word: [],
                rt: [],
                button_rt: NaN,
                response: ""
              };
            const installKeyboardResponse=()=>{this.jsPsych.pluginAPI.getKeyboardResponse(
                {
                    callback_function : afterKeyboardResponse,
                    valid_responses : valid_keys,
                    rt_method : 'performance',
                    persist : false, // We reinstall the response, because
                    // otherwise the rt is cumulative.
                    allow_held_key: false
                }
            );}

            const afterKeyboardResponse= (info)=>{
          // rts[rts.length - 1] is the cumulative rt for the trial
    
            // valid rts
                    trial_data.rt.push(info.rt);
        
                group_index++;
                if (group_index >= words.length) {
                    end_trial();
                }
                else if (trial_pars.style=="line" & group_index >=groups.length){
                        end_trial()
                    }
                else {
                    drawStimulus(trial_pars);
                    installKeyboardResponse();
                }
            }

            function afterButtonResponse(choice) {
                // measure rt
                var end_time = performance.now();
                var rt = Math.round(end_time - start_time);
                trial_data.response = parseInt(choice);
                trial_data.button_rt = rt;
          
                // after a valid response, the stimulus will have the CSS class 'responded'
                // which can be used to provide visual feedback that a response was recorded
                display_element.querySelector("#jspsych-html-button-response-stimulus").className +=
                  " responded";
    
                end_trial();
                
              }
              
              
            let end_trial=()=> {
                console.log("fhdasjgh")
                this.jsPsych.pluginAPI.clearAllTimeouts();
                this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
        
                gelement.innerHTML = old_html;
                this.jsPsych.finishTrial(trial_data);
            }
            setupVariables(display_element, trial_pars);
            if (trial_pars.keys_enabled){installKeyboardResponse();}
            drawStimulus(trial_pars);
            if (trial_pars.button_enabled){
                for (var i = 0; i < trial_pars.button_choices.length; i++) {
                    display_element
                    .querySelector("#jspsych-html-button-response-button-" + i)
                    .addEventListener("click", (e) => {
                        var btn_el = e.currentTarget;
                        var choice = btn_el.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
                        afterButtonResponse(choice);
                    });
                }
            }
            if (trial_pars.trial_duration >= 0) {
                this.jsPsych.pluginAPI.setTimeout(end_trial, trial_pars.trial_duration);
            }
 
            
        
        
       
        }

    

    }

export default SprButtonPlugin;