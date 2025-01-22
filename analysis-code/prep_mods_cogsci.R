library(tidyverse)
library(here)
library(brms)
library(rstan)
library(rstanarm)
library(tidybayes)
library(jsonlite)

rstan_options(auto_write = TRUE)
options(mc.cores = parallel::detectCores())
theme_set(theme_bw())

data_loc <- "data"
mod_loc <- "analysis-code/models"
prediction_loc <- "model-code/model_predictions"
mod_results <- "analysis-code/models/summary"
mod_form <- "analysis-code/models/formulae"
mod_me <- "analysis-code/models/mixed_fx"

source(here("analysis-code/helper_cogsci.R"))

# run models expt 2a/b (previously called expt 1 and expt 2)

acc_priors <- c(
  set_prior("normal(0,1)", class = "b"),
  set_prior("normal(0,1)", class = "sd"),
  set_prior("lkj(1)", class = "cor")
)


acc_mod_1 <- brm(
  correct ~ group_size * round + trial_order +
    (group_size * round | correct_tangram) +
    (group_size * round + trial_order | workerid),
  data = expt_1_data,
  family = bernoulli(),
  file = here(mod_loc, "acc_1"),
  prior = acc_priors,
  control = list(adapt_delta = .95)
)

acc_mod_2 <- brm(
  correct ~ group_size * thickness * round + trial_order +
    (group_size * thickness * round | correct_tangram) +
    (group_size * thickness * round + trial_order | workerid),
  data = expt_2_data,
  family = bernoulli(),
  file = here(mod_loc, "acc_2"),
  prior = acc_priors,
  control = list(adapt_delta = .95)
)

acc_mod_1_orig_acc <- brm(
  correct ~ original_correct + group_size * round + trial_order +
    (group_size * round | correct_tangram) +
    (group_size * round + trial_order | workerid),
  data = expt_1_data_augment,
  family = bernoulli(),
  file = here(mod_loc, "acc_1_orig_acc"),
  prior = acc_priors,
  control = list(adapt_delta = .95)
)

acc_mod_1_orig_length <- brm(
  correct ~ log_words + group_size * round + trial_order +
    (group_size * round | correct_tangram) +
    (group_size * round + trial_order | workerid),
  data = expt_1_data_augment,
  family = bernoulli(),
  file = here(mod_loc, "acc_1_orig_length"),
  prior = acc_priors,
  control = list(adapt_delta = .95)
)

acc_mod_2_orig_acc <- brm(
  correct ~ original_correct + group_size * thickness * round + trial_order +
    (group_size * thickness * round | correct_tangram) +
    (group_size * thickness * round + trial_order | workerid),
  data = expt_2_data_augment,
  family = bernoulli(),
  file = here(mod_loc, "acc_2_orig_acc"),
  prior = acc_priors,
  control = list(adapt_delta = .95)
)

acc_mod_2_orig_length <- brm(
  correct ~ log_words + group_size * thickness * round + trial_order +
    (group_size * thickness * round | correct_tangram) +
    (group_size * thickness * round + trial_order | workerid),
  data = expt_2_data_augment,
  family = bernoulli(),
  file = here(mod_loc, "acc_2_orig_length"),
  prior = acc_priors,
  control = list(adapt_delta = .95)
)

acc_priors_mlp <- c(
  set_prior("normal(0,.2)", class = "b"),
  set_prior("normal(0,.2)", class = "sd"),
  set_prior("lkj(1)", class = "cor")
)


acc_priors <- c(
  set_prior("normal(0,1)", class = "b"),
  set_prior("normal(0,1)", class = "sd"),
  set_prior("lkj(1)", class = "cor")
)

expt_2_relevant_games <- expt_1_data |>
  bind_rows(expt_2_data) |>
  select(gameId, group_size, thickness, round) |>
  unique()

expt_2_mlp <- mlp_mod |>
  inner_join(expt_2_relevant_games) |>
  left_join(original_length) |>
  left_join(original_acc)

