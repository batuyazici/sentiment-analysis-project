import React from 'react';
import Header from '../elements/Header';
import { Link } from 'react-router-dom';
import PmdQuery from '../elements/PmdQuery';
import PmdOperationList from '../elements/PmdOperationList';
import Footer from '../elements/Footer';
import '../assets/index.css';

const HomePmd = () => {
  return (
    <div>
<Link to="/" style={{ textDecoration: 'none' ,color:'var(--bs-heading-color,inherit)'}}>
  <Header />
</Link>
      <PmdQuery/>
      <div className="flex-grow-1 mt-1 mb-5">
        <PmdOperationList />
      </div>
      <Footer />  
    </div>
  );
};

export default HomePmd;
