import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Sparkles,
  Plane,
  Telescope,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { BackendNotice } from '@/components/ui/BackendNotice'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  getLocalUserPhotos,
  saveLocalUserPhoto,
  deleteLocalUserPhoto,
} from '@/services/photoService'
import type { Discipline, Photo } from '@/types/models'
import { cn } from '@/lib/cn'

interface QueuedPhoto {
  id: string
  file: File
  previewUrl: string
  fileName: string
  fileSize: number
  width: number
  height: number
  status: 'ready' | 'uploading' | 'published' | 'draft' | 'error'
  progress: number
  error?: string

  // Common metadata
  title: string
  caption: string
  discipline: Discipline
  categoryTag: string
  capturedAt: string
  camera: string
  optics: string
  exposure: string
  license: string
  visibility: 'published' | 'draft' | 'private'
  locationName: string
  allowLocationSharing: boolean

  // Astro metadata
  astroTarget: string
  astroTelescope: string
  astroMount: string
  astroFilters: string
  astroIntegration: string
  astroBortle: number
  astroNotes: string

  // Aviation metadata
  aviationAircraftType: string
  aviationManufacturer: string
  aviationAirline: string
  aviationAirportCode: string
  aviationRegistration: string
  aviationConditions: string
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function UploadStudioPage() {
  useDocumentTitle('Creator Studio — ORBITAL')
  const { user, profile } = useAuth()
  const isConfigured = isSupabaseConfigured()

  const [queue, setQueue] = useState<QueuedPhoto[]>([])
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [userPhotos, setUserPhotos] = useState<Photo[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing uploaded user photos
  useEffect(() => {
    setUserPhotos(getLocalUserPhotos())
  }, [])

  const activeItem = queue.find((q) => q.id === activeQueueId) || queue[0] || null

  // Validate and enqueue files
  const processFiles = (files: FileList | File[]) => {
    setGlobalError(null)
    const newItems: QueuedPhoto[] = []

    Array.from(files).forEach((file) => {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setGlobalError(`File "${file.name}" has an unsupported format. Please use JPEG, PNG, or WebP.`)
        return
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setGlobalError(`File "${file.name}" exceeds the 25MB size limit.`)
        return
      }

      // Check duplicates
      if (queue.some((item) => item.fileName === file.name && item.fileSize === file.size)) {
        return // skip duplicate
      }

      const id = 'upload-' + Math.random().toString(36).substring(2, 9)
      const previewUrl = URL.createObjectURL(file)

      // Load image dimensions
      const img = new Image()
      img.src = previewUrl
      img.onload = () => {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, width: img.naturalWidth, height: img.naturalHeight } : item,
          ),
        )
      }

      const defaultTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

      newItems.push({
        id,
        file,
        previewUrl,
        fileName: file.name,
        fileSize: file.size,
        width: 1920,
        height: 1080,
        status: 'ready',
        progress: 0,
        title: defaultTitle,
        caption: '',
        discipline: 'astrophotography',
        categoryTag: 'Nebulae',
        capturedAt: new Date().toISOString().split('T')[0],
        camera: '',
        optics: '',
        exposure: '',
        license: 'All Rights Reserved',
        visibility: 'published',
        locationName: '',
        allowLocationSharing: false,
        astroTarget: '',
        astroTelescope: '',
        astroMount: '',
        astroFilters: '',
        astroIntegration: '',
        astroBortle: 2,
        astroNotes: '',
        aviationAircraftType: 'Commercial Widebody',
        aviationManufacturer: 'Boeing',
        aviationAirline: '',
        aviationAirportCode: '',
        aviationRegistration: '',
        aviationConditions: '',
      })
    })

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems])
      if (!activeQueueId) {
        setActiveQueueId(newItems[0].id)
      }
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      if (activeQueueId === id) {
        setActiveQueueId(filtered[0]?.id || null)
      }
      return filtered
    })
  }

  // Update field on active item
  const updateActiveField = <K extends keyof QueuedPhoto>(key: K, value: QueuedPhoto[K]) => {
    if (!activeItem) return
    setQueue((prev) =>
      prev.map((item) => (item.id === activeItem.id ? { ...item, [key]: value } : item)),
    )
  }

  // Publish active photo
  const handlePublish = async (asDraft = false) => {
    if (!activeItem) return

    // Update status to uploading
    setQueue((prev) =>
      prev.map((item) => (item.id === activeItem.id ? { ...item, status: 'uploading', progress: 30 } : item)),
    )

    let finalImageUrl = activeItem.previewUrl
    let storagePath: string | null = null

    // If Supabase Storage is configured, upload to 'photos' bucket
    if (isConfigured && user) {
      try {
        const fileExt = activeItem.fileName.split('.').pop()
        storagePath = `${user.id}/${activeItem.id}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(storagePath, activeItem.file, { upsert: true })

        if (!uploadError) {
          const { data } = supabase.storage.from('photos').getPublicUrl(storagePath)
          if (data?.publicUrl) finalImageUrl = data.publicUrl
        }
        setQueue((prev) =>
          prev.map((item) => (item.id === activeItem.id ? { ...item, progress: 75 } : item)),
        )
      } catch {
        // Fall back to local URL
      }
    }

    // Build Photo object
    const newPhoto: Photo = {
      id: activeItem.id,
      userId: user?.id,
      title: activeItem.title || 'Untitled Observation',
      discipline: activeItem.discipline,
      caption: activeItem.caption,
      categoryTag: activeItem.categoryTag,
      tags: [activeItem.categoryTag, activeItem.discipline],
      location: activeItem.locationName || 'Unspecified Observation Vantage',
      capturedAt: activeItem.capturedAt,
      camera: activeItem.camera || 'Standard Sensor',
      optics: activeItem.optics || 'Optical Assembly',
      exposure: activeItem.exposure || 'N/A',
      creatorId: profile?.handle || user?.id || 'creator-nova-ellison',
      unsplashId: '',
      customImageUrl: finalImageUrl,
      imageAlt: activeItem.title,
      width: activeItem.width,
      height: activeItem.height,
      featured: false,
      sample: 'USER',
      likesCount: 0,
      viewsCount: 1,
      status: asDraft ? 'draft' : 'published',
      license: activeItem.license,
      locationCoordinates: activeItem.allowLocationSharing
        ? { latitude: 35.0, longitude: -115.0, allowLocationSharing: true }
        : undefined,
      exif: {
        camera: activeItem.camera,
        lens: activeItem.optics,
        exposure: activeItem.exposure,
      },
      astro:
        activeItem.discipline === 'astrophotography'
          ? {
              target: activeItem.astroTarget,
              telescope: activeItem.astroTelescope,
              mount: activeItem.astroMount,
              filters: activeItem.astroFilters,
              exposureIntegration: activeItem.astroIntegration,
              bortleClass: activeItem.astroBortle,
              processingNotes: activeItem.astroNotes,
            }
          : undefined,
      aviation:
        activeItem.discipline === 'aviation'
          ? {
              aircraftType: activeItem.aviationAircraftType,
              manufacturer: activeItem.aviationManufacturer,
              airline: activeItem.aviationAirline,
              airportCode: activeItem.aviationAirportCode,
              registration: activeItem.aviationRegistration,
              flightConditions: activeItem.aviationConditions,
            }
          : undefined,
    }

    // Save to Supabase DB if configured
    if (isConfigured && user) {
      try {
        await supabase.from('photos').insert({
          id: newPhoto.id,
          user_id: user.id,
          title: newPhoto.title,
          caption: newPhoto.caption,
          discipline: newPhoto.discipline,
          category_tag: newPhoto.categoryTag || null,
          tags: newPhoto.tags,
          storage_path: storagePath,
          image_url: finalImageUrl,
          width: newPhoto.width,
          height: newPhoto.height,
          camera: newPhoto.camera,
          optics: newPhoto.optics,
          exposure: newPhoto.exposure,
          captured_at: newPhoto.capturedAt,
          location_name: newPhoto.location,
          status: newPhoto.status,
          license: newPhoto.license,
        } as unknown as never)
      } catch {
        // Fallback to local
      }
    }

    // Save to local storage for immediate accessibility
    saveLocalUserPhoto(newPhoto)
    setUserPhotos(getLocalUserPhotos())

    setQueue((prev) =>
      prev.map((item) =>
        item.id === activeItem.id
          ? { ...item, status: asDraft ? 'draft' : 'published', progress: 100 }
          : item,
      ),
    )
  }

  const handleDeletePhoto = (id: string) => {
    deleteLocalUserPhoto(id)
    setUserPhotos(getLocalUserPhotos())
    setDeleteConfirmId(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
            <p className="font-mono text-xs tracking-[0.28em] text-cyan uppercase">ORBITAL Creative Suite</p>
          </div>
          <h1 className="mt-2 font-display text-4xl text-ivory md:text-5xl">Creator Studio</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            High-precision publishing pipeline for observational photography. Configure optical telemetry,
            verified aircraft specifications, and privacy settings before deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button to="/archive" variant="line">
            Browse Archive
          </Button>
        </div>
      </div>

      {globalError ? (
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-xs font-mono text-danger">
          <AlertCircle size={16} />
          <span>{globalError}</span>
        </div>
      ) : null}

      {/* Main Studio Two-Column Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        {/* Left Column: Drag & Drop Zone + Upload Queue */}
        <div className="space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'glass-panel relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300',
              isDragging
                ? 'border-cyan bg-cyan/10 scale-[1.01]'
                : 'border-line/70 hover:border-cyan/50 hover:bg-navy/60',
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-navy text-cyan mb-4 shadow-lg">
              <UploadCloud size={26} />
            </div>

            <p className="font-display text-2xl text-ivory">Drop raw or master frames here</p>
            <p className="mt-1 font-mono text-xs text-muted">
              Select multiple files (JPEG, PNG, WebP up to 25MB each)
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/15 px-4 py-1.5 font-mono text-xs text-cyan">
              Choose files from device
            </span>
          </div>

          {/* Upload Queue List */}
          {queue.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs text-muted">
                <span>STAGED FRAMES ({queue.length})</span>
                <button
                  type="button"
                  onClick={() => setQueue([])}
                  className="text-danger hover:underline text-[0.7rem]"
                >
                  Clear queue
                </button>
              </div>

              <div className="space-y-2 max-h-[30rem] overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveQueueId(item.id)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all',
                      activeItem?.id === item.id
                        ? 'border-cyan bg-cyan/10 shadow-md'
                        : 'border-line bg-panel/70 hover:border-line/80',
                    )}
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.title}
                      className="h-12 w-12 rounded-xl object-cover border border-line"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-ivory truncate">{item.title || item.fileName}</p>
                      <div className="flex items-center gap-2 font-mono text-[0.65rem] text-muted">
                        <span>{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span className="capitalize">{item.discipline}</span>
                        {item.status === 'published' ? (
                          <span className="text-mint font-semibold">• PUBLISHED</span>
                        ) : item.status === 'draft' ? (
                          <span className="text-cyan">• DRAFT</span>
                        ) : null}
                      </div>

                      {/* Progress bar if uploading */}
                      {item.status === 'uploading' ? (
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full bg-cyan transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeItem(item.id)
                      }}
                      className="rounded-full p-1.5 text-muted hover:text-danger"
                      title="Remove from queue"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Backend Connection Status Banner */}
          <BackendNotice />
        </div>

        {/* Right Column: Frame Metadata Editor */}
        {activeItem ? (
          <div className="glass-panel rounded-3xl border border-line p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-line/60 pb-4">
              <div>
                <p className="font-mono text-xs text-cyan tracking-wider uppercase">Frame Editor</p>
                <h2 className="font-display text-2xl text-ivory mt-0.5">Metadata & Telemetry</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-ivory hover:border-cyan hover:text-cyan transition-colors"
                >
                  <Eye size={13} />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Discipline Selector */}
            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-2">
                Discipline Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateActiveField('discipline', 'astrophotography')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-2xl border p-3 font-mono text-xs transition-all',
                    activeItem.discipline === 'astrophotography'
                      ? 'border-violet bg-violet/15 text-violet font-semibold shadow-[0_0_15px_rgba(155,140,255,0.2)]'
                      : 'border-line text-muted hover:text-ivory',
                  )}
                >
                  <Telescope size={15} />
                  <span>Astrophotography</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateActiveField('discipline', 'aviation')}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-2xl border p-3 font-mono text-xs transition-all',
                    activeItem.discipline === 'aviation'
                      ? 'border-mint bg-mint/15 text-mint font-semibold shadow-[0_0_15px_rgba(143,217,196,0.2)]'
                      : 'border-line text-muted hover:text-ivory',
                  )}
                >
                  <Plane size={15} />
                  <span>Aviation</span>
                </button>
              </div>
            </div>

            {/* Title & Caption */}
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1.5">
                  Photograph Title *
                </label>
                <input
                  type="text"
                  required
                  value={activeItem.title}
                  onChange={(e) => updateActiveField('title', e.target.value)}
                  placeholder="e.g. Andromeda Nebula Dust Lanes"
                  className="w-full rounded-2xl border border-line bg-navy px-4 py-2.5 text-sm text-ivory placeholder:text-muted/40 focus:border-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-muted uppercase tracking-wider mb-1.5">
                  Observational Caption & Processing Notes
                </label>
                <textarea
                  rows={2}
                  value={activeItem.caption}
                  onChange={(e) => updateActiveField('caption', e.target.value)}
                  placeholder="Document atmospheric conditions, filter passes, or flight conditions..."
                  className="w-full rounded-2xl border border-line bg-navy px-4 py-2.5 text-sm text-ivory placeholder:text-muted/40 focus:border-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Common Optics & Camera Specs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[0.68rem] text-muted uppercase tracking-wider mb-1">
                  Camera Body / Sensor
                </label>
                <input
                  type="text"
                  value={activeItem.camera}
                  onChange={(e) => updateActiveField('camera', e.target.value)}
                  placeholder="e.g. Cooled CMOS Mono"
                  className="w-full rounded-xl border border-line bg-navy px-3 py-2 text-xs font-mono text-ivory focus:border-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[0.68rem] text-muted uppercase tracking-wider mb-1">
                  Lens / Telescope Optics
                </label>
                <input
                  type="text"
                  value={activeItem.optics}
                  onChange={(e) => updateActiveField('optics', e.target.value)}
                  placeholder="e.g. 80mm Triplet APO"
                  className="w-full rounded-xl border border-line bg-navy px-3 py-2 text-xs font-mono text-ivory focus:border-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[0.68rem] text-muted uppercase tracking-wider mb-1">
                  Exposure / Integration
                </label>
                <input
                  type="text"
                  value={activeItem.exposure}
                  onChange={(e) => updateActiveField('exposure', e.target.value)}
                  placeholder="e.g. 40 × 120s · ISO 800"
                  className="w-full rounded-xl border border-line bg-navy px-3 py-2 text-xs font-mono text-ivory focus:border-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[0.68rem] text-muted uppercase tracking-wider mb-1">
                  Date of Capture
                </label>
                <input
                  type="date"
                  value={activeItem.capturedAt}
                  onChange={(e) => updateActiveField('capturedAt', e.target.value)}
                  className="w-full rounded-xl border border-line bg-navy px-3 py-2 text-xs font-mono text-ivory focus:border-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Astrophotography Specific Fields */}
            {activeItem.discipline === 'astrophotography' ? (
              <div className="rounded-2xl border border-violet/30 bg-violet/5 p-4 space-y-3">
                <p className="font-mono text-xs text-violet tracking-wider uppercase font-semibold flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Astrophotography Target & Mount</span>
                </p>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Target Object</label>
                    <input
                      type="text"
                      value={activeItem.astroTarget}
                      onChange={(e) => updateActiveField('astroTarget', e.target.value)}
                      placeholder="e.g. Messier 31"
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-violet focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Tracking Mount</label>
                    <input
                      type="text"
                      value={activeItem.astroMount}
                      onChange={(e) => updateActiveField('astroMount', e.target.value)}
                      placeholder="e.g. Harmonic Drive AM5"
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-violet focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Optical Filters</label>
                    <input
                      type="text"
                      value={activeItem.astroFilters}
                      onChange={(e) => updateActiveField('astroFilters', e.target.value)}
                      placeholder="e.g. 3nm H-alpha, OIII"
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-violet focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Bortle Scale (1-9)</label>
                    <select
                      value={activeItem.astroBortle}
                      onChange={(e) => updateActiveField('astroBortle', Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-violet focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((b) => (
                        <option key={b} value={b}>
                          Class {b} ({b <= 2 ? 'Excellent Dark-Sky' : b <= 4 ? 'Rural' : 'Suburban/Urban'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Aviation Specific Fields */}
            {activeItem.discipline === 'aviation' ? (
              <div className="rounded-2xl border border-mint/30 bg-mint/5 p-4 space-y-3">
                <p className="font-mono text-xs text-mint tracking-wider uppercase font-semibold flex items-center gap-1.5">
                  <Plane size={13} />
                  <span>Aviation Airframe & Operations</span>
                </p>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Aircraft Type</label>
                    <input
                      type="text"
                      value={activeItem.aviationAircraftType}
                      onChange={(e) => updateActiveField('aviationAircraftType', e.target.value)}
                      placeholder="e.g. Boeing 777-300ER"
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-mint focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Manufacturer</label>
                    <input
                      type="text"
                      value={activeItem.aviationManufacturer}
                      onChange={(e) => updateActiveField('aviationManufacturer', e.target.value)}
                      placeholder="e.g. Boeing, Airbus"
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-mint focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Airline / Carrier</label>
                    <input
                      type="text"
                      value={activeItem.aviationAirline}
                      onChange={(e) => updateActiveField('aviationAirline', e.target.value)}
                      placeholder="e.g. Cathay Pacific"
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-mint focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Airport Code (IATA/ICAO)</label>
                    <input
                      type="text"
                      value={activeItem.aviationAirportCode}
                      onChange={(e) => updateActiveField('aviationAirportCode', e.target.value.toUpperCase())}
                      placeholder="e.g. HKG or VHHH"
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-mint focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Tail Registration (Optional)</label>
                    <input
                      type="text"
                      value={activeItem.aviationRegistration}
                      onChange={(e) => updateActiveField('aviationRegistration', e.target.value.toUpperCase())}
                      placeholder="e.g. B-KPM"
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-mint focus:outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[0.68rem] text-muted uppercase">Operating Conditions</label>
                    <input
                      type="text"
                      value={activeItem.aviationConditions}
                      onChange={(e) => updateActiveField('aviationConditions', e.target.value)}
                      placeholder="e.g. Night ramp drizzle"
                      className="mt-1 w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-mint focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Privacy & Location Sharing */}
            <div className="rounded-2xl border border-line/60 bg-panel/40 p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ivory font-medium">Location Privacy Preference</p>
                  <p className="text-[0.68rem] text-muted mt-0.5">
                    Never reveal private GPS coordinates or sensitive EXIF unless explicitly enabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={activeItem.allowLocationSharing}
                  onChange={(e) => updateActiveField('allowLocationSharing', e.target.checked)}
                  className="h-4 w-4 rounded border-line accent-cyan cursor-pointer"
                />
              </div>

              {activeItem.allowLocationSharing ? (
                <div>
                  <label className="block text-[0.68rem] text-muted uppercase mb-1">
                    Location Name / Landmark
                  </label>
                  <input
                    type="text"
                    value={activeItem.locationName}
                    onChange={(e) => updateActiveField('locationName', e.target.value)}
                    placeholder="e.g. High Desert Overlook, CA"
                    className="w-full rounded-xl border border-line bg-navy px-3 py-1.5 text-xs text-ivory focus:border-cyan focus:outline-none"
                  />
                </div>
              ) : null}
            </div>

            {/* Publication Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePublish(false)}
                  disabled={activeItem.status === 'uploading'}
                >
                  <UploadCloud size={15} />
                  <span>Publish to Archive</span>
                </Button>
                <Button
                  variant="line"
                  onClick={() => handlePublish(true)}
                  disabled={activeItem.status === 'uploading'}
                >
                  Save as Draft
                </Button>
              </div>

              {activeItem.status === 'published' ? (
                <div className="flex items-center gap-1.5 font-mono text-xs text-mint">
                  <CheckCircle2 size={15} />
                  <span>Published to Archive!</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="glass-panel flex flex-col items-center justify-center rounded-3xl border border-line p-12 text-center text-muted">
            <Layers size={36} className="text-muted/40 mb-3" />
            <p className="font-display text-xl text-ivory">No Frame Selected</p>
            <p className="mt-1 font-mono text-xs">
              Drag or choose files into the upload zone to start metadata enrichment.
            </p>
          </div>
        )}
      </div>

      {/* Published / Stored Photos Management Section */}
      {userPhotos.length > 0 ? (
        <section className="mt-16 border-t border-line/60 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono text-xs tracking-wider text-cyan uppercase">Repository</p>
              <h2 className="font-display text-3xl text-ivory">My Published Frames ({userPhotos.length})</h2>
            </div>
            <Link to="/archive" className="font-mono text-xs text-cyan hover:underline flex items-center gap-1">
              <span>View live in main archive</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {userPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl border border-line bg-panel p-3"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-navy-deep">
                  <img
                    src={photo.customImageUrl || `https://images.unsplash.com/${photo.unsplashId}?w=600`}
                    alt={photo.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-base text-ivory truncate">{photo.title}</p>
                    <p className="font-mono text-[0.65rem] text-muted capitalize">
                      {photo.discipline} · {photo.status}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(photo.id)}
                    className="rounded-full p-1.5 text-muted hover:text-danger hover:bg-danger/10"
                    title="Delete photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {deleteConfirmId === photo.id ? (
                  <div className="absolute inset-0 bg-void/95 p-4 flex flex-col justify-center text-center backdrop-blur-md rounded-2xl">
                    <p className="font-display text-sm text-ivory">Confirm Deletion?</p>
                    <p className="font-mono text-[0.65rem] text-muted mt-1">
                      This will remove the photo from your catalog.
                    </p>
                    <div className="mt-3 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="rounded-full bg-danger px-3 py-1 font-mono text-[0.68rem] text-white"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-full border border-line px-3 py-1 font-mono text-[0.68rem] text-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Live Preview Modal */}
      {showPreviewModal && activeItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 p-4 backdrop-blur-lg">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-line bg-navy p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h3 className="font-display text-xl text-ivory">Catalog Frame Preview</h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-full border border-line p-1 text-muted hover:text-ivory"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-navy-deep">
              <img
                src={activeItem.previewUrl}
                alt={activeItem.title}
                className="max-h-[24rem] w-full object-contain"
              />
            </div>

            <div className="mt-4 space-y-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Badge tone={activeItem.discipline}>{activeItem.discipline}</Badge>
                <span className="text-cyan font-bold">{activeItem.title}</span>
              </div>
              <p className="text-muted font-sans text-sm">{activeItem.caption}</p>
              <div className="grid grid-cols-2 gap-2 text-[0.7rem] text-muted pt-2 border-t border-line/40">
                <p>Camera: <span className="text-ivory">{activeItem.camera || 'Unspecified'}</span></p>
                <p>Optics: <span className="text-ivory">{activeItem.optics || 'Unspecified'}</span></p>
                <p>Exposure: <span className="text-ivory">{activeItem.exposure || 'Unspecified'}</span></p>
                <p>License: <span className="text-ivory">{activeItem.license}</span></p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowPreviewModal(false)}>Close Preview</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
