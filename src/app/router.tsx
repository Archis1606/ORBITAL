import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ArchivePage } from '@/pages/ArchivePage'
import { AstrophotographyPage } from '@/pages/AstrophotographyPage'
import { AuthPage } from '@/pages/AuthPage'
import { AviationPage } from '@/pages/AviationPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PhotoDetailPage } from '@/pages/PhotoDetailPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { UploadStudioPage } from '@/pages/UploadStudioPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'archive', element: <ArchivePage /> },
      { path: 'astrophotography', element: <AstrophotographyPage /> },
      { path: 'aviation', element: <AviationPage /> },
      { path: 'photos/:photoId', element: <PhotoDetailPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'creators/:handle', element: <ProfilePage /> },
      { path: 'studio', element: <UploadStudioPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
