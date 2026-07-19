import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/layout/Layout'
import Forest from './pages/Forest'
import HabitDetail from './pages/HabitDetail'
import Journal from './pages/Journal'
import { useHabitStore } from './store/habitStore'

export default function App() {
  const fetchHabits = useHabitStore((s) => s.fetchHabits)
  const fetchStats = useHabitStore((s) => s.fetchStats)

  useEffect(() => {
    fetchHabits()
    fetchStats()
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Forest />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
        <Route path="/journal" element={<Journal />} />
      </Routes>
    </Layout>
  )
}
