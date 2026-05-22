"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Image, Film, FileText, Music, Lock } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    description: "",
    contentType: "image",
    priceUsdc: "",
    tags: "",
    previewUrl: "",
    fileUrl: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const priceBaseUnits = Math.floor(parseFloat(form.priceUsdc || "0") * 1_000_000)
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean)

      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          content_type: form.contentType,
          price_usdc: priceBaseUnits,
          tags,
          preview_url: form.previewUrl || undefined,
          file_url: form.fileUrl || undefined,
          is_published: true,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }

      const data = await res.json()
      router.push(`/content/${data.id}`)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const contentTypeIcons: Record<string, React.ReactNode> = {
    image: <Image className="w-5 h-5" />,
    video: <Film className="w-5 h-5" />,
    audio: <Music className="w-5 h-5" />,
    text: <FileText className="w-5 h-5" />,
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Upload Content</h1>
        <p className="text-zinc-500 mt-1">Monetize your content with x402 micropayments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-600 transition-colors"
            placeholder="Give your content a title..."
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-600 transition-colors resize-none"
            placeholder="What's this about?"
          />
        </div>

        {/* Content type */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Content Type</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "image", label: "Image", icon: <Image className="w-5 h-5" /> },
              { value: "video", label: "Video", icon: <Film className="w-5 h-5" /> },
              { value: "audio", label: "Audio", icon: <Music className="w-5 h-5" /> },
              { value: "text", label: "Text", icon: <FileText className="w-5 h-5" /> },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, contentType: type.value }))}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  form.contentType === type.value
                    ? "border-pink-600 bg-pink-600/10 text-pink-400"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {type.icon}
                <span className="text-xs">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Price (USDC)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.priceUsdc}
              onChange={e => setForm(f => ({ ...f, priceUsdc: e.target.value }))}
              className="w-full px-4 py-3 pl-8 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-600 transition-colors"
              placeholder="0.00"
            />
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xs text-zinc-600">Set to 0 for free content</p>
        </div>

        {/* URLs */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">File URL (where the content is stored)</label>
          <input
            type="text"
            value={form.fileUrl}
            onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-600 transition-colors"
            placeholder="https://arweave.net/... or /path/to/file"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Preview URL (blurred/low-res preview)</label>
          <input
            type="text"
            value={form.previewUrl}
            onChange={e => setForm(f => ({ ...f, previewUrl: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-600 transition-colors"
            placeholder="https://..."
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Tags (comma separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-pink-600 transition-colors"
            placeholder="exclusive, behind-the-scenes, nsfw"
          />
        </div>

        {/* Submit */}
        {error && (
          <div className="p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !form.title}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {submitting ? "Publishing..." : "Publish Content"}
        </button>
      </form>
    </div>
  )
}
