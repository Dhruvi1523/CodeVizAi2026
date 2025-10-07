import React from 'react'
// import { SignIn } from "@clerk/clerk-react"

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-auto">
        <SignIn path="/sign-in" routing="path"  signUpUrl="/sign-up"  />
    </div>
  )
}

export default SignInPage