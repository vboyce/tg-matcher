
# load in data
expt_1_data <- read_csv(here(data_loc, "expt1_full_data.csv")) |>
  select(-proliferate.condition) |>
  filter(!is.na(response)) |>
  filter(!is.na(correct_tangram)) |>
  select(
    workerid, button_rt, condition, correct, correct_tangram,
    gameId, selected, text, trial_index
  ) |>
  mutate(workerid = as.factor(workerid)) |>
  mutate(rt_sec = button_rt / 1000) |>
  separate(condition, c("group_size", NA, "round")) |>
  mutate(
    group_size = str_c(group_size, "_player"),
    round = str_c("round_", round),
    correct = as.numeric(correct)
  ) |>
  group_by(workerid) |>
  mutate(trial_order = row_number()) |>
  ungroup() |>
  mutate(source = "naïve", expt = "Expt 2", thickness = "medium")

expt_2_data <- read_csv(here(data_loc, "expt2_full_data.csv")) |>
  select(-proliferate.condition) |>
  filter(!is.na(response)) |>
  filter(!is.na(correct_tangram)) |>
  select(
    workerid, button_rt, condition, correct, correct_tangram,
    gameId, selected, text, trial_index
  ) |>
  mutate(workerid = as.factor(workerid)) |>
  mutate(rt_sec = button_rt / 1000) |>
  separate(condition, c("group_size", "thickness", "round")) |>
  mutate(
    condition = str_c(group_size, "_", thickness),
    group_size = str_c(group_size, "_player"),
    round = str_c("round_", round),
    correct = as.numeric(correct)
  ) |>
  group_by(workerid) |>
  mutate(trial_order = row_number()) |>
  ungroup() |>
  mutate(source = "naïve", expt = "Expt 2")

expt_3_data <- read_csv(here(data_loc, "tgmatchercalibration-trials.csv")) |>
  select(-proliferate.condition) |>
  filter(!is.na(response)) |>
  filter(!is.na(correct_tangram)) |>
  select(
    workerid, button_rt, correct, correct_tangram,
    gameId, selected, text, trial_index
  ) |>
  mutate(workerid = as.factor(workerid)) |>
  mutate(
    rt_sec = button_rt / 1000,
    correct = as.numeric(correct)
  ) |>
  group_by(workerid) |>
  mutate(trial_order = row_number()) |>
  ungroup() |>
  mutate(source = "naïve")

expt_4_data <- read_csv(here(data_loc, "tgmatcheryoked-trials.csv")) |>
  select(-proliferate.condition) |>
  filter(!is.na(correct_tangram)) |>
  select(
    workerid, button_rt, correct, correct_tangram, condition,
    gameId, selected, text, trial_index, type, rt, orig_trialNum, orig_repNum
  ) |>
  mutate(workerid = as.factor(workerid)) |>
  mutate(
    matcher_trialNum = (trial_index - 3) %/% 3,
    matcher_repNum = matcher_trialNum %/% 12
  ) |>
  mutate(workerid = ifelse(workerid == "3157" & condition == "yoked", "3157a", workerid)) |> # somehow two participants were assigned to 3157 -- but each set looks complete?
  filter(workerid != "141") |>
  filter(workerid != "35") |> # exclude two participants who didn't finish
  mutate(source = "naïve", round = str_c("round_", orig_repNum + 1))


# load in model predictions
mlp_mod <- read_csv(here(prediction_loc, "mlp_best.csv")) |>
  pivot_longer(p_A:p_L) |>
  mutate(name = str_sub(name, -1)) |>
  filter(tangram == name) |>
  mutate(
    round = str_c("round_", repNum + 1),
    correct = value,
    source = "model"
  ) |>
  select(correct_tangram = tangram, gameId, round, correct, source)


# get original study accuracies and lengths (for predictors)
url <- "https://raw.githubusercontent.com/vboyce/multiparty-tangrams/main/"

one_round_results <- read_rds(str_c(url, "data/study1/round_results.rds")) %>% mutate(rotate = "rotate")
two_a_round_results <- read_rds(str_c(url, "data/study2a/round_results.rds")) %>% mutate(rotate = "no_rotate")
two_b_round_results <- read_rds(str_c(url, "data/study2b/round_results.rds")) %>% mutate(rotate = "full_feedback")
two_c_round_results <- read_rds(str_c(url, "data/study2c/round_results.rds")) |> mutate(rotate = "emoji")
three_round_results <- read_rds(str_c(url, "data/study3/round_results.rds")) |> rename(`_id` = "X_id", condition = name)

