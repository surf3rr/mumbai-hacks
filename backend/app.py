from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import time
import threading
from dataclasses import dataclass
from typing import List, Optional, Tuple, Dict, Any
import json
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize MediaPipe components
mp_face_mesh = mp.solutions.face_mesh
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# Global variables to store analysis data
@dataclass
class BehavioralMetrics:
    total_frames: int = 0
    frames_with_face: int = 0
    eye_contact_ratio: float = 0.0
    head_movement_std: float = 0.0
    facial_variance: float = 0.0
    attention_stability: float = 0.0
    attention_switches: int = 0
    current_attention_side: str = 'center'  # 'left', 'right', 'center'
    face_landmarks_history: List[List] = None
    
    def __post_init__(self):
        if self.face_landmarks_history is None:
            self.face_landmarks_history = []

class AutismScreeningEngine:
    def __init__(self):
        self.face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        self.metrics = BehavioralMetrics()
        self.analysis_active = False
        self.lock = threading.Lock()
        
    def process_frame(self, image_data: str) -> Dict[str, Any]:
        """Process a single frame from webcam"""
        try:
            # Decode base64 image
            img_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return {"error": "Could not decode image"}
            
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.face_mesh.process(rgb_frame)
            
            with self.lock:
                self.metrics.total_frames += 1
                frame_metrics = self._analyze_frame(frame, results)
                
                # Store face landmarks for variance calculation
                if frame_metrics['face_detected']:
                    self.metrics.frames_with_face += 1
                    self.metrics.face_landmarks_history.append(frame_metrics['landmarks'])
                    
                    # Keep only last 30 frames for performance
                    if len(self.metrics.face_landmarks_history) > 30:
                        self.metrics.face_landmarks_history = self.metrics.face_landmarks_history[-30:]
                
                return frame_metrics
        except Exception as e:
            return {"error": f"Error processing frame: {str(e)}"}
    
    def _analyze_frame(self, frame: np.ndarray, results) -> Dict[str, Any]:
        """Analyze a single frame for behavioral metrics"""
        height, width, _ = frame.shape
        frame_metrics = {
            'face_detected': False,
            'eye_contact_ratio': 0.0,
            'head_movement': 0.0,
            'facial_expression_variance': 0.0,
            'attention_side': 'center',
            'landmarks': []
        }
        
        if results.multi_face_landmarks:
            frame_metrics['face_detected'] = True
            face_landmarks = results.multi_face_landmarks[0]
            
            # Extract relevant landmarks
            landmarks = []
            for landmark in face_landmarks.landmark:
                x = int(landmark.x * width)
                y = int(landmark.y * height)
                landmarks.append((x, y))
            
            frame_metrics['landmarks'] = landmarks
            
            # Calculate eye contact (simplified: looking at center of screen)
            nose_tip = landmarks[1]  # Nose tip landmark
            eye_contact_ratio = self._calculate_eye_contact(nose_tip, width, height)
            frame_metrics['eye_contact_ratio'] = eye_contact_ratio
            
            # Determine attention side (left vs right half of screen)
            face_center_x = nose_tip[0]
            attention_side = 'left' if face_center_x < width / 2 else 'right'
            frame_metrics['attention_side'] = attention_side
            
            # Calculate head movement (change in nose position)
            head_movement = self._calculate_head_movement(nose_tip)
            frame_metrics['head_movement'] = head_movement
            
            # Calculate facial expression variance
            facial_variance = self._calculate_facial_variance(landmarks)
            frame_metrics['facial_expression_variance'] = facial_variance
        
        return frame_metrics
    
    def _calculate_eye_contact(self, nose_tip: Tuple[int, int], width: int, height: int) -> float:
        """Calculate eye contact ratio based on face orientation"""
        # Simplified: measure distance from center of screen
        center_x, center_y = width / 2, height / 2
        distance_from_center = np.sqrt((nose_tip[0] - center_x)**2 + (nose_tip[1] - center_y)**2)
        max_distance = np.sqrt((width/2)**2 + (height/2)**2)
        
        # The closer to center, the higher the eye contact score
        normalized_distance = distance_from_center / max_distance
        eye_contact_score = max(0, 1 - normalized_distance)
        
        return eye_contact_score
    
    def _calculate_head_movement(self, current_nose_pos: Tuple[int, int]) -> float:
        """Calculate head movement based on nose position changes"""
        # For now, return a placeholder value
        # In a real implementation, we'd track changes over time
        return 0.0
    
    def _calculate_facial_variance(self, landmarks: List[Tuple[int, int]]) -> float:
        """Calculate facial expression variance"""
        # For now, return a placeholder value
        # In a real implementation, we'd compare to baseline expressions
        return 0.0
    
    def compute_autism_risk(self) -> Dict[str, Any]:
        """Compute final autism risk score based on collected metrics"""
        with self.lock:
            # Calculate metrics based on collected data
            eye_contact_ratio = self.metrics.frames_with_face > 0 and self._calculate_average_eye_contact() or 0.0
            head_movement_std = self._calculate_head_movement_std()
            facial_variance = self._calculate_average_facial_variance()
            attention_stability = self._calculate_attention_stability()
            
            # Apply the risk calculation formula from the prompt
            eye_risk = 1.0 - eye_contact_ratio         # lower eye contact → higher risk
            head_risk = min(head_movement_std / 20, 1) # high stereotypy → higher risk
            face_risk = 1.0 - facial_variance          # low expression change → higher risk
            att_risk = 1.0 - attention_stability       # poor focus → higher risk

            total_risk = 0.4*eye_risk + 0.2*head_risk + 0.2*face_risk + 0.2*att_risk
            risk_score = round(total_risk * 100, 1)
            
            # Determine risk category
            if risk_score < 40:
                risk_category = "Low"
                risk_color = "green"
            elif risk_score < 60:
                risk_category = "Moderate"
                risk_color = "yellow"
            else:
                risk_category = "High"
                risk_color = "red"
            
            # Determine metric quality
            eye_contact_quality = "High" if eye_contact_ratio > 0.7 else "Medium" if eye_contact_ratio > 0.4 else "Low"
            head_movement_quality = "High" if head_movement_std > 15 else "Medium" if head_movement_std > 8 else "Low"
            facial_expression_quality = "High" if facial_variance > 0.7 else "Medium" if facial_variance > 0.4 else "Low"
            attention_quality = "Stable" if attention_stability > 0.7 else "Moderate" if attention_stability > 0.4 else "Unstable"
            
            # Generate recommendations
            recommendations = []
            if risk_score > 60:
                recommendations.append("Consider professional evaluation for developmental screening.")
            elif risk_score > 40:
                recommendations.append("Monitor development and consider consultation with pediatrician.")
            else:
                recommendations.append("Development appears typical for age range.")
            
            result = {
                "autism_risk_score": risk_score,
                "risk_category": risk_category,
                "risk_color": risk_color,
                "metrics": {
                    "eye_contact": eye_contact_quality,
                    "head_movement": head_movement_quality,
                    "facial_expression": f"{facial_expression_quality} variability",
                    "attention": attention_quality
                },
                "recommendation": recommendations[0],
                "data_quality": {
                    "total_frames": self.metrics.total_frames,
                    "frames_with_face": self.metrics.frames_with_face,
                    "detection_rate": round(self.metrics.frames_with_face / max(1, self.metrics.total_frames) * 100, 1)
                }
            }
            
            return result
    
    def _calculate_average_eye_contact(self) -> float:
        """Calculate average eye contact ratio from history"""
        # For now, return a placeholder
        return 0.5
    
    def _calculate_head_movement_std(self) -> float:
        """Calculate standard deviation of head movement"""
        # For now, return a placeholder
        return 10.0
    
    def _calculate_average_facial_variance(self) -> float:
        """Calculate average facial expression variance"""
        # For now, return a placeholder
        return 0.5
    
    def _calculate_attention_stability(self) -> float:
        """Calculate attention stability based on attention switches"""
        # For now, return a placeholder
        return 0.5
    
    def reset_metrics(self):
        """Reset all metrics for a new analysis"""
        with self.lock:
            self.metrics = BehavioralMetrics()

