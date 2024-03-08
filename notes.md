# Major things to do to get a pilot ready:

* design
* do jsPsych
* plan analysis
* select/clean/process utterances

# What's the minimal viable experiment? (pilot)

* last round utterances
* speaker description only 
* show all 12 tangrams in a random but consistent grid
* how to deal with the existence of original listener interactions?? -- how often do these occur in last round anyway? (might be possible to just filter out)
* give right/wrong feedback, but do not reveal right answers
* draw from ... 2 and 6 p games ? (and then do 2 v 6 v original accuracy?)
* show each person all 12 descriptions from each of N games? (in blocks?) note that there's a "one you haven't clicked" heuristic issue
* or just totally randomize across games? this might be the best. 

# Notes on option space (not just for pilot):

## Measures
* accuracy
* RT (total)
* incremental mouse clicks (to target, incremental RT)
* full on visual world eye-tracking (looks to things)
* some SPR/clicking hybrid (where spr stops on selection; RT, stop point, accuracy)

note to self:
 * properly incentivizing correctness / time trade off will be an adventure
 * interacts with issues of what feedback to give
 
## Display
* how many to show (12), subset?, always same subset, target + random 3 others? 


## Stimuli (descriptions)

### Which?
* what block
* what group-type
* how successful were original matchers

### How clean?
* show entire transcript (speaker + listener)
* speaker only ? (how to handle responses to listeners?)
* clean the hedges and show descriptive part only? 

# Design

* how many items...

Different designs answer different questions:

Round/group variation:
* test partner - specificity: how understandable are "conventions" to naive listener
* (related) are Nth round utterances most understandable to naive 
* does history matter: 6th round utterance in isolation; 6th round after round 1-5; 6th round after *a different game's* 1-5
* could also follow the Judy visual paper for yoked v shuffled
* are there x tangram generalizations? compare yoked to one game v yoked to one game / tangram

One big concern is how *sensitive* the measures are -- may what to start with what we think will be big effects rather than subtle interactions

Source of description: maybe 2-p thick produces less interpretable than 6-thin or whatever (note that if we condition on accuracy we'll have confound issues!). generally, comparing accuracy across group sizes is a bit fraught b/c 100% accuracy is easier in 2p than more under a null. 

# JSpsych
 * need to code it
 * may want to think carefully and forward compatible about data format (stimuli) & output variable recording
 

