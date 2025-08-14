/**
 * @title expt1
 * @description
 * @version 0.1.0
 *
 * @assets assets/
 */

// You can import stylesheets (.scss or .css).
import "../styles/main.scss";
import SprButtonPlugin from "./spr-buttons.js";

import { initJsPsych } from "jspsych";

import HtmlButtonResponsePlugin from "@jspsych/plugin-html-button-response";
import PreloadPlugin from "@jspsych/plugin-preload";
import CallFunctionPlugin from "@jspsych/plugin-call-function";
import SurveyTextPlugin from "@jspsych/plugin-survey-text";

import { proliferate } from "./proliferate.js";
import { do_backwards_across_stimuli } from "./helper.js";

import { stimuli } from "./yoked.js";
import {
  choices,
  all_images,
  format_spr,
  give_feedback,
  format_header,
} from "./constants.js";

import {
  CONSENT,
  POST_SURVEY_QS,
  POST_SURVEY_TEXT,
  DEBRIEF,
  INSTRUCTIONS,
  spr_instructions,
  select_instructions,
} from "./instructions.js";
/**
 * This function will be executed by jsPsych Builder and is expected to run the jsPsych experiment
 *
 * @type {import("jspsych-builder").RunFunction}
 */

const NUM_ITEMS = 72;
const BONUS = 5;

let yoked = Math.random() > 0.5 ? "backwards" : "random";
const select_stimuli = do_backwards_across_stimuli(stimuli, yoked);
console.log(select_stimuli);
const trials = select_stimuli.length;
export async function run({
  assetPaths,
  input = {},
  environment,
  title,
  version,
}) {
  const jsPsych = initJsPsych({
    on_close: function () {
      var data = jsPsych.data.get().values();
      proliferate.submit({ trials: data });
    },
  });

  let countCorrect = 0;
  let done = 1;
  let consent = {
    type: HtmlButtonResponsePlugin,
    stimulus: CONSENT,
    choices: ["Continue"],
    response_ends_trial: true,
  };

  let instructions = {
    type: HtmlButtonResponsePlugin,
    stimulus: INSTRUCTIONS,
    choices: ["Continue"],
    response_ends_trial: true,
  };

  let post_test_questions = {
    type: SurveyTextPlugin,
    preamble: POST_SURVEY_TEXT,
    questions: POST_SURVEY_QS,
  };
  let end_experiment = {
    type: HtmlButtonResponsePlugin,
    stimulus: DEBRIEF,
    choices: ["Continue"],
  };

  let send_data = {
    type: CallFunctionPlugin,
    async: true,
    func: function (done) {
      proliferate.submit({ trials: jsPsych.data.get().values() });
    },
  };

  let spr = {
    type: SprButtonPlugin,
    prompt: function () {
      return (
        spr_instructions + format_header(done, trials, countCorrect, BONUS)
      );
    },
    style: "word",
    css_classes: ["tangram-display"],
    stimulus: function () {
      return format_spr(jsPsych.timelineVariable("text"));
    },
    feedback: "",
    button_choices: choices,
    button_html: choices.map((choice, ind) => {
      var html =
        '<button class="tangram">' +
        '<img src="assets/images/tangram_' +
        choice +
        '.png">' +
        "</button>";

      return html;
    }),
    data: {
      gameId: jsPsych.timelineVariable("gameId"),
      correct_tangram: jsPsych.timelineVariable("tangram"),
      text: jsPsych.timelineVariable("text"),
      orig_repNum: jsPsych.timelineVariable("repNum"),
      condition: yoked,
      orig_trialNum: jsPsych.timelineVariable("trialNum"),
      type: "reading",
    },
    button_enabled: false,
  };

  let trial = {
    type: SprButtonPlugin,
    prompt: function () {
      return (
        select_instructions + format_header(done, trials, countCorrect, BONUS)
      );
    },
    style: "all",
    enable_keypress: false,
    feedback: "",
    css_classes: ["tangram-display"],
    stimulus: function () {
      return format_spr(jsPsych.timelineVariable("text"));
    },
    button_choices: choices,
    button_html: choices.map((choice, ind) => {
      var html =
        '<button class="tangram">' +
        '<img src="assets/images/tangram_' +
        choice +
        '.png">' +
        "</button>";

      return html;
    }),
    data: {
      gameId: jsPsych.timelineVariable("gameId"),
      correct_tangram: jsPsych.timelineVariable("tangram"),
      text: jsPsych.timelineVariable("text"),
      orig_repNum: jsPsych.timelineVariable("repNum"),
      condition: yoked,
      orig_trialNum: jsPsych.timelineVariable("trialNum"),
      type: "selection",
    },
    on_finish: function (data) {
      data.selected = choices[data.response];
      if (
        jsPsych.pluginAPI.compareKeys(
          choices[data.response],
          jsPsych.timelineVariable("tangram")
        )
      ) {
        data.correct = true;
      } else {
        data.correct = false;
      }
      if (data.correct) {
        countCorrect++;
      }
    },
  };

  let feedback = {
    type: SprButtonPlugin,
    feedback: function () {
      var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
      return give_feedback(last_trial_correct);
    },
    prompt: function () {
      return "<p>&nbsp;</p>" + format_header(done, trials, countCorrect, BONUS);
    },
    style: "all",
    enable_keypress: false,
    button_enabled: false,
    css_classes: ["tangram-display"],
    data: {
      gameId: jsPsych.timelineVariable("gameId"),
      correct_tangram: jsPsych.timelineVariable("tangram"),
      text: jsPsych.timelineVariable("text"),
      orig_repNum: jsPsych.timelineVariable("repNum"),
      condition: yoked,
      orig_trialNum: jsPsych.timelineVariable("trialNum"),
      type: "feedback",
    },
    stimulus: function () {
      return format_spr(jsPsych.timelineVariable("text"));
    },
    button_choices: choices,
    button_style: function () {
      var chosen = jsPsych.data.get().last(1).values()[0].selected;
      var highlight = jsPsych.data.get().last(1).values()[0].correct
        ? "border: 4px solid #006400; border-radius: 4px;"
        : "border: 4px solid #FF0000; border-radius: 4px;";
      let style = choices.map((choice, ind) => {
        return chosen == choice ? highlight : "";
      });
      return style;
    },
    button_html: choices.map((choice, ind) => {
      var html =
        '<button class="tangram"' +
        ">" +
        '<img src="assets/images/tangram_' +
        choice +
        '.png">' +
        "</button>";

      return html;
    }),
    trial_duration: function () {
      var last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
      if (last_trial_correct) {
        return 900;
      } else {
        return 900;
      }
    },
    on_finish: function () {
      done++;
    },
  };

  let preload = {
    type: PreloadPlugin,
    images: all_images,
  };
  function getTimeline() {
    //////////////// timeline /////////////////////////////////
    let timeline = [];

    timeline.push(preload);

    timeline.push(consent);
    timeline.push(instructions);
    const test = {
      timeline: [spr, trial, feedback],
      timeline_variables: select_stimuli,
    };
    timeline.push(test);
    timeline.push(post_test_questions);
    timeline.push(end_experiment);
    timeline.push(send_data);
    return timeline;
  }

  let timeline = getTimeline();
  await jsPsych.run(timeline);
}
