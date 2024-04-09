import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { run } from "./experiment";


    const info = {
        name: "spr",
        parameters : {
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
                default :       900,
                description :   "The width of the canvas in which the spr moving window is presented."
            },
            height : {
                type :          ParameterType.INT,
                pretty_name :   "height",
                default :       600,
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

    /**
     * Creates a range between [start, end).
     *
     * @param start The value at which the range starts
     * @param end   The value before which the range stops.
     *
     * @return an array with the range.
     */
    function range(start, end, step = 1) {
        let a = []
        if (step > 0) {
            for (let i = start; i < end; i++)
                a.push(i);
        } else if(step < 0) {
            for (let i =  start; i > end; i++)
                a.push(i);
        } else {
            throw RangeError(
                "Argument 3 (the step) must be larger or smaller than 0."
            );
        }
        return a;
    }

    /**
     * Class to represent the position of a word on a 2d canvas
     */
    class Pos {
        /**
         * @param {number} x the x position of a word
         * @param {number} y the y position of a word
         */
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    };

    /**
     * Class to contain some data about a word, on how to present it
     * on a canvas.
     */
    class TextInfo {

        /**
         * @param {string} txt, the text to draw at ctx
         * @param {Pos} position the position at which to draw text.
         * @param {} ctx the 2d drawing position.
         */
        constructor(text, position, ctx, fontstyle =false, record = true) {
            if (typeof(text) !== "string")
                console.error("TextInfo constructor text was not a String");
            if (typeof(record) !== "boolean")
                console.error("TextInfo constructor positions was not a Pos");
            this.text = text;
            this.pos = position;
            this.ctx = ctx
            this.fontstyle=fontstyle
            this.ctx.font= fontstyle
            this.metrics = this.ctx.measureText(this.text);
        }

        drawText() {
            this.ctx.font= this.fontstyle
            this.ctx.fillText(this.text, this.pos.x, this.pos.y);
        }

        drawUnderline() {
            this.ctx.beginPath();
            this.ctx.moveTo(this.pos.x, this.pos.y);
            this.ctx.lineTo(this.pos.x + this.metrics.width, this.pos.y);
            this.ctx.stroke();
        }

        isWhiteSpace() {
            return this.text.match(/^\s+$/u) !== null;
        }

        isWord() {
            return this.text.match(RE_WORD) !== null;
        }

        isNumber() {
            return this.text.match(RE_NUMBER) !== null;
        }

        isWordPlusInterpunction() {
            return this.text.match(RE_WORD_INTERPUNCTION) !== null;
        }

        width() {
            return this.metrics.width;
        }
    };

    /**
     * Class to obtain useful information about words
     * that should be presented in a group
     */
    class GroupInfo {
        /**
         * @param indices {Array.<number>} Indices of the words to be
         *                                 presented in this group
         * @param record {bool}            A boolean whether or not
         *                                 the rt of this group
         *                                 should be recorded.
         */
        constructor(indices, record) {
            this.indices = indices;
            this.record = record;
        }
    };

    // private variables
 
    let group_index = -1;        // the nth_word that should be presented.
    let words = [];             // array of TextInfo.
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

    /**
     * Setup the variables for use at the start of a new trial
     */
    function setupVariables(display_element, trial_pars) {
        // reset state.
        group_index     = -1;
        words           = [];
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
            
        var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial_pars.prompt + "</div>";
        console.log(trial_pars.prompt)
        display_element.innerHTML = new_html;
        createCanvas(display_element, trial_pars);
        console.log(display_element)
        ctx.font = font;
        let stimulus = trial_pars.stimulus;
        gatherWordInfo(stimulus, trial_pars);
    }

    /**
     * Setup the canvas for use with this plugin
     *
     * @param {HTMLElement} display_element
     * @param {Object} trial Object with trial information
     */
    function createCanvas(display_element, trial_pars) {
        let canvas = document.createElement('canvas')
        canvas.setAttribute("width", trial_pars.width);
        canvas.setAttribute("height", trial_pars.height);
        canvas.setAttribute("id", SPR_CANVAS);
        display_element.appendChild(canvas);
        ctx = canvas.getContext('2d');
    }

    /**
     * Processes the lines, it "measures" where each word should be.
     * the output is stored in the global plugin variable words.
     */
    function gatherWordInfo(stim, trial_pars) {

        function splitIntoTokens(text, re) {
            return text.split(re).filter (
                function(word) {
                    return word != "";
                }
            );
        };
        
        let delta_y = determineLineHeight(trial_pars.font_family, trial_pars.font_size);
        // We could add this to the trial_pars.
        let y = delta_y * 1.2;
        let word = 0;
        const BASE_Y = delta_y * 1.2 ; // The height on which lines begin.
        const BASE_X = 150;
        
        let liney = BASE_Y;
        let runningx=BASE_X;
        let maxwidth=600 //TODO this should be parameterized somewhere
        for(let i=0; i<stim.length; i++){
            let role=stim[i][0]
            let text=stim[i][1]
            //todo address text wrapping here lol
            if (role!=""){
                let pos = new Pos(50,liney)
                let current_word = new TextInfo(role, pos, ctx, "bold "+trial_pars.font_size+"px "+trial_pars.font_family);
                console.log(current_word.text)
                if (!current_word.isWhiteSpace())
                    words.push(current_word);
                console.log(words)
            }
            let fragments=text.split(RE_CAP_WHITE_SPACE)
            for (let fragment = 0; fragment < fragments.length; fragment++) {
                let current_fragment = fragments[fragment];
                let bold= fragment==0? true: false;
                let pos = new Pos(runningx, liney);
                let current_word = new TextInfo(current_fragment, pos, ctx, trial_pars.font_size+"px "+trial_pars.font_family);
                if (runningx+current_word.width()>maxwidth){
                    liney=liney+y
                    runningx=BASE_X
                    pos=new Pos(runningx, liney)
                    current_word = new TextInfo(current_fragment, pos, ctx);
                }
                if (!current_word.isWhiteSpace())
                    words.push(current_word);
                runningx += current_word.width();
            }
            liney=liney+y
            runningx=BASE_X
        }

    }


    /**
     * Draws the stimulus on the canvas.
     */
    function drawStimulus() {

        // draw background
        ctx.fillStyle = background_color;
        ctx.fillRect(0, 0, gwidth, gheight);

        // draw text
        ctx.fillStyle = font_color;
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
    function determineLineHeight(font, font_size) {
        let text = "Hello World";

        let div = document.createElement("div");
        div.innerHTML = text;
        div.style.position = 'absolute';
        div.style.top  = '-9999px';
        div.style.left = '-9999px';
        div.style.fontFamily = font;
        div.style.fontSize = font_size + 'pt'; // or 'px'
        document.body.appendChild(div);
        let height = div.offsetHeight;
        document.body.removeChild(div);
        return height;
    }

    class SprMovingWindowPlugin{
        /**
         * Initiates the trial.
         * @param {Object} parameter
         */
        static info=info;

        constructor(jsPsych) {
            this.jsPsych=jsPsych;
        }
        
        trial(display_element, trial_pars) {

            const installResponse=()=>{this.jsPsych.pluginAPI.getKeyboardResponse(
                {
                    callback_function : afterResponse,
                    valid_responses : valid_keys,
                    rt_method : 'performance',
                    persist : false, // We reinstall the response, because
                    // otherwise the rt is cumulative.
                    allow_held_key: false
                }
            );}

            const afterResponse= (info)=>{
          // rts[rts.length - 1] is the cumulative rt for the trial
    
            // valid rts
                    trial_data.rt.push(info.rt);
        
                group_index++;
                if (group_index >= words.length) {
                    end_trial();
                }
                else {
                    drawStimulus();
                    installResponse();
                }
            }

            setupVariables(display_element, trial_pars);
            installResponse();
            drawStimulus();
            if (trial_pars.trial_duration >= 0) {
                this.jsPsych.pluginAPI.setTimeout(finish, trial_pars.trial_duration);
            }

            
        
        
        let trial_data = {
            word: [],
            rt: [],
          };
          
        let end_trial=()=> {
            this.jsPsych.pluginAPI.clearAllTimeouts();
            this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
    
            gelement.innerHTML = old_html;
            this.jsPsych.finishTrial(trial_data);
        }
        }

    

    }

export default SprMovingWindowPlugin;