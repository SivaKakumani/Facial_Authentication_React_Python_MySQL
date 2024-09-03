import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './Signin.css'; // Assuming you have the CSS for styling

const Signin = () => {
    const [username, setUsername] = useState('');
    const [useFace, setUseFace] = useState(false);
    const [image, setImage] = useState(null);
    const [isCameraOn, setIsCameraOn] = useState(false); // For controlling the camera state
    const webcamRef = useRef(null);

    const startCamera = () => {
        setIsCameraOn(true);
        setImage(null); // Reset the image when starting the camera
    };

    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
    };

    const handleSignin = async () => {
        const data = {
            username,
            image: useFace ? image : null,
        };

        try {
            const response = await axios.post('http://localhost:5000/signin', data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                alert('Sign-in successful!');
            } else {
                alert('Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during sign-in:', error);
            alert('An error occurred during sign-in.');
        }
    };

    return (
        <div className="signin-container">
            <header className="signin-header">
                <h1>Sign In</h1>
                <p>
                    New here? <a href="/signup">Create an account</a>
                </p>
            </header>
            <div className="signin-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                />
                {useFace && (
                    <div className="capture-container">
                        {!isCameraOn ? (
                            <button onClick={startCamera} className="capture-button">
                                Start Camera
                            </button>
                        ) : (
                            <div className="capture-box">
                                {image ? (
                                    <>
                                        <img src={image} alt="Captured face" className="captured-image" />
                                        <button onClick={startCamera} className="capture-button">
                                            Recapture Image
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            className="webcam"
                                            width={400}
                                            height={300}
                                        />
                                        
                                        <button onClick={captureImage} className="capture-button">
                                            Capture Face
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <div className="signin-options">
                    <label>
                        <input
                            type="checkbox"
                            checked={useFace}
                            onChange={(e) => {
                                setUseFace(e.target.checked);
                                if (!e.target.checked) setIsCameraOn(false); // Turn off the camera if face recognition is not used
                            }}
                        />
                        Sign in with face recognition
                    </label>
                </div>
                <button onClick={handleSignin} className="signin-button">
                    Sign In
                </button>
            </div>
        </div>
    );
};

export default Signin;
