from flask import Flask, render_template, request, jsonify
import cv2
import mediapipe as mp
import numpy as np
from scipy.spatial.distance import euclidean
import threading
import time
import json
from datetime import datetime
import os

app = Flask(__name__)

# Initialize MediaPipe modules
mp_face_mesh = mp.solutions.face_mesh
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# Global variables for storing metrics
frame_count = 0
metrics_history = []
capture_active = False
analysis_start_time = None
session_metrics = {
    'eye_contact_ratios': [],
    'head_movements': [],
    'facial_variances': [],
    'attention_stabilities': []
}

def compute_eye_gaze_direction(landmarks, image_shape):
    """Compute eye gaze direction relative to screen center"""
    h, w = image_shape
    
    # Get nose landmark as reference point
    nose_tip = landmarks[1]  # Nose tip
    nose_x, nose_y = int(nose_tip.x * w), int(nose_tip.y * h)
    
    # Get eye landmarks
    left_eye = landmarks[159]  # Left eye lower
    right_eye = landmarks[145]  # Left eye upper
    
    # Calculate eye center
    eye_x = int((left_eye.x + right_eye.x) / 2 * w)
    eye_y = int((left_eye.y + right_eye.y) / 2 * h)
    
    # Calculate vector from nose to eye center
    gaze_vector = np.array([eye_x - nose_x, eye_y - nose_y])
    
    # Calculate angle relative to screen center (approximate)
    screen_center_x = w / 2
    eye_to_center = np.array([screen_center_x - eye_x, 0])  # Only x-axis for simplicity
    
    # Normalize vectors
    if np.linalg.norm(gaze_vector) == 0 or np.linalg.norm(eye_to_center) == 0:
        return 0.0
    
    gaze_norm = gaze_vector / np.linalg.norm(gaze_vector)
    center_norm = eye_to_center / np.linalg.norm(eye_to_center)
    
    # Calculate cosine similarity (0-1 scale)
    cos_sim = np.dot(gaze_norm, center_norm)
    
    # Return absolute value to indicate how much gaze is directed toward center
    return abs(cos_sim)

def compute_head_rotation(landmarks, image_shape):
    """Compute head rotation (yaw/pitch) from pose landmarks"""
    h, w = image_shape
    
    # Get key facial landmarks
    nose_tip = landmarks[1]
    left_eye = landmarks[33]
    right_eye = landmarks[263]
    mouth_left = landmarks[61]
    mouth_right = landmarks[291]
    
    # Calculate distances to indicate head rotation
    left_eye_to_nose = euclidean(
        (left_eye.x * w, left_eye.y * h),
        (nose_tip.x * w, nose_tip.y * h)
    )
    right_eye_to_nose = euclidean(
        (right_eye.x * w, right_eye.y * h),
        (nose_tip.x * w, nose_tip.y * h)
    )
    
    # Calculate difference as indicator of head rotation
    rotation_indicator = abs(left_eye_to_nose - right_eye_to_nose)
    
    return rotation_indicator

def compute_facial_expression_variance(landmarks):
    """Compute facial expression change using mouth landmarks"""
    # Get mouth landmarks
    mouth_left = landmarks[61]
    mouth_right = landmarks[291]
    mouth_top = landmarks[0]
    mouth_bottom = landmarks[17]
    
    # Calculate mouth aspect ratio (width/height) as expression indicator
    mouth_width = euclidean(
        (mouth_left.x, mouth_left.y),
        (mouth_right.x, mouth_right.y)
    )
    mouth_height = euclidean(
        (mouth_top.x, mouth_top.y),
        (mouth_bottom.x, mouth_bottom.y)
    )
    
    # Calculate aspect ratio
    if mouth_height == 0:
        return 0.0
    
    aspect_ratio = mouth_width / mouth_height
    return aspect_ratio

def compute_attention_stability(landmarks, image_shape):
    """Compute attention stability based on face position consistency"""
    h, w = image_shape
    
    # Get nose tip as reference point
    nose_tip = landmarks[1]
    face_x = nose_tip.x * w
    face_y = nose_tip.y * h
    
    # Calculate distance from screen center (0-1 scale)
    screen_center_x = w / 2
    screen_center_y = h / 2
    
    distance_from_center = euclidean(
        (face_x, face_y),
        (screen_center_x, screen_center_y)
    )
    
    # Normalize by screen diagonal
    max_distance = np.sqrt(w**2 + h**2) / 2
    normalized_distance = distance_from_center / max_distance
    
    # Return inverse for stability (lower distance = higher stability)
    return 1.0 - min(normalized_distance, 1.0)

def compute_autism_risk(eye_contact_ratio, head_movement_std, facial_variance, attention_stability):
    """Compute autism risk score using specified formula"""
    eye_risk = 1.0 - eye_contact_ratio         # lower eye contact → higher risk
    head_risk = min(head_movement_std / 20, 1)  # high stereotypy → higher risk
    face_risk = 1.0 - facial_variance           # low expression change → higher risk
    att_risk = 1.0 - attention_stability        # poor focus → higher risk

    total_risk = 0.4*eye_risk + 0.2*head_risk + 0.2*face_risk + 0.2*att_risk
    return round(total_risk * 100, 1)  # e.g., 68.3

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/screen')
def screen():
    return render_template('screen.html')

