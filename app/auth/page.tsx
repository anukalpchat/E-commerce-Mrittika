import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'Sign In / Register' }

export default function AuthPage() {
  return (
    <PlaceholderPage
      title="Sign In / Register"
      description="User authentication — login for returning users, and registration for new buyers. Separate vendor registration flow at /vendor/register."
      sections={[
        { title: 'Sign In', description: 'Email + password login with "Forgot password" link.' },
        { title: 'Register', description: 'New buyer account: name, email, phone, password. Minimum age 18 check.' },
        { title: 'T&C Acceptance', description: 'Mandatory T&C checkbox at registration (click-wrap, separate from vendor acceptance).' },
        { title: 'Social Auth', description: 'Optional Google / phone OTP sign-in (planned for later sprint).' },
      ]}
    />
  )
}
