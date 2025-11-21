import React, { useState } from "react";
import axios from "axios";
import "./LoginPage.css"; // Make sure to import your CSS file correctly

interface RegisterPageProps {
  onRegister: () => void; // Callback to handle successful registration
  goToLogin: () => void; // Callback to navigate to login page
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, goToLogin }) => {
  const [fname, setFname] = useState(""); // First name state
  const [lname, setLname] = useState(""); // Last name state
  const [email, setEmail] = useState(""); // Email state
  const [contactNo, setContactNo] = useState(""); // Contact number state
  const [password, setPassword] = useState(""); // Password state
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [loading, setLoading] = useState(false); // Loading state for form submission

  // Handle registration submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setErrorMessage(""); // Clear previous error messages
    setLoading(true); // Set loading state

    // Validate the form fields
    if (!fname || !lname || !email || !contactNo || !password) {
      setErrorMessage("Fname, Lname, Email, Contact No, and Password are required.");
      setLoading(false);
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setErrorMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const userData = {
      fname,
      lname,
      email,
      contact_no: contactNo,
      password,
    };

    console.log("Sending registration data:", userData); // Log the data being sent

    try {
      // Send registration request to backend
      const response = await axios.post("http://localhost:5000/auths/register", userData);

      if (response.status === 201) {
        // On success, call onRegister to navigate to login page
        onRegister();
      }
    } catch (err) {
      setLoading(false); // Reset loading state
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
          setErrorMessage(err.response.data.message || "Registration failed. Try again.");
        } else if (err.response.status === 500) {
          // Handle server error
          setErrorMessage("Internal server error. Please try again later.");
        } else {
          // Generic error message
          setErrorMessage("Registration failed. Please try again.");
        }
      } else {
        // Network or unexpected error
        setErrorMessage("An unexpected error occurred. Please check your network and try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Register</h2>
        <p className="login-subtitle">Create your account to get started.</p>

        {/* Display error message if any */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Registration form */}
        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              className="form-input"
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              className="form-input"
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input
              type="text"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              className="form-input"
              placeholder="Enter your contact number"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`login-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login Button */}
        <button className="switch-button" onClick={goToLogin}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
