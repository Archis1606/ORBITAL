import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { AuthProvider } from '@/context/AuthContext'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MotionConfig>
  )
}
