'use client'
import { cn } from '@/lib/utilits'
import { useSidebar } from '@/store/use-slidebar'
import { useIsClient } from 'usehooks-ts'
import { ToggleSkeleton } from './toggle'
import { RecommendedSkeleton } from './recommeneded'
import { FollowingSkeleton } from './following'

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const isClient = useIsClient()
  const { collapsed } = useSidebar((state) => state)
  if (!isClient) {
    return (
      <aside className="fixed left-0 flex flex-col w-[70px] lg:w-60 h-full bg-background border-r border-[#2D2E35] z-50">
        <ToggleSkeleton />
        <FollowingSkeleton/>
        <RecommendedSkeleton />
      </aside>
    )
  }
  return (
    <aside
      className={cn(
        'fixed left-0 flex flex-col w-60 h-full bg-background border-r border-[#2D2E35] z-50',
        collapsed && 'w-[70px]',
      )}
    >
      {children}
    </aside>
  )
}

export default Wrapper