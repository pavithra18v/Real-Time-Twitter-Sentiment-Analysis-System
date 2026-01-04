import re
import string

def clean_text(text: str) -> str:
    """
    Cleans the input text by:
    - Lowercasing
    - Removing URLs
    - Removing mentions (@user)
    - Removing punctuation
    - Removing numbers
    - Removing extra whitespace
    """
    if not isinstance(text, str):
        return ""
    
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'@\w+', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text
