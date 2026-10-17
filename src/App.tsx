import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  )
}
