import tweepy
from app.config import settings

def get_twitter_client():
    """
    Returns an authenticated Tweepy client using Bearer Token (v2 API).
    """
    if not settings.TWITTER_BEARER_TOKEN:
        # Fallback or raise error if critical
        print("Warning: TWITTER_BEARER_TOKEN is not set.")
        return None

    client = tweepy.Client(bearer_token=settings.TWITTER_BEARER_TOKEN)
    return client

def fetch_tweets(keyword: str, max_results: int = 100):
    """
    Fetches tweets containing the keyword.
    Enforces a hard stop / limit to avoid rate limits (handled by max_results).
    """
    client = get_twitter_client()
    if not client:
        return []

    query = f"{keyword} -is:retweet lang:en"
    
    try:
        # Safety cap
        limit = min(max_results, 500) 
        
        tweets_data = []
        for response in tweepy.Paginator(client.search_recent_tweets, 
                                         query=query, 
                                         tweet_fields=['created_at', 'lang'], 
                                         max_results=100).flatten(limit=limit):
            tweets_data.append({
                "id": response.id,
                "text": response.text,
                "created_at": response.created_at
            })
            
        return tweets_data
    except Exception as e:
        print(f"Error fetching tweets: {e}")
        return []
