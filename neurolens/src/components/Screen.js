import React, { useEffect } from 'react';

const Screen = () => {
  useEffect(() => {
    // Redirect to Flask-rendered page
    window.location.href = '/screen';
  }, []);

  return (
    <div>
      <p>Redirecting to screening page...</p>
    </div>
  );
};

export default Screen;