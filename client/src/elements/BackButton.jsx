import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BackButton = () => {
  const location = useLocation();
  const twitterPath = '/twitter/monitor/';
  const twitterRedirectPath = '/twitter';
  const oneFortyPath = '/pmd/monitor/';
  const oneFortyRedirectPath = '/pmd';

  let redirectPath = twitterRedirectPath;
  if (location.pathname.startsWith(twitterPath)) {
    redirectPath = twitterRedirectPath;
  } else if (location.pathname.startsWith(oneFortyPath)) {
    redirectPath = oneFortyRedirectPath;
  }

  return (
    <div>
      <div style={{ display: 'inline-block', margin: '0 0 20px 145px' }}>
        <Link to={redirectPath} className="btn custom-btn btn-primary btn-sm ms-3">Back</Link>
      </div>
    </div>
  );
};

export default BackButton;