one_chat <- read_csv(str_c(url, "data/study1/filtered_chat.csv")) |> mutate(rotate = str_c(as.character(numPlayers), "_rotate"))
two_a_chat <- read_csv(str_c(url, "data/study2a/filtered_chat.csv")) |> mutate(rotate = "no_rotate")
two_b_chat <- read_csv(str_c(url, "data/study2b/filtered_chat.csv")) |>
  mutate(rotate = "full_feedback") |>
  select(-`row num`)
two_c_chat <- read_csv(str_c(url, "data/study2c/filtered_chat.csv")) |>
  mutate(rotate = "emoji") |>
  select(-type)
three_chat <- read_csv(str_c(url, "data/study3/filtered_chat.csv")) |>
  inner_join(read_rds(str_c(url, "data/study3/round_results.rds")) |> select(gameId, trialNum, condition = name) |> unique()) |>
  select(-rowid, -type)

original_results_raw <- one_round_results |>
  rbind(two_a_round_results) |>
  rbind(two_b_round_results) |>
  rbind(two_c_round_results) |>
  mutate(activePlayerCount = NA) |>
  rename(condition = rotate) |>
  rbind(three_round_results) |>
  filter(response!="FALSE") |> 
  filter(response!="false") |> 
  mutate(
    round = str_c("round_", repNum + 1),
    correct_tangram = tangram,
    correct = ifelse(correct, 1, 0),
    source = "original"
  )

original_results <- original_results_raw |>
  group_by(gameId, correct_tangram, round, source) |>
  summarize(correct = mean(correct)) |>
  select(gameId, correct_tangram, round, correct, source)

original_length <- one_chat |>
  rbind(two_a_chat) |>
  rbind(two_b_chat) |>
  rbind(two_c_chat) |>
  mutate(activePlayerCount = NA) |>
  rename(condition = rotate) |>
  rbind(three_chat) |>
  filter(!is.chitchat) |>
  filter(role == "speaker") |>
  mutate(correct_tangram = str_sub(target, -5, -5)) |>
  group_by(repNum, gameId, correct_tangram, condition, numPlayers) |>
  mutate(utt_length_words = str_count(spellchecked, "\\W+") + 1) %>%
  summarize(
    text = paste0(text, collapse = ", "),
    total_num_words = sum(utt_length_words, na.rm = T) %>% as.numeric(),
    log_words = log(total_num_words)
  ) |>
  mutate(round = str_c("round_", repNum + 1)) |>
  select(gameId, correct_tangram, round, total_num_words, log_words)


original_acc <- original_results |>
  rename(original_correct = correct) |>
  ungroup() |>
  select(round, correct_tangram, gameId, original_correct)

expt_1_data_augment <- expt_1_data |>
  left_join(original_length) |>
  left_join(original_acc)
expt_2_data_augment <- expt_2_data |>
  left_join(original_length) |>
  left_join(original_acc)


# sbert-read in
sbert_raw_2a <- read_rds(str_c(url, "code/models/one_two_diverge.rds")) |> filter(condition %in% c("2", "6")) |> 
  filter(repNum %in% c(0,5))

#need to de-upper-triangle this
sbert_2a <- sbert_raw_2a |> rename(gameId=gameId_1, other_game=gameId_2) |> 
  bind_rows(sbert_raw_2a |> rename(gameId=gameId_2, other_game=gameId_1)) |> 
  group_by(tangram, repNum, condition, gameId) |> 
  summarize(mean_sim=mean(sim)) |> 
  rename(correct_tangram=tangram) |> 
  ungroup() |> 
  mutate(round = str_c("round_", repNum + 1)) |> 
  select(round, correct_tangram, gameId, mean_sim) |> 
  right_join(expt_1_data)

sbert_raw_2b <- read_rds(str_c(url, "code/models/three_diverge.rds")) |>  filter(repNum %in% c(0,5))

sbert_2b <- sbert_raw_2b |> rename(gameId=gameId_1, other_game=gameId_2) |> 
  bind_rows(sbert_raw_2b |> rename(gameId=gameId_2, other_game=gameId_1)) |> 
  group_by(tangram, repNum, condition, gameId) |> 
  summarize(mean_sim=mean(sim)) |> 
  rename(correct_tangram=tangram) |> 
  ungroup() |> 
  mutate(round = str_c("round_", repNum + 1)) |> 
  select(round, correct_tangram, gameId, mean_sim) |> 
  right_join(expt_2_data)

