import React from 'react'
// import { SignUp } from "@clerk/clerk-react"

function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-500px)] flex items-center justify-center px-4 overflow-auto" >
        <SignUp path="/sign-up" routing="path" signInUrl='/sign-in' />
    </div>
  )
}

export default SignUpPage