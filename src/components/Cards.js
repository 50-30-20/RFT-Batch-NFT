import React from 'react'
import Carditem from './Carditem'
import './Cards.css'
import image2 from '../images/ark.jpeg'
//import image1 from '../images/img-1.jpg'
import image3 from '../images/d.jpeg'
import image4 from '../images/wJ.jpeg'
import image8 from '../images/d2.jpeg'
import image9 from '../images/d3.jpeg'

function Cards() {
    return (
        <div className='cards'>
          <h1>Check out these EPIC Destinations!</h1>
          <div className='cards__container'>
            <div className='cards__wrapper'>
              <ul className='cards__items'>
                <Carditem
                  src={image9}
                  text='Angels are like diamonds. They can’t be made. You have to find them. Each one is unique.'
                  label='Luxury'
                  path='/services'
                />
                <Carditem
                  src= {image2}
                  text='True friends are like diamonds – bright, beautiful, valuable, and always in style.'
                  label='Luxury'
                  path='/services'
                />
              </ul>
              <ul className='cards__items'>
                <Carditem
                  src={image3}
                  text='Diamonds never leave you...'
                  label='Luxury'
                  path='/services'
                />
                <Carditem
                  src={image4}
                  text='Life keeps throwing me stones. And I keep finding the diamonds...'
                  label='Luxury'
                  path='/products'
                />
                <Carditem
                  src={image8}
                  text='Let us not be too particular; it is better to have old secondhand diamonds than none at all'
                  label='Luxury'
                  path='/products'
                />
              </ul>
            </div>
          </div>
        </div>
      );
}

export default Cards;
