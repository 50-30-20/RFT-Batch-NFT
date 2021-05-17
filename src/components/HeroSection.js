import React from 'react';
import '../App.css';
import { Button } from './Button';
import './HeroSection.css';



export default function HeroSection() {
    return (
        <div className='hero-container'>
            <video src='./videos/video-2.mp4' type='video/mp4' autoPlay loop muted />
            <h1> Refungible Diamonds</h1>
            <p>Adding Liquidity to Diamonds</p>  
            <div className="hero-btns">
                <Button className='btns' buttonStyle='btn--outline' buttonSize='btn--large'>GET STARTED
                </Button>
            </div>          
        </div>
    )
}
