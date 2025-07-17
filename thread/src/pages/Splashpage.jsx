import React from 'react'
import splashlogo from '../assets/logosplash.png'
import metalogo from '../assets/metalogo.png'


const Splashpage = () => {
  return (
    <div className='w-screen h-screen'>
      <div className='h-5/6 flex justify-center items-center'    >
        <img src={splashlogo} className='w-20 h-20' />
      </div>
      <div className='flex flex-col justify-center items-center'>
        <h1 className='text-xl text-gray-400'>From</h1>
        <img src={metalogo} className='w-25 h-10' />
      </div>
    </div>
  )
}

export default Splashpage
