import React from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Home from './components/pages/Home'
import Services from './components/pages/Services';
import Products from './components/pages/Products';
import NFTCreate from './components/pages/NFTCreate';
import AddBatches from './components/pages/AddCollections';
import ApproveNFT from './components/pages/ApproveNFT';
import RedeemNFT from './components/pages/RedeemNFT';
import Faucet from './components/pages/Faucet';
import ViewNFT from './components/ViewNFT';

function App() {
  return (
    <>
    <Router>
      <Navbar />
      <Switch>
          <Route path='/' exact component={Home} />
          <Route path ='/Services' component={Services} />
          <Route path ='/Products' component={Products} />
          <Route path='/Create' component={NFTCreate} />
          <Route path='/Liquidity' component={AddBatches} />
          <Route path='/Approve' component={ApproveNFT} />
          <Route path='/Redeem' component={RedeemNFT} />
          <Route path='/Faucet' component={Faucet} />
          <Route path='/View' component={ViewNFT} />
      </Switch>
    </Router>     
    </>
  );
}

export default App;
