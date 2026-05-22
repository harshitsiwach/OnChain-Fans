"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Image, Film, FileText, Music, Lock, Sparkles } from "lucide-react"

const contentTypeItems = [
  { value: "image", label: "Image", icon: Image },
  { value: "video", label: "Video", icon: Film },
  { value: "audio", label: "Audio", icon: Music },
  { value: "text", label: "Text", icon: FileText },
]

export default function UploadPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: "", description: "", contentType: "image", priceUsdc: "",
    tags: "", previewUrl: "", fileUrl: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

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

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-bounce-in">
      <div>
        <h1 className="text-2xl font-bold gradient-pink-purple">Upload Content</h1>
        <p className="text-[#b8a9d4] mt-1">Monetize your content with x402 micropayments on Arc</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#b8a9d4]">Title</label>
          <input
            type="text" required
            value={form.title}
            onChange={e => update("title", e.target.value)}
            className="input-pill"
            placeholder="Give your content a title..."
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#b8a9d4]">Description</label>
          <textarea
            value={form.description}
            onChange={e => update("description", e.target.value)}
            rows={3}
            className="input-pill resize-none"
            placeholder="What's this about?"
          />
        </div>

        {/* Content type */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#b8a9d4]">Content Type</label>
          <div className="grid grid-cols-4 gap-2">
            {contentTypeItems.map((type) => {
              const Icon = type.icon
              const isActive = form.contentType === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => update("contentType", type.value)}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-[16px] border transition-all duration-200 ${
                    isActive
                      ? "border-[#e040a0] bg-[#e040a0]/10 text-[#e040a0] shadow-lg shadow-[#e040a0]/10"
                      : "border-[#2a1f3d] bg-[#1a1425] text-[#7a6b99] hover:border-[#3d2d5c] hover:text-[#b8a9d4]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-bold">{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#b8a9d4]">Price (USDC)</label>
          <div className="relative">
            <input
              type="number" step="0.01" min="0"
              value={form.priceUsdc}
              onChange={e => update("priceUsdc", e.target.value)}
              className="input-pill pl-10"
              placeholder="0.00"
            />
            <Lock className="w-4 h-4 text-[#7a6b99] absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xs text-[#7a6b99] font-medium">Set to 0 for free content</p>
        </div>

        {/* URLs */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#b8a9d4]">File URL</label>
          <input
            type="text" value={form.fileUrl}
            onChange={e => update("fileUrl", e.target.value)}
            className="input-pill"
            placeholder="https://arweave.net/... or /path/to/file"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#b8a9d4]">Preview URL</label>
          <input
            type="text" value={form.previewUrl}
            onChange={e => update("previewUrl", e.target.value)}
            className="input-pill"
            placeholder="https://..."
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#b8a9d4]">Tags</label>
          <input
            type="text" value={form.tags}
            onChange={e => update("tags", e.target.value)}
            className="input-pill"
            placeholder="exclusive, behind-the-scenes, nsfw"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-[16px] bg-[#e040a0]/10 border border-[#e040a0]/20 text-[#e040a0] text-sm font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !form.title}
          className="btn-pill btn-pink w-full justify-center text-base py-3.5"
        >
          <Upload className="w-5 h-5" />
          {submitting ? "Publishing..." : "Publish Content"}
        </button>
      </form>
    </div>
  )
}
