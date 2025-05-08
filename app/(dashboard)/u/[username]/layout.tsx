import { getSelfByUsername } from '@/lib/auth-service'
import { redirect } from 'next/navigation'
import Navbar from './_components/navbar'
import Sidebar from './_components/sidebar'
import Container from './_components/container'

interface CreatorLayoutProps {
  children: React.ReactNode
  params: Promise<{ username: string }> // <- Fix: awaitable params
}

const CreatorLayout = async ({ children, params }: CreatorLayoutProps) => {
  const resolvedParams = await params // <- Await the params

  // Optional: debug log
  console.log('Resolved params:', resolvedParams)

  const self = await getSelfByUsername(resolvedParams.username)
  if (!self) {
    redirect('/')
  }

  return (
    <>
      <Navbar />
      <div className="flex h-full pt-20">
        <Sidebar />
        <Container>{children}</Container>
      </div>
    </>
  )
}

export default CreatorLayout
