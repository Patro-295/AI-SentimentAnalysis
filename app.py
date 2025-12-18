from flask import Flask, render_template, request, jsonify
from textblob import TextBlob
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import os

# Initialize Flask app
app = Flask(__name__)

# Initialize VADER analyzer
# Ensure lexicon is downloaded
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

sia = SentimentIntensityAnalyzer()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text.strip():
            return jsonify({
                'error': 'Please enter some text to analyze.',
                'sentiment': None,
                'polarity': None,
                'subjectivity': None,
                'confidence': None
            })
        
        # 1. Subjectivity using TextBlob (VADER doesn't do this)
        blob = TextBlob(text)
        subjectivity = blob.sentiment.subjectivity
        
        # 2. Polarity using VADER (Better for social media, slang, profanity)
        vader_scores = sia.polarity_scores(text)
        polarity = vader_scores['compound']  # -1 to 1
        
        # Determine sentiment label and confidence
        # VADER compound score:
        # positive sentiment: compound score >= 0.05
        # neutral sentiment: (compound score > -0.05) and (compound score < 0.05)
        # negative sentiment: compound score <= -0.05
        
        if polarity >= 0.05:
            sentiment = 'positive'
            # Calculate confidence based on how strong the positive score is vs others
            confidence = vader_scores['pos'] * 100
            if confidence < 50: confidence = (polarity * 50) + 50 # Fallback scaling
        elif polarity <= -0.05:
            sentiment = 'negative'
            confidence = vader_scores['neg'] * 100
            if confidence < 50: confidence = (abs(polarity) * 50) + 50
        else:
            sentiment = 'neutral'
            confidence = vader_scores['neu'] * 100
            
        # Cap confidence at 99.9%
        confidence = min(confidence, 99.9)
        # Ensure minimum confidence isn't too low if it found a sentiment
        if sentiment != 'neutral' and confidence < 50:
            confidence = 50 + (abs(polarity) * 40)

        return jsonify({
            'sentiment': sentiment,
            'polarity': round(polarity, 2),
            'subjectivity': round(subjectivity, 2),
            'confidence': round(confidence, 1),
            'error': None
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'error': f'An error occurred: {str(e)}',
            'sentiment': None,
            'polarity': None,
            'subjectivity': None,
            'confidence': None
        })

if __name__ == '__main__':
    # Create templates and static directories if they don't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    app.run(debug=True)