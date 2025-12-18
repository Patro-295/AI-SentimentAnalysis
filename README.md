<div align="center">

# 🧠 AI Sentiment Analyzer

[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![VADER](https://img.shields.io/badge/NLTK-VADER-green?style=for-the-badge&logo=python&logoColor=white)](https://www.nltk.org/_modules/nltk/sentiment/vader.html)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br />

**A modern, beautiful web application that uses advanced Natural Language Processing to detect emotions in text.**
<br />
*Real-time Analysis • Dark Mode • History Tracking • Visual Gauge*

<br />

![App Preview](https://via.placeholder.com/800x400.png?text=Add+Your+Application+Screenshot+Here)
*(Replace this image with a screenshot of your beautiful dashboard)*

</div>

---

## ✨ Features

<div align="center">

| 🚀 **Modern Interface** | 🤖 **AI Powered** | ⚡ **Real-time** |
|:---:|:---:|:---:|
| Glassmorphism Design<br>Dark/Light Mode<br>Responsive Layout | VADER Sentiment Engine<br>Profanity Detection<br>Subjectivity Analysis | Instant Feedback<br>Live Gauge Chart<br>Confidence Score |

</div>

### 🎨 User Experience
- **Split-Screen Dashboard**: Type on the left, see results on the right (Desktop).
- **Interactive Visualizations**: animated gauge chart showing polarity from Negative 🔴 to Positive 🟢.
- **Smart History**: Automatically saves your recent analyses for quick comparison.
- **Confetti Celebration**: Fun animations when high-confidence positive sentiment is detected!

---

## 🛠️ Installation & Setup

Follow these steps to get the project running on your local machine.

<details>
<summary><b>1. Clone the Repository</b> (Click to expand)</summary>

```bash
git clone https://github.com/yourusername/AI-SentimentAnalysis.git
cd AI-SentimentAnalysis
```
</details>

<details>
<summary><b>2. Set up Virtual Environment</b></summary>

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```
</details>

<details>
<summary><b>3. Install Dependencies</b></summary>

```bash
pip install -r requirements.txt
```
</details>

<details>
<summary><b>4. Run the Application</b></summary>

```bash
python app.py
```
The app will start at `http://127.0.0.1:5000`
</details>

---

## 🏗️ Tech Stack

*   **Backend**: Flask (Python)
*   **NLP Engine**: NLTK (VADER) & TextBlob
*   **Frontend**: HTML5, CSS3 (Custom Glassmorphism), JavaScript (Vanilla)
*   **Icons**: Font Awesome 6
*   **Fonts**: Inter (Google Fonts)

---

## 📂 Project Structure

```
AI-SentimentAnalysis/
├── static/
│   ├── css/
│   │   ├── style.css       # Main styles & themes
│   │   └── animations.css  # Keyframe animations
│   └── js/
│       └── script.js       # Frontend logic & API calls
├── templates/
│   └── index.html          # Main application interface
├── app.py                  # Flask backend & VADER logic
├── requirements.txt        # Project dependencies
└── README.md               # Project documentation
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<div align="center">

Made with ❤️ by [Your Name]

</div>
