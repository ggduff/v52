import React, { useEffect } from 'react';
import './App.css';
import HomePage from './HomePage';

function App() {
/*   useEffect(() => {
    // Check if the user is authenticated
    fetch(`${process.env.REACT_APP_CHAT_API_URL}/check_auth`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          // If not authenticated, redirect to the Flask login page
          window.location.href = `${process.env.REACT_APP_CHAT_API_URL}/login`;
        }
      })
      .catch((error) => {
        console.error('Error checking authentication:', error);
        // Handle any errors, perhaps by showing an error message
      });
  }, []); */

  return (
    <div className="App">
      <HomePage />
    </div>
  );
}

export default App;