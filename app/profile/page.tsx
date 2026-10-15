import { redirect } from 'next/navigation'

// The profile, order history and impact dashboard now live under /account.
export default function ProfileRedirect() {
  redirect('/account')
}
