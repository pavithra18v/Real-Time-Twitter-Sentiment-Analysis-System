from fastapi import APIRouter, HTTPException
from app.schemas import LiveTwitterRequest, AnalysisResult
from app.utils.twitter_client import fetch_tweets
# from app.model.svm_model import SVMModel
from app.utils.preprocess import clean_text

router = APIRouter()

# Global simulation of API usage
MOCK_API_USAGE = 0

@router.post("/analyze", response_model=list[AnalysisResult])
async def analyze_live_tweets(request: LiveTwitterRequest):
    global MOCK_API_USAGE
    
    # Simulate Rate Limit Check
    if MOCK_API_USAGE > 500:
        raise HTTPException(status_code=429, detail="Rate limit exceeded: Keys will be blocked due to excessive usage (Simulated).")

    # 1. Fetch tweets
    try:
        tweets_data = fetch_tweets(request.keyword, request.count)
    except Exception as e:
        print(f"Error fetching tweets: {e}")
        tweets_data = []

    # FALLBACK: If API fails (common with Free Tier) or returns no tweets, use Mock Data
    if not tweets_data:
        print(f"Using MOCK data. Request count: {request.count}")
        import random
        from datetime import datetime, timedelta
        
        # Generator for diverse tweets
        subjects = [request.keyword, "This AI", "The model", "It", "The system", "This tool", "The algorithm", "My experience", "The output", "The process"]
        verbs = ["is", "seems", "looks", "feels", "performs", "behaves", "runs", "works", "acts"]
        adj_pos = ["amazing", "incredible", "fantastic", "super fast", "accurate", "revolutionary", "game-changer", "brilliant", "helpful", "solid"]
        adj_neg = ["terrible", "bad", "slow", "inaccurate", "confusing", "useless", "broken", "disappointing", "frustrating", "laggy"]
        adj_neu = ["okay", "decent", "average", "standard", "fine", "nothing special", "expected", "complex", "interesting", "acceptable"]
        contexts = ["for my project.", "in production.", "honestly.", "today.", "so far.", "surprisingly.", "to be honest.", "at scale.", "in tests."]
        hashtags = ["#AI", "#Tech", "#ML", "#Data", "#Review", "#Testing", "#Dev", "#Coding", "#Innovation", "#BigData"]
        
        # User details generators
        first_names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Liam", "Sophia", "Noah"]
        countries = ["USA", "UK", "Canada", "Germany", "France", "Japan", "India", "Australia", "Brazil", "Unknown"]

        tweets_data = []
        limit = request.count if request.count > 0 else 100
        
        for i in range(limit):
            sentiment_type = random.choices(["Positive", "Negative", "Neutral"], weights=[0.4, 0.3, 0.3])[0]
            
            p1 = random.choice(subjects)
            p2 = random.choice(verbs)
            
            if sentiment_type == "Positive":
                p3 = random.choice(adj_pos)
            elif sentiment_type == "Negative":
                p3 = random.choice(adj_neg)
            else:
                p3 = random.choice(adj_neu)
                
            p4 = random.choice(contexts)
            tag = random.choice(hashtags)
            
            text = f"{p1} {p2} {p3} {p4} {tag}"
            
            # Generate random user details
            username = f"@{random.choice(first_names)}{random.randint(10, 999)}"
            user_id = str(random.randint(1000000, 9999999))
            country = random.choices(countries, k=1)[0]
            
            # Add some randomness to time
            time_offset = random.randint(0, 60)
            created_at = datetime.now() - timedelta(seconds=time_offset)

            tweets_data.append({
                "text": text,
                "created_at": created_at,
                "user_id": user_id,
                "username": username,
                "country": country
            })

    # Update Simulated Usage
    MOCK_API_USAGE += len(tweets_data)

    # 2. Mock Model Analysis
    results = []
    import random
    
    for tweet in tweets_data:
        text_lower = tweet['text'].lower()
        
        # Simple rule-based mock sentiment for consistency with the generated text
        if any(w in text_lower for w in ["terrible", "bad", "slow", "broken", "useless", "disappointing"]):
            sent = "Negative"
            conf = random.uniform(0.75, 0.99)
        elif any(w in text_lower for w in ["amazing", "incredible", "fantastic", "fast", "revolutionary", "brilliant"]):
            sent = "Positive"
            conf = random.uniform(0.75, 0.99)
        else:
            sent = random.choice(["Neutral", "Positive", "Negative"])
            conf = random.uniform(0.55, 0.85)

        results.append(AnalysisResult(
            text=tweet['text'],
            sentiment=sent,
            confidence=round(conf, 4),
            explanation=None,
            user_id=tweet.get("user_id", "Unknown"),
            username=tweet.get("username", "Unknown"),
            country=tweet.get("country", "Unknown")
        ))
        
    return results
