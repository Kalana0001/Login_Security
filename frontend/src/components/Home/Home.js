import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Home.css';

function Home() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    profilePicture: null,
  });

  const [userInfo, setUserInfo] = useState({
    id: '',
    email: '',
    name: '',
  });

  const navigate = useNavigate(); // Initialize useNavigate hook for navigation

  useEffect(() => {
    // Fetch user data from the API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the JWT from local storage

        if (!token) {
          console.error('No token found, user is not authenticated.');
          navigate('/signin'); // Redirect to sign-in if no token is found
          return; // Exit if there is no token
        }

        const response = await fetch('http://localhost:8087/users', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request headers
            'Content-Type': 'application/json', // Set content type to JSON
          },
        });

        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Set userInfo and formData with fetched user data
        setUserInfo({
          id: data.id, // Directly use the user's data
          email: data.email,
          name: data.name,
        });

        // Set form data with fetched user data
        setFormData({
          fullName: data.name || '', // Assuming name is in your DB
          email: data.email || '', // Adjust based on your DB structure
          profilePicture: null, // Start with no profile picture
        });
      } catch (error) {
        console.error('Error fetching user data:', error.message); // More detailed error logging
      }
    };

    fetchUserData();
  }, [navigate]); // Include navigate in the dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Here, you would typically make an API call to update the user information.
  };

  const handleLogout = () => {
    // Clear the token from local storage
    localStorage.removeItem('token');
    console.log('User logged out'); // Log the logout action
    navigate('/'); // Redirect to the login page or desired route
  };

  return (
    <div className='home'>
      <div className="app-container">
        <div className="profile-card">
          <div className="profile-image">
            <img
              src={formData.profilePicture ? URL.createObjectURL(formData.profilePicture) : "https://via.placeholder.com/150"}
              alt="Profile"
            />
          </div>
          <h2>{formData.fullName}</h2>
          <div className="user-info">
            <p className='user_data'>User ID: {userInfo.id}</p>
            <p className='user_data'>Name: {userInfo.name}</p>
            <p className='user_data'>Email: {userInfo.email}</p>
          </div>
          <div className="buttons">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="edit-profile-form">
          <h2 className='home_h1'>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input 
              type="text" 
              name="fullName"
              className='home_input' 
              value={formData.fullName} 
              onChange={handleChange} 
            />
            
            <label>Email</label>
            <input 
              type="text"
              name="email"
              className='home_input' 
              value={formData.email} 
              onChange={handleChange} 
            />
            
            <label>Profile Picture</label>
            <input 
              type="file" 
              name="profilePicture" 
              className='home_input' 
              onChange={handleFileChange} 
            />
            
            <button type="submit" className="update-btn">Update</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
