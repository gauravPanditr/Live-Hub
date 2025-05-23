'use client'

import { cn } from '@/lib/utilits'
import { useCreatorSidebar } from '@/store/use-creator-slidebar'
interface WrapperProps {
  children: React.ReactNode
}

export const Wrapper = ({ children }: WrapperProps) => {
  const { collapsed } = useCreatorSidebar((state) => state)
  return (
    <aside
      className={cn(
        'flex left-0 fixed flex-col w-[70px] lg:w-60 h-full bg-background border-r border-[#2D2E35] z-50',
        collapsed && 'lg:w-[70px]',
      )}
    >
      {children}
    </aside>
  )
}