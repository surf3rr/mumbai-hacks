# NeuroLens - Real-time Autism Screening Prototype

## Project Overview

NeuroLens is a real-time webcam-based autism behavioral screening prototype that runs in a browser, analyzes a child's video live for 2-3 minutes, detects autism-linked behavioral markers using lightweight AI, and generates a final risk score (0-100) with a simple report.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Python Flask with MediaPipe, OpenCV, and NumPy
- **AI/ML Libraries**: MediaPipe (face mesh, pose, eye landmarks), OpenCV (video frame processing)

## Features

- Real-time webcam capture and analysis
- Dual stimulus display (social vs geometric patterns)
- Behavioral metrics extraction:
  - Eye Gaze Direction
  - Head Rotation (Yaw/Pitch)
  - Facial Expression Change
  - Attention Stability
- Risk score calculation based on behavioral markers
- Comprehensive results display

## Setup Instructions

### Frontend Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Flask backend:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Running the Application

1. Start the backend server (Flask on port 5000)
2. Start the frontend server (React on port 5173)
3. Access the application at `http://localhost:5173`
4. Navigate to `/webcam` to access the webcam screening page

## API Endpoints

- `GET /` - Main application page
- `POST /api/process_frame` - Process a single frame from the webcam
- `POST /api/get_results` - Get final screening results
- `POST /api/reset` - Reset the screening engine

## Ethical Disclaimer

This screening tool is NOT a diagnostic instrument. It provides preliminary indicators only. Results should be reviewed with a qualified healthcare professional. This is a prototype for demonstration purposes only.
