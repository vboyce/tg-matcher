
import pandas as pd
from wordfreq import zipf_frequency

df_words=pd.read_csv("../words.csv")

df_words["freq"] = df_words["words"].apply(
    lambda x: zipf_frequency(x, 'en')
)

df_words.to_csv("../word_freq.csv", index=False)