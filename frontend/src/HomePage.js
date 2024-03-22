// HomePage.js
import React from 'react';
import Chat from './Chat';

const HomePage = () => {
  return (
    <div className="bg-gray-900 flex flex-col text-dark-text min-h-screen"> {/* Updated to bg-gray-900 */}
      <nav className="flex justify-between items-center p-4">
        {/* Logo and v51 */}
        <div className="flex items-center">
          <div className="mr-2">🌐</div> {/* Placeholder for logo */}
          <span>v51</span>
        </div>
        {/* Profile Icon */}
        <div className="profile-icon">
          {/* Placeholder for profile icon; change the background color based on login status */}
          <div className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">👤</div>
        </div>
      </nav>
      {/* Main content */}
      <div className="flex-grow p-4">
        {/* Your content here */}
        <Chat />
      </div>
    </div>
  );
};

export default HomePage;