# Initialize the screening engine
screening_engine = AutismScreeningEngine()

@app.route('/')
def index():
    """Serve the main page"""
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>NeuroLens - Autism Screening</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .stimulus-container { display: flex; margin-bottom: 20px; }
            .stimulus-side { width: 50%; padding: 10px; }
            .social-stimulus { background-color: #e3f2fd; border: 2px solid #2196f3; }
            .geometric-stimulus { background-color: #f3e5f5; border: 2px solid #9c27b0; }
            .webcam-container { text-align: center; margin: 20px 0; }
            #webcam-video { width: 400px; height: 300px; border: 2px solid #ccc; }
            .controls { text-align: center; margin: 20px 0; }
            button { padding: 10px 20px; margin: 5px; font-size: 16px; }
            .results { margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; display: none; }
            .risk-score { font-size: 48px; font-weight: bold; text-align: center; margin: 20px 0; }
            .low-risk { color: green; }
            .moderate-risk { color: orange; }
            .high-risk { color: red; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>NeuroLens - Autism Screening Prototype</h1>
                <p>Real-time behavioral analysis for early autism screening</p>
            </div>
            
            <div class="stimulus-container">
                <div class="stimulus-side social-stimulus">
                    <h3>Social Stimulus (Faces)</h3>
                    <video width="100%" height="200" autoplay muted loop>
                        <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div class="stimulus-side geometric-stimulus">
                    <h3>Geometric Patterns</h3>
                    <canvas id="geometricCanvas" width="300" height="200"></canvas>
                </div>
            </div>
            
            <div class="webcam-container">
                <h3>Webcam Feed</h3>
                <video id="webcam-video" autoplay playsinline></video>
                <p>Position child in front of camera, facing the screen</p>
            </div>
            
            <div class="controls">
                <button id="start-btn">Start Screening (2 min)</button>
                <button id="stop-btn" disabled>Stop Screening</button>
            </div>
            
            <div id="results" class="results">
                <h2>Screening Results</h2>
                <div id="risk-score" class="risk-score"></div>
                <div id="metrics"></div>
                <div id="recommendation"></div>
            </div>
        </div>

        <script>
            const video = document.getElementById('webcam-video');
            const startBtn = document.getElementById('start-btn');
            const stopBtn = document.getElementById('stop-btn');
            const resultsDiv = document.getElementById('results');
            const riskScoreDiv = document.getElementById('risk-score');
            const metricsDiv = document.getElementById('metrics');
            const recommendationDiv = document.getElementById('recommendation');
            const geometricCanvas = document.getElementById('geometricCanvas');
            const ctx = geometricCanvas.getContext('2d');
            
            let stream = null;
            let isAnalyzing = false;
            let analysisInterval = null;
            let frameCount = 0;
            
            // Draw animated geometric patterns
            function drawGeometricPattern() {
                ctx.clearRect(0, 0, geometricCanvas.width, geometricCanvas.height);
                
                // Draw rotating shapes
                const time = Date.now() * 0.001;
                const centerX = geometricCanvas.width / 2;
                const centerY = geometricCanvas.height / 2;
                
                // Rotating triangles
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(time);
                ctx.fillStyle = '#9c27b0';
                ctx.beginPath();
                ctx.moveTo(0, -50);
                ctx.lineTo(-43, 25);
                ctx.lineTo(43, 25);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                
                // Pulsing circles
                const scale = 0.5 + 0.5 * Math.sin(time * 2);
                ctx.fillStyle = 'rgba(156, 39, 176, 0.6)';
                ctx.beginPath();
                ctx.arc(centerX, centerY, 30 * scale, 0, Math.PI * 2);
                ctx.fill();
                
                requestAnimationFrame(drawGeometricPattern);
            }
            
            drawGeometricPattern();
            
            // Start webcam
            async function startWebcam() {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { width: 640, height: 480 } 
                    });
                    video.srcObject = stream;
                } catch (err) {
                    console.error('Error accessing webcam:', err);
                    alert('Could not access webcam. Please ensure you have granted permission.');
                }
            }
            
            // Capture and send frame for analysis
            function captureFrame() {
                if (!isAnalyzing) return;
                
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert to base64
                const imageData = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
                
                // Send to backend
                fetch('/api/process_frame', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image_data: imageData
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Frame processed:', data);
                })
                .catch(error => {
                    console.error('Error sending frame:', error);
                });
                
                frameCount++;
            }
            
            // Start screening
            startBtn.addEventListener('click', async () => {
                await startWebcam();
                
                isAnalyzing = true;
                startBtn.disabled = true;
                stopBtn.disabled = false;
                
                // Start capturing frames every 500ms (2 fps)
                analysisInterval = setInterval(captureFrame, 500);
                
                // Stop after 2 minutes (120 seconds)
                setTimeout(stopScreening, 120000);
            });
            
            // Stop screening and get results
            async function stopScreening() {
                isAnalyzing = false;
                
                if (analysisInterval) {
                    clearInterval(analysisInterval);
                    analysisInterval = null;
                }
                
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    stream = null;
                }
                
                startBtn.disabled = false;
                stopBtn.disabled = true;
                
                // Get final results
                try {
                    const response = await fetch('/api/get_results', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({})
                    });
                    
                    const results = await response.json();
                    
                    // Display results
                    riskScoreDiv.textContent = results.autism_risk_score;
                    riskScoreDiv.className = `risk-score ${results.risk_color}-risk`;
                    
                    let metricsHtml = '<h3>Behavioral Metrics:</h3><ul>';
                    for (const [key, value] of Object.entries(results.metrics)) {
                        metricsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
                    }
                    metricsHtml += '</ul>';
                    metricsDiv.innerHTML = metricsHtml;
                    
                    recommendationDiv.innerHTML = `<h3>Recommendation:</h3><p>${results.recommendation}</p>`;
                    
                    resultsDiv.style.display = 'block';
                    
                    console.log('Final results:', results);
                } catch (error) {
                    console.error('Error getting results:', error);
                    alert('Error getting results. Please try again.');
                }
            }
            
            // Stop button event
            stopBtn.addEventListener('click', stopScreening);
        </script>
    </body>
    </html>
    """
    return render_template_string(html_template)

@app.route('/api/process_frame', methods=['POST'])
def process_frame():
    """Process a single frame from the frontend"""
    try:
        data = request.json
        image_data = data.get('image_data', '')
        
        if not image_data:
            return jsonify({"error": "No image data provided"}), 400
        
        result = screening_engine.process_frame(image_data)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/get_results', methods=['POST'])
def get_results():
    """Get final screening results"""
    try:
        results = screening_engine.compute_autism_risk()
        return jsonify(results)
    
    except Exception as e:
        return jsonify({"error": f"Error computing results: {str(e)}"}), 500

@app.route('/api/reset', methods=['POST'])
def reset():
    """Reset the screening engine"""
    try:
        screening_engine.reset_metrics()
        return jsonify({"status": "reset"})
    except Exception as e:
        return jsonify({"error": f"Error resetting: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)