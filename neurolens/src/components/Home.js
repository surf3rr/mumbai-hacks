import React, { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    // Redirect to Flask-rendered page
    window.location.href = '/';
  }, []);

  return (
    <div>
      <p>Redirecting to homepage...</p>
    </div>
  );
};

export default Home;