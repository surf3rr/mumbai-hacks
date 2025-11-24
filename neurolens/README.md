# NeuroLens - Real-time Autism Screening Prototype

A computer vision-based tool for preliminary behavioral analysis related to autism spectrum traits. This application analyzes eye contact, head movement, facial expressions, and attention patterns through real-time webcam input.

## 🚨 Important Disclaimer

**This tool is designed for research and educational purposes only. It is NOT a medical diagnostic tool. Results should not be used as the sole basis for any clinical decision. Always consult with qualified healthcare professionals for proper evaluation and diagnosis.**

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS + `react-webcam`
- **Backend**: Python Flask
- **AI/ML Libraries**: 
  - `mediapipe` (face mesh, pose, eye landmarks)
  - `opencv-python` (video frame processing)
  - `deepface` (facial analysis)
  - `numpy`, `scipy` (feature computation)

## 📋 Features

- Real-time webcam capture and analysis
- Dual stimulus display (social vs geometric)
- Behavioral metrics tracking:
  - Eye contact patterns
  - Head movement stereotypy
  - Facial expression variability
  - Attention stability
- Risk score computation (0-100)
- Detailed report generation

## 🚀 Setup Instructions

1. Clone the repository and navigate to the project directory
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Install Node.js dependencies:
   ```bash
   npm install
   ```
5. Start the Flask backend:
   ```bash
   python app.py
   ```
6. In a new terminal, start the React frontend:
   ```bash
   npm start
   ```

## 📖 Usage

1. Access the application at `http://localhost:3000`
2. Navigate to the screening page
3. Position yourself in front of your webcam (2-3 feet away)
4. Click "Start Analysis" to begin the 2-minute session
5. Watch the stimulus videos naturally while the system analyzes your behavior
6. After 2 minutes, view your results on the report page

## 🧠 Risk Score Calculation

The risk score is computed using the formula:

```
risk = 0.4*(1.0 - eye_contact_ratio) + 
       0.2*min(head_movement_std / 20, 1) + 
       0.2*(1.0 - facial_variance) + 
       0.2*(1.0 - attention_stability)
```

- **Low Risk**: < 40
- **Moderate Risk**: 40-60
- **Higher Risk**: > 60

## ⚠️ Limitations

- Requires good lighting and clear view of face
- Accuracy may vary based on individual characteristics
- Not suitable for diagnostic purposes
- Performance depends on device capabilities

## 🤝 Contributing

This is a prototype developed for a hackathon. Contributions to improve accuracy, usability, or add features are welcome.

## 📄 License

This project is for educational and research purposes only.