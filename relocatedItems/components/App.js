import React, { Component } from 'react';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import CreateHash from './IPFS/ipfs'
import Main from './Main'
import Home from './Home/home'

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Home />
        </div>
      </BrowserRouter>
    )
  }
}


export default App;
