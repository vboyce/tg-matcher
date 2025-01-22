# tg-matcher

# Repo organization
Basically, this repo covers both some human experiments & some computational modeling and analysis of both. 

On the human experiment side:
- expt_prep_code contains code for preparing materials for the human expts
- experiments contains source code for running the expts
- deploy_experiment was used to host the experiment with github pages 
- data contains resultant data from human experiments

On the computational model side:
- model-code contains code for running the computational models
- model-code/model_predictions contains the output "data" from the computational models

Both: 
- analysis-code contains data processing and statistical analyses of human data and model results
- writing has manuscripts

# How to reproduce cogsci paper
The cogsci paper sources analysis-code/helper_cogsci.R. 

Together they rely on data files from the data folder ("expt1_full_data", "expt_2_full_data", "tgmatchercalibration-trials","tgmatcheryoked-trials") and model outputs from model-code/model_predictions ("mlp_best). It also sources data from the original reference game experiments that are used as materials (Boyce et al 2024) by pulling data from that github repo. For some alignment of dataset, it pulls labels from expt_prep_code/labelled.csv. The comparison between different computational models draws from a file in model-code.

The stimulus images are pulled from one of the experiment source code folders.

The predictions and summarized results from the Bayesian regressions are saved and loaded from analysis-code/models (created by prep_mods_cogsci.R).


# Note about experiment numbering
The human experiments were run in a different chronological order than the order presented in the cogsci paper. Thus there is inconsistency in how files associated with the experiments are named. 

* Experiment 1 (called 2a in cogsci paper) is a 2x2 design testing block 1 and 6 descriptions from 2 and 6 players games (from experiment 1 of Boyce et al 2024)
* Experiment 2 (called 2b in cogsci paper) is a 2x2x2 design testing block 1 and 6 descriptions from 2 and 6 players games in thin and thick conditions (from experiment 3 of Boyce et al 2024)
* Experiment 3 (called 1 in cogsci paper) is the calibration experiment
* Experiment 4 (called 3 in cogsci paper) is the yoked v shuffled experiment 
