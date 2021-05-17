import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom';
import { Button } from './Button';
import './Navbar.css';

function Navbar() {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);

    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);

    const showButton = () => {
        if(Window.innerWidth <= 960) {
            setButton(false)
        } else {
            setButton(true)
        }
    };

    useEffect(()=> {
        showButton()
    })

    window.addEventListener('resize', showButton);

    return (
        <>
            <nav className='navbar'>
                <div className='navbar-container'>
                    <Link to="/" className='navbar-logo' onClick={closeMobileMenu} >
                        DIAMOND <i className='fab fa-typo3'></i>
                    </Link>
                    <div className='menu-icon' onClick={handleClick}>
                        <i className={click ? 'fas fa-times': 'fas fa-bars'} />
                    </div>
                    <ul className={click ? 'nav-menu active': 'nav-menu' }>
                        <li className='nav-item'>
                            <Link to='/Liquidity' className='nav-links' onClick={closeMobileMenu}>
                                Add Liquidity
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to='/Redeem' className='nav-links' onClick={closeMobileMenu}>
                                Reedem NFT
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to='/Approve' className='nav-links' onClick={closeMobileMenu}>
                                Approve NFT
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link to='/Faucet' className='nav-links' onClick={closeMobileMenu}>
                                Faucet
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
