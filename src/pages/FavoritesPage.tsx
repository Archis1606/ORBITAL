import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  FolderPlus,
  Trash2,
  Lock,
  Globe,
  X,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PhotoGrid } from '@/components/ui/PhotoGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useAuth } from '@/context/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  getAllAvailablePhotos,
  getStoredCollections,
  saveUserCollection,
  deleteUserCollection,
} from '@/services/photoService'
import { disciplineLabel } from '@/lib/format'
import type { Collection, Discipline } from '@/types/models'

export function FavoritesPage() {
  useDocumentTitle('Favorites & Collections — ORBITAL')
  const { user } = useAuth()
  const { ids } = useFavorites()
  const allPhotos = getAllAvailablePhotos()

  const [collectionsList, setCollectionsList] = useState<Collection[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDiscipline, setNewDiscipline] = useState<Discipline | 'all'>('all')
  const [newIsPrivate, setNewIsPrivate] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  useEffect(() => {
    setCollectionsList(getStoredCollections())
  }, [])

  const savedPhotos = allPhotos.filter((photo) => ids.includes(photo.id))

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newCol: Collection = {
      id: 'col-' + Math.random().toString(36).substring(2, 9),
      userId: user?.id,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Curated observation sequence.',
      discipline: newDiscipline,
      photoIds: savedPhotos.slice(0, 3).map((p) => p.id), // seed with first few favorites if available
      isPrivate: newIsPrivate,
      sample: 'USER',
      createdAt: new Date().toISOString().split('T')[0],
    }

    saveUserCollection(newCol)
    setCollectionsList(getStoredCollections())
    setShowCreateModal(false)
    setNewTitle('')
    setNewDesc('')
    setNewIsPrivate(false)
  }

  const handleDeleteCollection = (id: string) => {
    deleteUserCollection(id)
    setCollectionsList(getStoredCollections())
    if (selectedCollection?.id === id) {
      setSelectedCollection(null)
    }
  }

  const collectionPhotos = selectedCollection
    ? allPhotos.filter((p) => selectedCollection.photoIds.includes(p.id))
    : []

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-16">
      <SectionHeader
        as="h1"
        kicker="Community & Curation"
        title="Favorites & Collections"
        description="Persisted in local browser storage and synchronized with your authenticated Supabase profile. Curate custom observational sequences and revisit favorite frames."
      />

      {/* Saved Favorites Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-line/60 pb-4">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-danger fill-danger" />
            <h2 className="font-display text-2xl text-ivory">Saved Favorites ({savedPhotos.length})</h2>
          </div>

          <Link
            to="/archive"
            className="inline-flex items-center gap-1 font-mono text-xs text-cyan hover:underline"
          >
            <span>Browse more frames</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {savedPhotos.length === 0 ? (
          <EmptyState
            title="No saved favorites yet"
            body="Explore the photography archive or telescope feeds and click the heart icon on any frame to add it to your ledger."
          />
        ) : (
          <PhotoGrid photos={savedPhotos} />
        )}
      </section>

      {/* Collections Management Section */}
      <section className="border-t border-line/60 pt-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-cyan uppercase">Observatory Portfolios</p>
            <h2 className="mt-1 font-display text-2xl text-ivory">Curated Sequences ({collectionsList.length})</h2>
          </div>

          <Button onClick={() => setShowCreateModal(true)}>
            <FolderPlus size={14} />
            <span>Create New Collection</span>
          </Button>
        </div>

        {/* Selected Collection Inspector if active */}
        {selectedCollection ? (
          <div className="glass-panel rounded-3xl border border-cyan/40 p-6 space-y-4 bg-navy/80">
            <div className="flex items-start justify-between gap-4 border-b border-line/50 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={selectedCollection.discipline === 'all' ? 'neutral' : selectedCollection.discipline}>
                    {selectedCollection.discipline === 'all'
                      ? 'All Disciplines'
                      : disciplineLabel(selectedCollection.discipline)}
                  </Badge>
                  {selectedCollection.isPrivate ? (
                    <span className="flex items-center gap-1 font-mono text-[0.65rem] text-muted">
                      <Lock size={11} /> Private Collection
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-mono text-[0.65rem] text-cyan">
                      <Globe size={11} /> Public Portfolio
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-3xl text-ivory">{selectedCollection.title}</h3>
                <p className="mt-1 text-sm text-muted">{selectedCollection.description}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCollection(null)}
                className="rounded-full border border-line p-1.5 text-muted hover:text-ivory"
                title="Close collection inspector"
              >
                <X size={16} />
              </button>
            </div>

            {/* Photos inside this collection */}
            <div>
              <p className="font-mono text-xs text-muted mb-4 uppercase tracking-wider">
                Frames in Sequence ({collectionPhotos.length})
              </p>
              {collectionPhotos.length === 0 ? (
                <p className="text-xs font-mono text-muted py-6 text-center">
                  This collection has no photos assigned yet. Favorite frames or add them from the archive.
                </p>
              ) : (
                <PhotoGrid photos={collectionPhotos} />
              )}
            </div>
          </div>
        ) : null}

        {/* Collections Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {collectionsList.map((col) => (
            <article
              key={col.id}
              className="glass-panel group relative rounded-3xl border border-line p-6 hover:border-cyan/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={col.discipline === 'all' ? 'neutral' : col.discipline}>
                      {col.discipline === 'all'
                        ? 'All Disciplines'
                        : disciplineLabel(col.discipline)}
                    </Badge>
                    {col.isPrivate ? (
                      <span className="flex items-center gap-1 font-mono text-[0.65rem] text-muted">
                        <Lock size={10} /> Private
                      </span>
                    ) : null}
                  </div>

                  {col.sample === 'USER' ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteCollection(col.id)}
                      className="text-muted hover:text-danger p-1"
                      title="Delete collection"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : null}
                </div>

                <h3 className="mt-4 font-display text-2xl text-ivory group-hover:text-cyan transition-colors">
                  {col.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{col.description}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-line/50 pt-4 font-mono text-xs text-muted">
                <span>{col.photoIds.length} frames sequence</span>
                <button
                  type="button"
                  onClick={() => setSelectedCollection(col)}
                  className="text-cyan hover:underline inline-flex items-center gap-1"
                >
                  <span>Inspect Sequence</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Create Collection Modal */}
      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/85 p-4 backdrop-blur-md">
          <form
            onSubmit={handleCreateCollection}
            className="relative w-full max-w-lg rounded-3xl border border-line bg-navy p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h3 className="font-display text-xl text-ivory">Create New Collection</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full border border-line p-1 text-muted hover:text-ivory"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Collection Title *
              </label>
              <input
                required
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Deep Sky Narrowband Night"
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ivory focus:border-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Editorial context or sequence notes..."
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ivory focus:border-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1">
                Discipline Focus
              </label>
              <select
                value={newDiscipline}
                onChange={(e) => setNewDiscipline(e.target.value as Discipline | 'all')}
                className="w-full rounded-xl border border-line bg-panel px-3 py-2 text-xs font-mono text-ivory focus:border-cyan focus:outline-none"
              >
                <option value="all">All Disciplines</option>
                <option value="astrophotography">Astrophotography</option>
                <option value="aviation">Aviation</option>
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-line/60 bg-panel/50 p-3 font-mono text-xs">
              <div>
                <p className="text-ivory font-medium">Keep Collection Private</p>
                <p className="text-[0.68rem] text-muted">
                  Only visible to your authenticated account.
                </p>
              </div>
              <input
                type="checkbox"
                checked={newIsPrivate}
                onChange={(e) => setNewIsPrivate(e.target.checked)}
                className="h-4 w-4 rounded border-line accent-cyan cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-line/60">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Collection</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