acc_mod_mlp <- brm(
  correct ~ group_size * thickness * round +
    (group_size * thickness * round | correct_tangram),
  data = expt_2_mlp,
  file = here(mod_loc, "acc_mlp_1_2"),
  prior = acc_priors_mlp,
  control = list(adapt_delta = .95)
)

acc_mod_mlp <- brm(
  correct ~ group_size * thickness * round +
    (group_size * thickness * round | correct_tangram),
  data = expt_2_mlp,
  family = Beta(link = "logit"),
  file = here(mod_loc, "acc_mlp_1_2_beta"),
  prior = acc_priors,
  control = list(adapt_delta = .95)
)

acc_mod_mlp_orig_acc <- brm(
  correct ~ original_correct + group_size * thickness * round +
    (group_size * thickness * round | correct_tangram),
  data = expt_2_mlp,
  family = Beta(link = "logit"),
  file = here(mod_loc, "acc_mlp_1_2_orig_acc_beta"),
  prior = acc_priors,
  control = list(adapt_delta = .95)
)

acc_mod_mlp_orig_length <- brm(
  correct ~ log_words + group_size * thickness * round +
    (group_size * thickness * round | correct_tangram),
  data = expt_2_mlp,
  family = Beta(link = "logit"),
  file = here(mod_loc, "acc_mlp_1_2_orig_length_beta"),
  prior = acc_priors,
  control = list(adapt_delta = .95)
)


### yoked shuffled mods

for_acc_mod_4 <- expt_4_data |>
  filter(type == "selection") |>
  mutate(correct = as.numeric(correct)) |>
  select(workerid, correct, orig_repNum, condition, matcher_trialNum, gameId, correct_tangram)

acc_priors <- c(
  set_prior("normal(0, 1)", class = "b"),
  set_prior("normal(0,1)", class = "sd")
)


acc_mod_4 <- brm(correct ~ orig_repNum * condition + matcher_trialNum + (1 | gameId) + (1 | correct_tangram) + (1 | workerid),
                 family = bernoulli(link = "logit"), 
                 data = for_acc_mod, 
                 prior = acc_priors, 
                 file = here(mod_loc, "acc_4.rds"))


acc_mod_4 <- brm(correct ~ orig_repNum * condition + (1 | gameId) + (1 | correct_tangram) + (1 | workerid), 
                 family = bernoulli(link = "logit"), 
                 data = for_acc_mod_4, 
                 prior = acc_priors, 
                 file = here(mod_loc, "acc_4_no_trial.rds"))

acc_priors_mlp <- c(
  set_prior("normal(0,1)", class = "b"),
  set_prior("normal(0,1)", class = "sd")
)

expt_4_acc_data <- expt_4_data |>
  filter(type == "selection") |>
  mutate(correct = as.numeric(correct)) |>
  select(workerid, correct, orig_repNum, round, condition, matcher_trialNum, gameId, correct_tangram, source)
expt_3_relevant_games <- expt_4_acc_data |>
  select(gameId, round, orig_repNum) |>
  unique()

yoked_relevant_mlp <- mlp_mod |> inner_join(expt_3_relevant_games)


acc_mod_yoked_mlp <- brm(correct ~ orig_repNum + (1 | gameId) + (1 | correct_tangram),
                         data = yoked_relevant_mlp,
                         prior = acc_priors_mlp,
                         family = Beta(link = "logit"),
                         file = here(mod_loc, "acc_yoked_mlp_beta"),
                         control = list(adapt_delta = .95)
)

original_subset <- original_results_raw |>
  inner_join(expt_3_relevant_games) |>
  mutate(order = "yoked", setting = "original") |>
  select(workerid = playerId, correct, correct_tangram = tangram, orig_repNum = repNum, gameId, matcher_trialNum = trialNum, order, setting)

yoked_shuffled_original <- expt_4_data |>
  filter(type == "selection") |>
  mutate(correct = as.numeric(correct)) |>
  select(workerid, correct, orig_repNum, condition, matcher_trialNum, gameId, correct_tangram) |>
  mutate(order = condition, setting = "new") |>
  bind_rows(original_subset)

acc_priors <- c(
  set_prior("normal(0, 1)", class = "b"),
  set_prior("normal(0,1)", class = "sd")
)


