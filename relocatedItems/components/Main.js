import Web3 from 'web3'
import React, { Component } from 'react'
import { Switch, Route, Redirect, withRouter } from 'react-router-dom'

import CreateHash from "./IPFS/ipfs";
import Home from "./Home/home";
import NavigationBar from "./Navigation/navigation"


class Main extends Component {

    async componentWillMount() { 
    }

    async loadWeb3() {     
    }

    async loadBlockchainData() {  
    }

    constructor(props) {
    }

    render() {
        return (
            <div>
                <NavigationBar />
                <Switch>
                    <Route path="/home" component={Home} />
                    <Route
                        path="/collectable"
                        component={CreateHash}
                    />
                    {/* <Route
                        path="/listing"
                        component={AllProducts}
                    />
                    <Route
                        path="/allBids"
                        component={AllBids}
                    />
                    <Route
                        path="/haultAuction"
                        component={HaltAuction}
                    />
                    <Route
                        path="/finishAuction"
                        component={FinishAuction}
                    />
                    <Route
                        path="/placeBid"
                        component={PlaceBid}
                    /> */}
                    <Redirect to="/home" />
                </Switch>
            </div>
        )
    }
}


export default withRouter(Main);