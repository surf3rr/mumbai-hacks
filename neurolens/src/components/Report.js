import React, { useEffect } from 'react';

const Report = () => {
  useEffect(() => {
    // Redirect to Flask-rendered page
    window.location.href = '/report';
  }, []);

  return (
    <div>
      <p>Redirecting to report page...</p>
    </div>
  );
};

export default Report;