acc_mod_compare_orig <- brm(correct ~ orig_repNum * order + orig_repNum * setting + matcher_trialNum +
                              (1 | gameId) + (1 | correct_tangram) + (1 | workerid), 
                            family = bernoulli(link = "logit"), 
                            data = yoked_shuffled_original,
                            prior = acc_priors, 
                            file = here(mod_loc, "yoked_shuffled_original.rds"))


### Save model summaries

save_summary <- function(model) {
  intervals <- gather_draws(model, `b_.*`, regex = T) %>% mean_qi()

  stats <- gather_draws(model, `b_.*`, regex = T) %>%
    mutate(above_0 = ifelse(.value > 0, 1, 0)) %>%
    group_by(.variable) %>%
    summarize(pct_above_0 = mean(above_0)) %>%
    left_join(intervals, by = ".variable") %>%
    mutate(
      lower = .lower,
      upper = .upper,
      Term = str_sub(.variable, 3, -1),
      Estimate = .value
    ) %>%
    select(Term, Estimate, lower, upper)

  stats
}

save_me <- function(model) {
  intervals <- gather_draws(model, `sd_.*`, regex = T) %>%
    mean_qi() |>
    separate(.variable, into = c("group", "Term"), sep = "__") |>
    mutate(
      lower = .lower,
      upper = .upper,
      group = str_sub(group, 4, -1),
      Estimate = .value
    ) %>%
    select(group, Term, Estimate, lower, upper)

  intervals
}

do_model <- function(path) {
  model <- read_rds(here(mod_loc, path))
  save_summary(model) |> write_rds(here(mod_loc, "summary", path))
  model$formula |> write_rds(here(mod_loc, "formulae", path))
  print(summary(model))
}

do_me <- function(path) {
  model <- read_rds(here(mod_loc, path))
  message(path)
  save_me(model) |> write_rds(here(mod_loc, "mixed_fx", path))
}

mods_me <- c(
  "acc_1.rds", "acc_2.rds", "acc_4.rds", "acc_mlp_1_2_beta.rds", "acc_yoked_mlp_beta.rds", "yoked_shuffled_original.rds"
) |> walk(~ do_me(.))


mods <- list.files(path = here(mod_loc), pattern = ".*rds") |> walk(~ do_model(.))


# Predictions

# model predictions  (expt 2)

mod_2a <- here(mod_loc, "acc_1.rds") |> read_rds()
mod_2b <- here(mod_loc, "acc_2.rds") |> read_rds()

preds_2a <- expand_grid(
  trial_order = 1:60, group_size = c("6_player", "2_player"),
  thickness = c("medium"),
  round = c("round_1", "round_6"),
  correct_tangram = c("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L")
) |>
  add_linpred_draws(mod_2a, value = "predicted", re_formula = ~ (group_size * round | correct_tangram))


preds_2b <- expand_grid(
  trial_order = 1:60, group_size = c("6_player", "2_player"),
  thickness = c("thin", "thick"),
  round = c("round_1", "round_6"),
  correct_tangram = c("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L")
) |>
  add_linpred_draws(mod_2b, value = "predicted", re_formula = ~ (group_size * thickness * round | correct_tangram))

preds_2 <- preds_2a |> bind_rows(preds_2b)

preds_2_by_cond <- preds_2 |>
  group_by(group_size, round, thickness, .draw) |>
  summarize(predicted = mean(predicted)) |>
  group_by(group_size, round, thickness) |>
  summarize(
    mean = mean(predicted),
    low = quantile(predicted, .025),
    high = quantile(predicted, .975)
  ) |>
  write_rds(here(mod_loc, "predicted", "acc_2_cond.rds"))

preds_2_by_tangram <- preds_2 |>
  group_by(group_size, round, thickness, .draw, correct_tangram) |>
  summarize(predicted = mean(predicted)) |>
  group_by(group_size, correct_tangram) |>
  summarize(
    mean = mean(predicted),
    low = quantile(predicted, .025),
    high = quantile(predicted, .975)
  ) |>
  write_rds(here(mod_loc, "predicted", "acc_2_tangram.rds"))


