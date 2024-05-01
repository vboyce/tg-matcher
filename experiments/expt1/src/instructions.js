export const CONSENT =
  ' <center><img width="300px" src="assets/stanford.png" /></center>' +
  '<div id="legal"></br>By answering the following questions, you are participating in a study being performed ' +
  "by cognitive scientists in the Stanford Department of Psychology. If you have questions about this " +
  'research, please contact us at  <a href="mailto://languagecoglab@gmail.com."> languagecoglab@gmail.com</a>.' +
  "You must be at least 18 years old to participate. Your participation in this research is voluntary. " +
  "You may decline to answer any or all of the following questions. You may decline further participation, " +
  "at any time, without adverse consequences. Your anonymity is assured; the researchers who have requested " +
  "your participation will not receive any personal information about you. </div></br>";

export const INSTRUCTIONS =
  "<h3>Please read these instructions carefully!</h3> </br>" +
  '<div id="intro"> <p>In this task, you will see a <b>transcript of a conversation</b> some previous participants had ' +
  "where a <b>speaker identified one of the images to some listeners</b>.</p>" +
  '</br><center><img width="600px" src="assets/demo.png" /></center></br>' +
  "<p>Your goal is to <b>read the transcript</b> and <b>figure out which image</b> is being described! </p>" +
  "<p>You will <b>click the image</b> you think is being described, and then you will <b>find out if you were right</b>.<p>" +
  "<p>You will see <b>64 trials</b>. The image choices will stay the same, but the transcripts " +
  "will come from different groups of people. " +
  "Some of the transcripts may be much shorter or longer than others. " +
  "Some of the descriptions may be hard to understand -- just take a guess if you are not sure.</p>" +
  "<p>You will get a bonus of <b>5 cents</b> for each image you get right! </p>" +
  "<p> <b>Note:</b> These descriptions came from real people and may contain inappropriate or " +
  "offensive language. If you find a description inappropriate, please let us know via Prolific " +
  "message or in the exit survey, so we can filter it out in the future.</p>";
('<p>Click "Continue" to start the experiment.</p></div>');
export const POST_SURVEY_TEXT =
  "<h1>End of the experiment.</h1>" +
  "Before you go, we have a couple questions about your experience.</br>" +
  "We plan to run more similar experiments in the future, so your " +
  "thoughtful responses here will help us make the experience smoother.";

export const POST_SURVEY_QS = [
  {
    prompt:
      "Were the instructions and task clear? " +
      "Was there anything you found confusing?",
    name: "understand",
    rows: 4,
  },
  {
    prompt:
      "How was the task length? Would you have " +
      "preferred fewer or more items / a shorter or longer task? " +
      "(Assume time estimate and payment scale with length). ",
    name: "length",
    rows: 4,
  },
  {
    prompt: "Were there any problems or errors with the experiment?",
    name: "errors",
    rows: 4,
  },
  {
    prompt:
      "Is there anything that would make the interface better?" +
      " (ex. bigger text, or a different placement of text and buttons)",
    name: "interface",
    rows: 4,
  },
  { prompt: "Any other comments?", name: "other", rows: 4 },
];
export const DEBRIEF =
  "<h2>Many thanks for participating!</h2>" +
  "<p>We are generally interested in how people form conventions, such as " +
  "shared 'nicknames' for images. Here, we are studying when these " +
  "shared 'nicknames' are understandable to people who were not part of " +
  "the group that created the nickname.</p>" +
  "<h1>Press continue to be redirected to Prolific. </h1>";
