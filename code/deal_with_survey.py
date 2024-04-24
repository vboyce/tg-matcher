
import pandas as pd
import json
from ast import literal_eval 

df_survey=pd.read_csv("../data/expt1_pilotB_survey.csv")

df_survey["response"] = df_survey["response"].apply(
    lambda x: json.dumps(literal_eval(x))
)

df_survey.to_csv("../data/expt1_pilotB_survey_fixed.csv")