# model predictions mlp expt 2

mod_2_mlp <- here(mod_loc, "acc_mlp_1_2_beta.rds") |> read_rds()

preds_2_mlp <- expand_grid(
  group_size = c("6_player", "2_player"),
  thickness = c("thick", "thin", "medium"),
  round = c("round_1", "round_6"),
  correct_tangram = c("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L")
) |>
  add_linpred_draws(mod_2_mlp, value = "predicted", re_formula = ~ (group_size * thickness * round | correct_tangram))

preds_2_mlp_condition <- preds_2_mlp |>
  group_by(group_size, round, thickness, .draw) |>
  summarize(predicted = mean(predicted)) |>
  group_by(group_size, round, thickness) |>
  summarize(
    mean = mean(predicted),
    low = quantile(predicted, .025),
    high = quantile(predicted, .975)
  ) |>
  write_rds(here(mod_loc, "predicted", "acc_2_mlp_cond.rds"))

preds_2_mlp_tangram <- preds_2_mlp |>
  group_by(group_size, round, thickness, .draw, correct_tangram) |>
  summarize(predicted = mean(predicted)) |>
  group_by(group_size, correct_tangram) |>
  summarize(
    mean = mean(predicted),
    low = quantile(predicted, .025),
    high = quantile(predicted, .975)
  ) |>
  write_rds(here(mod_loc, "predicted", "acc_2_mlp_tangram.rds"))


# model predicctions (expt 3)

mod_3 <- here(mod_loc, "acc_4.rds") |> read_rds()

preds_3 <- expand_grid(
  matcher_trialNum = 0:71,
  condition = c("yoked", "shuffled"),
  orig_repNum = 0:5,
  correct_tangram = c("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L")
) |>
  mutate(matching = matcher_trialNum %/% 12 == orig_repNum) |>
  filter(matching | condition == "shuffled") |>
  add_linpred_draws(mod_3, value = "predicted", re_formula = ~ (1 | correct_tangram)) |>
  group_by(condition, orig_repNum, .draw) |>
  summarize(predicted = mean(predicted)) |>
  group_by(condition, orig_repNum) |>
  summarize(
    mean = mean(predicted),
    low = quantile(predicted, .025),
    high = quantile(predicted, .975)
  ) |>
  write_rds(here(mod_loc, "predicted", "acc_3.rds"))

mod_3_no_trial <- here(mod_loc, "acc_4_no_trial.rds") |> read_rds()

preds_3_no_trial <- expand_grid(
  matcher_trialNum = 0:71,
  condition = c("yoked", "shuffled"),
  orig_repNum = 0:5,
  correct_tangram = c("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L")
) |>
  mutate(matching = matcher_trialNum %/% 12 == orig_repNum) |>
  filter(matching | condition == "shuffled") |>
  add_linpred_draws(mod_3_no_trial, value = "predicted", re_formula = ~ (1 | correct_tangram)) |>
  group_by(condition, orig_repNum, .draw) |>
  summarize(predicted = mean(predicted)) |>
  group_by(condition, orig_repNum) |>
  summarize(
    mean = mean(predicted),
    low = quantile(predicted, .025),
    high = quantile(predicted, .975)
  ) |>
  write_rds(here(mod_loc, "predicted", "acc_3_no_trial.rds"))

mod_3_mlp <- here(mod_loc, "acc_yoked_mlp_beta.rds") |> read_rds()

preds_3_mlp <- expand_grid(
  orig_repNum = 0:5,
  correct_tangram = c("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L")
) |>
  add_linpred_draws(mod_3_mlp, value = "predicted", re_formula = ~ (1 | correct_tangram)) |>
  group_by(orig_repNum, .draw) |>
  summarize(predicted = mean(predicted)) |>
  group_by(orig_repNum) |>
  summarize(
    mean = mean(predicted),
    low = quantile(predicted, .025),
    high = quantile(predicted, .975)
  ) |>
  write_rds(here(mod_loc, "predicted", "acc_3_mlp.rds"))
