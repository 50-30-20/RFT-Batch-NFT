import React from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import Home from './components/pages/Home'
import Services from './components/pages/Services';
import Products from './components/pages/Products';
import NFTCreate from './components/pages/NFTCreate';
import AddBatches from './components/pages/AddCollections';
import ViewCollectablePage from './components/pages/ViewCollectable';
import WithdrawNFT from './components/pages/Withdraw';
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
          <Route path='/Approve' component={ViewCollectablePage} />
          <Route path='/Redeem' component={WithdrawNFT} />
          <Route path='/Faucet' component={Faucet} />
          <Route path='/View' component={ViewNFT} />
      </Switch>
    </Router>     
    </>
  );
}

export default App;
