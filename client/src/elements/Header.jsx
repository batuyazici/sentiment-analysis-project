import React from 'react';
import Logo from '../assets/worm.webp';
const Header = () => {

  return (
    <div style={{margin: '0'}}>

        <h1 className="font-weight-light display-1 text-center"> Sentiment Worm <img src={Logo} alt="Logo" style={{ width: '100px', height: 'auto', margin: '10px' }} />
      </h1>
      <div></div>
    </div>
  )
}

export default Header