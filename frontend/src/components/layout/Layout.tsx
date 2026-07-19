import { type ReactNode } from 'react'
import BottomNav from './BottomNav'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-green-50/50 to-amber-50/30">
      <main className="pb-20 max-w-4xl mx-auto px-4 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
