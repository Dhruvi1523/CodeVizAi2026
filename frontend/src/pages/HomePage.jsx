import React from 'react'
import Navbar from '../components/Navbar'
import { useUser } from '@clerk/clerk-react';

function HomePage() {
   const {user} = useUser();
  return (
    <div>
        <Navbar />
        <p>Hello {user.fullName}</p>
    </div>
  )
}

export default HomePage