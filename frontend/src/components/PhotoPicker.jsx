import { useEffect, useState } from 'react'

// Face photo chooser with a passport-style preview. Used on signup and the fee page.
export default function PhotoPicker({ file, onChange, currentUrl, inputId = 'photo' }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const shown = preview || currentUrl

  return (
    <label htmlFor={inputId} className="flex items-center gap-4 rounded-xl border-2 border-dashed border-cream-200 bg-cream-50 p-3 cursor-pointer hover:border-brand-200">
      <span className="shrink-0 w-20 h-24 rounded-lg overflow-hidden bg-white border border-cream-200 flex items-center justify-center">
        {shown
          ? <img src={shown} alt="Your photo" className="w-full h-full object-cover" />
          : <svg viewBox="0 0 24 24" className="w-10 h-10 text-stone-300" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" /></svg>}
      </span>
      <span className="text-sm">
        <span className="block font-semibold text-stone-800">{shown ? 'Change photo' : 'Add your photo'}</span>
        <span className="block text-stone-500">A clear photo of your face, like on your student card. JPG or PNG, max 3 MB.</span>
      </span>
      <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
             onChange={(e) => onChange(e.target.files[0] || null)} />
    </label>
  )
}
