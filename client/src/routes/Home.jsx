import React from 'react'
import Header from '../elements/Header'
import '../assets/index.css';
import HomeBody from '../elements/HomeBody';
import Footer from '../elements/Footer';

const Home = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />  
      <div className="flex-grow-1">
        <HomeBody />
      </div>
      <Footer/>
    </div>
  );
}

export default Home