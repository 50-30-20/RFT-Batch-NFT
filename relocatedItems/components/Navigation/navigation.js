import React, { useState } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
} from 'reactstrap';

//import logo from '../logo.png';


const NavigationBar = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div>
            <Navbar className="navbar-colors" expand="md">
                <NavbarBrand className="navbar-colors" href="/">
                </NavbarBrand>
                <NavbarToggler className="navbar-toggler-colors" onClick={toggle} />
                <Collapse isOpen={isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <NavLink className="navbar-colors" href="/home">Home</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="navbar-colors" href="/listing">View auctions</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="navbar-colors" href="/host">Host auction</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="navbar-colors" href="/placeBid">Bid in auction</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="navbar-colors" href="/haultAuction">Hault auction</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="navbar-colors" href="/finishAuction">Close auction</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="navbar-colors" href="/allBids">View bids</NavLink>
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
        </div>
    );
}


export default NavigationBar;