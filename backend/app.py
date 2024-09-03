from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import mysql.connector
import base64
import cv2
import io
from PIL import Image
import json

# Initialize Flask app
app = Flask(__name__)

# Enable CORS to allow cross-origin requests from the React frontend
CORS(app)

# MySQL connection setup
db_connection = mysql.connector.connect(
    host="localhost",      # Database host
    user="kvsp",           # MySQL username
    password="your_password",  # MySQL password
    database="face_auth_db"    # Database name
)
cursor = db_connection.cursor()

# Function to decode a base64 image string and convert it to a numpy array
def decode_image(image_str):
    # Extract base64 image data (removing the 'data:image/...;base64,' prefix)
    image_data = base64.b64decode(image_str.split(',')[1])
    # Open the image from the decoded bytes
    image = Image.open(io.BytesIO(image_data))
    # Convert the image to a format suitable for face recognition (BGR format for OpenCV)
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

# Function to generate face embeddings from a list of images
def generate_embeddings(images):
    embeddings = []
    for image_str in images:
        image = decode_image(image_str)  # Convert base64 image to numpy array
        face_locations = face_recognition.face_locations(image)  # Find faces in the image
        if face_locations:
            # Generate face encodings (embeddings) for the detected faces
            face_encodings = face_recognition.face_encodings(image, face_locations)
            embeddings.append(face_encodings[0])  # Assuming only one face per image
    return embeddings

# Function to calculate the average face embedding from a list of embeddings
def calculate_average_embedding(embeddings):
    return np.mean(embeddings, axis=0)  # Calculate the mean of the embeddings

# Function to store the average embedding, along with the username and password, in the MySQL database
def store_average_embedding(username, password, average_embedding):
    # Convert the numpy array to a JSON string for storage in the database
    embedding_str = json.dumps(average_embedding.tolist())
    # SQL query to insert the username, password, and face embedding into the 'users2' table
    sql = "INSERT INTO users2 (username, password, face_embedding) VALUES (%s, %s, %s)"
    cursor.execute(sql, (username, password, embedding_str))  # Execute the query
    db_connection.commit()  # Commit the changes to the database

# Route to handle the signup process
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json  # Get the JSON data from the request
    images = data.get('images', [])  # Retrieve the list of images from the request data
    username = data.get('username')  # Retrieve the username
    password = data.get('password')  # Retrieve the password

    if images:
        embeddings = generate_embeddings(images)  # Generate face embeddings for the provided images
        if embeddings:
            # Calculate the average embedding from the provided images
            average_embedding = calculate_average_embedding(embeddings)
            # Store the username, password, and average embedding in the database
            store_average_embedding(username, password, average_embedding)
            return jsonify({"success": True, "message": "Signup successful!"})  # Return success response
    return jsonify({"success": False, "message": "Signup failed."})  # Return failure response if no images or embeddings

# Route to handle the signin process
@app.route('/signin', methods=['POST'])
def signin():
    data = request.json  # Get the JSON data from the request
    image_str = data.get('image')  # Retrieve the image from the request data
    username = data.get('username')  # Retrieve the username

    if image_str and username:
        sign_in_image = decode_image(image_str)  # Convert base64 image to numpy array
        face_locations = face_recognition.face_locations(sign_in_image)  # Find faces in the sign-in image
        if face_locations:
            # Generate face encoding (embedding) for the detected face in the sign-in image
            sign_in_embedding = face_recognition.face_encodings(sign_in_image, face_locations)[0]
            # SQL query to retrieve the stored face embedding for the provided username
            sql = "SELECT face_embedding FROM users2 WHERE username = %s"
            cursor.execute(sql, (username,))
            result = cursor.fetchone()  # Fetch the result from the query

            if result:
                # Convert the stored embedding from JSON string to numpy array
                stored_embedding = np.array(json.loads(result[0]))
                # Calculate the Euclidean distance between the stored embedding and the sign-in embedding
                distance = np.linalg.norm(stored_embedding - sign_in_embedding)
                # If the distance is below a certain threshold, authentication is successful
                if distance < 0.6:  # Threshold for authentication
                    return jsonify({"success": True, "message": "Sign-in successful!"})  # Return success response
    return jsonify({"success": False, "message": "Authentication failed."})  # Return failure response if authentication fails

# Run the Flask app in debug mode
if __name__ == '__main__':
    app.run(debug=True)
