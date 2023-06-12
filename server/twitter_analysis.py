import snscrape.modules.twitter as sntwitter
import pandas as pd
from datetime import datetime
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from scipy.special import softmax
from deep_translator import GoogleTranslator
import nltk
from nltk.corpus import stopwords
from collections import Counter
from nltk.stem import WordNetLemmatizer
import re
import json
import argparse

parser = argparse.ArgumentParser(description='Process query')
parser.add_argument('--query')
parser.add_argument('--fp')
parser.add_argument('--wp')
args = parser.parse_args()

queryName = args.query
target_fp = args.fp
word_fp = args.wp

query = queryName
limits = 200

lemmatizer = WordNetLemmatizer()

# Scrape tweets using snscrape
tweets = []
for tweet in sntwitter.TwitterProfileScraper(query).get_items():
    if len(tweets) == limits:
        break
    else:
        tweets.append([tweet.id, tweet.date, tweet.rawContent])

# Convert tweets to Pandas DataFrame
df = pd.DataFrame(tweets, columns=['Id','Date','Content'])
df['Date'] = pd.to_datetime(df['Date'], format='%a %b %d %H:%M:%S %Y')

# Load sentiment analysis model and tokenizer
roberta = "cardiffnlp/twitter-roberta-base-sentiment"
model = AutoModelForSequenceClassification.from_pretrained(roberta)
tokenizer = AutoTokenizer.from_pretrained(roberta)
labels = ['Negative', 'Neutral', 'Positive']

# Perform sentiment analysis on each tweet
analysis = []

translator = GoogleTranslator(source='auto', target='en')
for tweet in df['Content']:
    translate = translator.translate(tweet)
    if translate is not None:
        tweet_words = []
        for word in translate.split(' '):
            if word.startswith('@') and len(word) > 1:
                word = '@user'
            elif word.startswith('http'):
                word = 'http'

            tweet_words.append(word)
        
        tweet_proc = " ".join(tweet_words)
        encoded_tweet = tokenizer(tweet_proc, padding='max_length', truncation=True, max_length=512, return_tensors='pt')
        output = model(**encoded_tweet)

        scores = output[0][0].detach().numpy()
        scores = softmax(scores)

        for i in range(len(scores)):
            l = labels[i]
            s = scores[i]
            print(l, s)
        analysis.append(scores)
    else:
        # If translation fails, assign default sentiment scores
        default_scores = [0.0, 1.0, 0.0]  # Assigning neutral sentiment as default
        analysis.append(default_scores)


# Convert sentiment analysis results to Pandas DataFrame and merge with the original DataFrame
df_analysis = pd.DataFrame(analysis, columns=['Negative', 'Neutral', 'Positive'])
df = pd.concat([df, df_analysis], axis=1)
df['Sentiment'] = df[['Negative', 'Neutral', 'Positive']].idxmax(axis=1)



# Convert selected tweets to lowercase strings
tweets_lower = [str(tweet).lower() for tweet in df['Content']]

# Tokenize the tweets into individual words
words = [word for tweet in tweets_lower for word in tweet.split()]

# Remove stop words and punctuation
stop_words = set(stopwords.words('english'))
words_filtered = [word for word in words if word not in stop_words and word.isalnum()]

lemmatized_words = [lemmatizer.lemmatize(word, pos='v') for word in words_filtered]

# Count the frequency of each word
word_freq = Counter(lemmatized_words)

# Sort the words by frequency in descending order
top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]

# Print the top 10 words and their frequencies
for word, freq in top_words:
    try:
        print(f'{word}: {freq}'.encode('utf-8', errors='backslashreplace').decode('utf-8'))
    except UnicodeEncodeError:
        print(f'{word}: {freq}'.encode('ascii', 'ignore').decode('ascii'))

# Create a dictionary for the top 10 words and their frequencies
top_words_dict = {word: freq for word, freq in top_words}

# Extract all users from the selected tweets
users = []
for tweet in tweets:
    users.extend(re.findall(r'@\w+', tweet[2]))

# Count the frequency of each user
user_counts = Counter(users)

# Sort the users by frequency in descending order
top_users = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)[:10]

# Print the top 10 users and their frequencies
for user, freq in top_users:
    try:
        print(f'{user}: {freq}'.encode('utf-8', errors='backslashreplace').decode('utf-8'))
    except UnicodeEncodeError:
        print(f'{user}: {freq}'.encode('ascii', 'ignore').decode('ascii'))

# Create a dictionary for the top 10 users and their frequencies
top_users_dict = {user: freq for user, freq in top_users}

# Extract hashtags from the selected tweets
hashtags = []
for tweet in tweets:
    hashtags.extend(re.findall(r'#\w+', tweet[2]))

# Count the frequency of each hashtag
hashtag_counts = Counter(hashtags)

# Sort the hashtags by frequency in descending order
top_hashtags = sorted(hashtag_counts.items(), key=lambda x: x[1], reverse=True)[:10]

# Print the top 10 hashtags and their frequencies
for hashtag, freq in top_hashtags:
    try:
        print(f'{hashtag}: {freq}'.encode('utf-8', errors='backslashreplace').decode('utf-8'))
    except UnicodeEncodeError:
        print(f'{hashtag}: {freq}'.encode('ascii', 'ignore').decode('ascii'))

# Create a dictionary for the top 10 hashtags and their frequencies
top_hashtags_dict = {hashtag: freq for hashtag, freq in top_hashtags}

df['Date'] = df['Date'].dt.strftime('%a %b %d %H:%M:%S %Y')

# Convert the dataframe to a list of dictionaries
tweets_list = df.to_dict('records')

# Add sentiment and other fields to the tweets list
for i, tweet in enumerate(tweets_list):
    tweet.update({'Negative': tweet['Negative'], 'Neutral': tweet['Neutral'], 'Positive': tweet['Positive'],
                  'Sentiment': tweet['Sentiment']})

# Write the tweets to a JSON file
with open(target_fp, 'w') as f:
    json.dump(tweets_list, f, indent=4, separators=(',', ': '))

# Save the combined dictionary to a JSON file
combined_dict = {**top_users_dict, **top_words_dict, **top_hashtags_dict}
combined_dict = {str(key): freq for key, freq in combined_dict.items()}

with open(word_fp, 'w', encoding='utf-8') as f:
    json.dump(combined_dict, f, indent=4, separators=(',', ': '), ensure_ascii=False)
