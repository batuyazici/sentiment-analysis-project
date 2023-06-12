import React from 'react'
import Header from '../elements/Header';
import OperationList from '../elements/OperationList';
import Footer from '../elements/Footer';
import '../assets/index.css';
import Query from '../elements/Query';
import { Link } from 'react-router-dom';
const HomeTwitter = () => {
  return (
    <div>
<Link to="/" style={{ textDecoration: 'none' ,color:'var(--bs-heading-color,inherit)'}}>
  <Header />
</Link>
        <Query/>
        <div className="flex-grow-1 mt-1 mb-5">
        <OperationList/>
        </div>
        <Footer/>
    </div>
  )
}

export default HomeTwitter