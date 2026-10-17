import { type ChangeEvent, useEffect, useState } from 'react'
import { BackendNotice } from '@/components/ui/BackendNotice'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function UploadStudioPage() {
  useDocumentTitle('Upload studio — ORBITAL')
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setPreview(null)
      setFileName(null)
      return
    }
    setFileName(file.name)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-mono text-xs tracking-[0.28em] text-cyan uppercase">Studio</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Upload studio</h1>
      <p className="mt-3 text-muted">
        Local file preview works in the browser. Nothing is uploaded — Storage is not connected.
      </p>

      <label className="glass-panel mt-8 block cursor-pointer rounded-3xl border-dashed p-8 text-center">
        <span className="font-display text-2xl">Drop a frame into the console</span>
        <p className="mt-2 text-sm text-muted">JPEG or PNG, local preview only.</p>
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} />
      </label>

      {preview ? (
        <figure className="mt-6 overflow-hidden rounded-3xl border border-line">
          <img src={preview} alt={`Local preview of ${fileName ?? 'selected file'}`} className="max-h-[28rem] w-full object-cover" />
          <figcaption className="px-4 py-3 font-mono text-xs text-muted">{fileName}</figcaption>
        </figure>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled title="Uploads require Supabase Storage">
          Publish to archive
        </Button>
        <p className="self-center text-sm text-muted">Publish is disabled until Storage exists.</p>
      </div>

      <div className="mt-8">
        <BackendNotice />
      </div>
    </div>
  )
}
