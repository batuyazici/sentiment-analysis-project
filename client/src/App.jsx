import React from 'react';
import HomeTwitter from './routes/HomeTwitter';
import Home from './routes/Home';
import HomePmd from './routes/HomePmd';
import TwitterMonitor from './routes/TwitterMonitor';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OperationContextProvider } from './context/OperationContext';
import PmdMonitor from './routes/PmdMonitor';


const App = () => {
    return (
    <OperationContextProvider>
        <div>
        <Router>
            <Routes>
                 <Route exact path ="/"  element= {<Home/>}/>
                 <Route exact path ="/twitter"  element= {<HomeTwitter/>}/>
                 <Route exact path ="/pmd"  element= {<HomePmd/>}/>
                 <Route exact path ="/twitter/monitor/:id"  element= {<TwitterMonitor/>}/>
                 <Route exact path ="/pmd/monitor/:id"  element= {<PmdMonitor/>}/>
             </Routes>
        </Router>
        </div>
    </OperationContextProvider>
);
}

export default App;