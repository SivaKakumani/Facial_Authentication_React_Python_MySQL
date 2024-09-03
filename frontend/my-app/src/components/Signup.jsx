import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './Signup.css'; // Assuming you have the CSS file for styling

const Signup = () => {
    // State to store username, password, and captured images
    const [username, setUsername] = useState(''); // State for username input
    const [password, setPassword] = useState(''); // State for password input
    const [images, setImages] = useState([]); // State for storing captured images

    // useRef to access the webcam component
    const webcamRef = useRef(null);

    // Function to capture an image from the webcam
    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot(); // Capture the screenshot from the webcam
        setImages([...images, imageSrc]); // Add the captured image to the images array
    };

    // Function to handle the signup process
    const handleSignup = async () => {
        // Prepare the data to be sent to the backend
        const data = {
            username,
            password,
            images,
        };

        try {
            // Send a POST request to the backend with the signup data
            const response = await axios.post('http://localhost:5000/signup', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Check the response from the server
            if (response.data.success) {
                alert('Signup successful!'); // Show success message
            } else {
                alert('Signup failed. Please try again.'); // Show failure message
            }
        } catch (error) {
            console.error('Error during signup:', error); // Log any error during signup
            alert('An error occurred during signup.'); // Show error message
        }
    };

    return (
        <div className="signup-container">
            {/* Signup header */}
            <header className="signup-header">
                <h1>Sign Up</h1>
                <p>
                    Already have an account? <a href="/signin">Sign in here</a> {/* Link to signin page */}
                </p>
            </header>

            {/* Signup form */}
            <div className="signup-form">
                {/* Username input field */}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                />
                {/* Password input field */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                />

                {/* Capture image section */}
                <div className="capture-container">
                    <div className="capture-box">
                        {/* Webcam component to capture live video */}
                        <Webcam
                            audio={false} // Disable audio capture
                            ref={webcamRef} // Reference to access the webcam
                            screenshotFormat="image/jpeg" // Set format for captured image
                            className="webcam"
                            width={400} // Set width of webcam display
                            height={300} // Set height of webcam display
                        />
                        {/* Button to capture image */}
                        <button onClick={captureImage} className="capture-button">
                            Capture Image
                        </button>
                    </div>
                </div>

                {/* Button to submit signup form */}
                <button onClick={handleSignup} className="signup-button">
                    Sign Up
                </button>
            </div>

            {/* Display captured images */}
            <div>
                {images.map((image, index) => (
                    <img key={index} src={image} alt={`Captured ${index + 1}`} width="100" />
                ))}
            </div>
        </div>
    );
};

export default Signup;
