import {  UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {  LogOut } from 'lucide-react'

const Actions = async () => {
  const user = await currentUser()

  return (
    <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-primary"
        asChild
      >
        <Link href="/">
          <LogOut className="h-5 w-5 mr-2" />
          Exit
        </Link>
      </Button>
      <UserButton afterSwitchSessionUrl="/" />
    </div>
  )
}

export default Actions