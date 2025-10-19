# AI-Powered Early Autism Risk Detector MVP - Development Plan

## Project Overview
A web application for early autism risk screening in toddlers (<3 years) using behavioral observation through video and audio analysis.

## Core Features to Implement
1. Landing page with consent and instructions
2. Real-time video/audio capture interface
3. Three assessment tasks:
   - Task A: Name response test
   - Task B: Toy interaction observation
   - Task C: Free play observation
4. Basic AI analysis simulation (gaze tracking, facial expressions, audio patterns)
5. Risk assessment results with visual indicators
6. Simple report generation

## Files to Create/Modify

### 1. src/pages/Index.tsx
- Landing page with consent form
- Project introduction and instructions
- "Start Screening" button

### 2. src/pages/Calibration.tsx
- Camera/microphone permission setup
- Baseline capture interface
- Equipment check

### 3. src/pages/TaskA.tsx
- Name response task interface
- Video recording with instructions
- Progress tracking

### 4. src/pages/TaskB.tsx
- Toy interaction task
- Recording interface with visual cues

### 5. src/pages/TaskC.tsx
- Free play observation task
- Extended recording session

### 6. src/pages/Results.tsx
- Risk score visualization
- Behavioral flags display
- Report download option

### 7. src/components/VideoCapture.tsx
- Real-time video capture component
- Camera controls and preview

### 8. src/components/AudioCapture.tsx
- Audio recording functionality
- Visual audio level indicators

## Implementation Strategy
- Use browser WebRTC APIs for media capture
- Simulate AI analysis with realistic mock data
- Focus on smooth UX and clear visual feedback
- Implement responsive design for various devices
- Add progress indicators throughout the flow

## Technical Considerations
- Privacy-first approach (no data storage without consent)
- Accessible design for parents/caregivers
- Clear instructions and visual guidance
- Error handling for media permissions