@app.route('/report')
def report():
    return render_template('report.html')

@app.route('/api/start_analysis', methods=['POST'])
def start_analysis():
    global capture_active, analysis_start_time, session_metrics
    capture_active = True
    analysis_start_time = time.time()
    session_metrics = {
        'eye_contact_ratios': [],
        'head_movements': [],
        'facial_variances': [],
        'attention_stabilities': []
    }
    return jsonify({'status': 'started'})

@app.route('/api/stop_analysis', methods=['POST'])
def stop_analysis():
    global capture_active
    capture_active = False
    return jsonify({'status': 'stopped'})

@app.route('/api/process_frame', methods=['POST'])
def process_frame():
    global frame_count, session_metrics, capture_active
    
    if not capture_active:
        return jsonify({'error': 'Analysis not active'})
    
    # Get image from request
    image_data = request.json.get('image', None)
    if not image_data:
        return jsonify({'error': 'No image data provided'})
    
    # Decode base64 image
    import base64
    import io
    nparr = np.frombuffer(base64.b64decode(image_data.split(',')[1]), np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Process with MediaPipe
    with mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    ) as face_mesh:
        results = face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0].landmark
            
            # Calculate metrics
            eye_contact = compute_eye_gaze_direction(landmarks, image.shape)
            head_rotation = compute_head_rotation(landmarks, image.shape)
            facial_expr = compute_facial_expression_variance(landmarks)
            attention = compute_attention_stability(landmarks, image.shape)
            
            # Store metrics
            session_metrics['eye_contact_ratios'].append(eye_contact)
            session_metrics['head_movements'].append(head_rotation)
            session_metrics['facial_variances'].append(facial_expr)
            session_metrics['attention_stabilities'].append(attention)
            
            # Calculate running statistics
            avg_eye_contact = np.mean(session_metrics['eye_contact_ratios'])
            std_head_movement = np.std(session_metrics['head_movements'])
            avg_facial_expr = np.mean(session_metrics['facial_variances'])
            avg_attention = np.mean(session_metrics['attention_stabilities'])
            
            # Calculate current risk score
            current_risk = compute_autism_risk(
                avg_eye_contact,
                std_head_movement,
                avg_facial_expr,
                avg_attention
            )
            
            return jsonify({
                'status': 'success',
                'metrics': {
                    'eye_contact': avg_eye_contact,
                    'head_movement': std_head_movement,
                    'facial_expression': avg_facial_expr,
                    'attention': avg_attention
                },
                'current_risk': current_risk,
                'frame_count': len(session_metrics['eye_contact_ratios'])
            })
        else:
            # If no face detected, return default values
            return jsonify({
                'status': 'success',
                'metrics': {
                    'eye_contact': 0.0,
                    'head_movement': 0.0,
                    'facial_expression': 0.0,
                    'attention': 0.0
                },
                'current_risk': 100.0,  # High risk if no face detected
                'frame_count': len(session_metrics['eye_contact_ratios'])
            })

@app.route('/api/get_final_report', methods=['GET'])
def get_final_report():
    global session_metrics
    
    if len(session_metrics['eye_contact_ratios']) == 0:
        return jsonify({
            'autism_risk_score': 0,
            'metrics': {
                'eye_contact': "No data",
                'head_movement': "No data",
                'facial_expression': "No data",
                'attention': "No data"
            },
            'recommendation': "Insufficient data for evaluation"
        })
    
    # Calculate final averages
    avg_eye_contact = np.mean(session_metrics['eye_contact_ratios'])
    std_head_movement = np.std(session_metrics['head_movements'])
    avg_facial_expr = np.mean(session_metrics['facial_variances'])
    avg_attention = np.mean(session_metrics['attention_stabilities'])
    
    # Calculate final risk score
    final_risk = compute_autism_risk(
        avg_eye_contact,
        std_head_movement,
        avg_facial_expr,
        avg_attention
    )
    
    # Determine metric labels
    eye_contact_label = "High" if avg_eye_contact > 0.7 else "Medium" if avg_eye_contact > 0.4 else "Low"
    head_movement_label = "High" if std_head_movement > 0.5 else "Medium" if std_head_movement > 0.2 else "Low"
    facial_expr_label = "High variability" if avg_facial_expr > 1.5 else "Medium variability" if avg_facial_expr > 0.8 else "Low variability"
    attention_label = "Stable" if avg_attention > 0.7 else "Moderate" if avg_attention > 0.4 else "Unstable"
    
    # Determine recommendation
    if final_risk < 40:
        recommendation = "Low risk based on behavioral markers. Normal development patterns observed."
    elif final_risk < 60:
        recommendation = "Moderate risk. Consider monitoring developmental milestones."
    else:
        recommendation = "Higher risk indicated. Consider professional evaluation for developmental screening."
    
    return jsonify({
        'autism_risk_score': final_risk,
        'metrics': {
            'eye_contact': eye_contact_label,
            'head_movement': head_movement_label,
            'facial_expression': facial_expr_label,
            'attention': attention_label
        },
        'recommendation': recommendation
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)