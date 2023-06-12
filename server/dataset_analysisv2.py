import pandas as pd
import json
import re
import argparse
import sys
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from collections import Counter

parser = argparse.ArgumentParser(description='Process query')
parser.add_argument('--query')
parser.add_argument('--fp')
parser.add_argument('--wp')
args = parser.parse_args()

queryName = args.query
target_fp = args.fp
word_fp = args.wp

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# Read necessary columns from CSV file
df = pd.read_csv('./sentiment140_dataset.csv')
df['Tweet'] = df['Tweet'].astype(str)

# Filter tweets based on query
filtered_tweets = df[df['Tweet'].str.contains(fr'\b{queryName}\b', case=False)]

if filtered_tweets.empty:
    print('There are no tweets found in this query.')
    sys.exit(1)

# Extract all hashtags and user mentions using compiled regex
hashtag_regex = re.compile(r'\#\w+')
user_mention_regex = re.compile(r'\@\w+')

hashtags = {tag.lower() for tweet in filtered_tweets['Tweet'] for tag in hashtag_regex.findall(tweet)}
user_mentions = {user.lower() for tweet in filtered_tweets['Tweet'] for user in user_mention_regex.findall(tweet)}

hashtag_counts = Counter(hashtags)
user_counts = Counter(user_mentions)

top_hashtags = hashtag_counts.most_common(10)
top_user = user_counts.most_common(10)

top_hashtags_dict = dict(top_hashtags)
top_user_dict = dict(top_user)

# Count the frequency of each word
word_freq = Counter(lemmatizer.lemmatize(word, pos='v') for tweet in filtered_tweets['Tweet'] for word in re.findall(r'\b\w+\b', tweet.lower()) if word not in stop_words)

top_words = word_freq.most_common(10)
top_words_dict = dict(top_words)

# Save the filtered tweets to a new JSON file
filtered_tweets = filtered_tweets.copy()
filtered_tweets.loc[:, 'id'] = filtered_tweets['ID'].values
filtered_tweets.loc[:, 'text'] = filtered_tweets['Tweet'].values
filtered_tweets.loc[:, 'date'] = filtered_tweets['Date'].values
filtered_tweets.loc[:, 'username'] = filtered_tweets['User'].values
filtered_tweets.loc[:, 'sentiment'] = filtered_tweets['Sentiment'].values
filtered_tweets.loc[:, 'negative'] = filtered_tweets['Negative'].values
filtered_tweets.loc[:, 'neutral'] = filtered_tweets['Neutral'].values
filtered_tweets.loc[:, 'positive'] = filtered_tweets['Positive'].values
filtered_tweets = filtered_tweets[['id', 'text', 'date', 'username', 'negative', 'neutral', 'positive', 'sentiment']]



filtered_tweets_dict = filtered_tweets.to_dict(orient='records')
with open(target_fp, 'w') as f:
    json.dump(filtered_tweets_dict, f, indent=4)

combined_dict = {**top_user_dict, **top_hashtags_dict, **top_words_dict}
with open(word_fp, 'w') as f:
    json.dump(combined_dict, f, indent=4, separators=(',', ': '))
