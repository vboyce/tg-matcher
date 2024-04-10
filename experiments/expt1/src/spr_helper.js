import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";

const CAP_WHITE_SPACE = '(\\s)';

const RE_CAP_WHITE_SPACE = RegExp(CAP_WHITE_SPACE, 'u');

/**
 * Creates a range between [start, end).
 *
 * @param start The value at which the range starts
 * @param end   The value before which the range stops.
 *
 * @return an array with the range.
 */
export function range(start, end, step = 1) {
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
export class Pos {
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
export class TextInfo {

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
export class GroupInfo {
    /**
     * @param indices {Array.<number>} Indices of the words to be
     *                                 presented in this group
     * @param record {bool}            A boolean whether or not
     *                                 the rt of this group
     *                                 should be recorded.
     */
    constructor(indices, text) {
        this.indices = indices;
        this.text=text.join(" ");
    }
};

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
/**
 * Processes the lines, it "measures" where each word should be.
 * the output is stored in the global plugin variable words.
 */
export function gatherWordInfo(stim, trial_pars, ctx) {

    function splitIntoTokens(text, re) {
        return text.split(re).filter (
            function(word) {
                return word != "";
            }
        );
    };
    
    let words=[]
    let groups=[]
    let delta_y = determineLineHeight(trial_pars.font_family, trial_pars.font_size);
    // We could add this to the trial_pars.
    let y = delta_y * 1.2;
    let word = 0;
    const BASE_Y = delta_y * 1.2 ; // The height on which lines begin.
    const BASE_X = 150;
    
    let liney = BASE_Y;
    let runningx=BASE_X;
    let byline=trial_pars.style=="line"
    let maxwidth=600 //TODO this should be parameterized somewhere
    let indices=[]
    let groupstring=[]
    let wordnum=0
    for(let i=0; i<stim.length; i++){
        let role=stim[i][0]
        let text=stim[i][1]
        //todo address text wrapping here lol
        if (role!=""){
            let pos = new Pos(50,liney)
            let current_word = new TextInfo(role, pos, ctx, "bold "+trial_pars.font_size+"px "+trial_pars.font_family);
            if (!current_word.isWhiteSpace()){
                words.push(current_word);
                if (byline) {
                    indices.push(wordnum)
                    groupstring.push(role)
                    wordnum=wordnum+1
                }
            }
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
                if (byline) {
                    groups.push(new GroupInfo(indices, groupstring)) //prior group ended
                    indices=[]
                    groupstring=[]
                }
            }
            if (!current_word.isWhiteSpace()){
                words.push(current_word);
                if (byline) {
                    indices.push(wordnum)
                    groupstring.push(current_fragment)
                    wordnum=wordnum+1
                }
            }
            runningx += current_word.width();
        }
        liney=liney+y
        runningx=BASE_X
        if (byline) {
            groups.push(new GroupInfo(indices, groupstring)) //prior group ended
            indices=[]
            groupstring=[]
        }
    }
    return [words, groups]
}