### adventures with aligning calibration data

# this is all because I didn't keep the trial number source recorded, so we have a fun time rejoining
ParseJSONColumn <- function(x) {
  str_replace_all(x, "'", '"') %>%
    str_replace_all('Don"t know', "Don't know") %>%
    str_replace_all('don"t', "don't") |>
    str_replace_all("None", '"NA"') |>
    str_replace_all('"SAFE"', "'SAFE'") |>
    str_replace_all('he"s', "he's") |>
    str_replace_all('doesn"t', "doesn't") |>
    str_replace_all('hasn"t', "hasn't") |>
    str_replace_all('it"s', "it's") |>
    str_replace_all('It"s', "It's") |>
    str_replace_all('X" shaped', "'X' shaped") |>
    str_replace_all('"missing', "missing") |>
    str_replace_all('"flying"', "flying") |>
    str_replace_all('"skating"', "skating") |>
    str_replace_all('"partially sitting"', "partially sitting") |>
    str_replace_all('"kneeling" and ', "kneeling and ") |>
    str_replace_all('"partially kneeling"', "partially kneeling") |>
    str_replace_all('and "bunny"', "and bunny") |>
    str_replace_all('"square"', "square") |>
    str_replace_all('heads"', "heads") |>
    str_replace_all('"italy"', "italy") |>
    str_replace_all('they"re', "they're") |>
    str_replace_all('"but why"', "'but why'") |>
    fromJSON(flatten = T)
}

labels <- read_csv(here("expt_prep_code/labelled.csv")) |>
  mutate(text = str_replace_all(text, "'", "") |> str_replace_all('"', "")) |>
  group_by(tangram, gameId, trialNum, repNum, value, grouping) |>
  summarize(text = str_c(text, collapse = " "))

expt_3_ready <- expt_3_data |>
  mutate(new = map(text, ParseJSONColumn)) |>
  select(-text) |>
  unnest(new) |>
  mutate(text = text |> str_replace_all("'", ""), tangram = correct_tangram) |>
  group_by(workerid, correct, tangram, gameId, trial_order) |>
  summarize(text = str_c(text, collapse = " ")) |>
  left_join(labels)

expt_3_summary <- expt_3_ready |>
  group_by(text, value, tangram, grouping) |>
  summarize(human_acc = mean(correct), human_n = n()) |>
  ungroup() |>
  mutate(grouping = as.factor(grouping) |> reorder(value)) |>
  group_by(grouping)

expt_3_groups <- expt_3_summary |>
  group_by(grouping) |>
  mutate(value = mean(value))



# helper functions for displaying stats

stats <- function(model, row, decimal = 2) {
  model <- model |>
    mutate(
      Estimate = round(Estimate, digits = decimal),
      Lower = round(lower, digits = decimal),
      Upper = round(upper, digits = decimal),
      `Credible Interval` = str_c("[", Lower, ", ", Upper, "]")
    ) |>
    select(Term, Estimate, `Credible Interval`)
  str_c(model[row, 1], ": ", model[row, 2], " ", model[row, 3])
}

stats_text <- function(model, row, decimal = 2) {
  model <- model |>
    mutate(
      Estimate = round(Estimate, digits = decimal) |> formatC(format='f', digits=decimal ),
      Lower = round(lower, digits = decimal) |> formatC(format='f', digits=decimal ),
      Upper = round(upper, digits = decimal) |> formatC(format='f', digits=decimal ),
      `Credible Interval` = str_c("[", Lower, ", ", Upper, "]")
    ) |>
    select(Term, Estimate, `Credible Interval`)
  str_c(model[row, 2], "  ", model[row, 3])
}

form <- function(model_form) {
  dep <- as.character(model_form$formula[2])
  ind <- as.character(model_form$formula[3])
  
  str_c(dep, " ~ ", ind) |>
    str_replace_all(" ", "") |>
    str_replace_all("\\*", " ${\\\\times}$ ") |>
    str_replace_all("\\+", "&nbsp;${+}$ ") |>
    str_replace_all("~", " ${\\\\sim}$ ")
}
