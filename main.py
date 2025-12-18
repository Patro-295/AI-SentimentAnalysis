from textblob import TextBlob

# Get input from the user
sentence = input("Enter a sentence: ")

# Create a TextBlob object
blob = TextBlob(sentence)

# Get the sentiment polarity and subjectivity
polarity = blob.sentiment.polarity
subjectivity = blob.sentiment.subjectivity

print(f"Polarity: {polarity:.2f} (from -1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)")
print(f"Subjectivity: {subjectivity:.2f} (from 0 to 1, where 0 is very objective, 1 is very subjective)")

# sentiment check
if polarity > 0:
    print("The sentiment is positive.")
elif polarity < 0:
    print("The sentiment is negative.")
else:
    print("The sentiment is neutral.")
