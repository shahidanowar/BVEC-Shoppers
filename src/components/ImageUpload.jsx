import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function ImageUpload({ images, setImages, maxImages = 3 }) {
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef(null)

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return

        const remaining = maxImages - images.length
        if (remaining <= 0) return

        const filesToUpload = Array.from(files).slice(0, remaining)
        setUploading(true)

        try {
            const uploadedUrls = []

            for (const file of filesToUpload) {
                if (!file.type.startsWith('image/')) continue
                if (file.size > 5 * 1024 * 1024) {
                    alert('Each image must be under 5MB')
                    continue
                }

                const ext = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
                const filePath = `listings/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file)

                if (uploadError) {
                    console.error('Upload error:', uploadError)
                    continue
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath)

                uploadedUrls.push(publicUrl)
            }

            setImages([...images, ...uploadedUrls])
        } catch (err) {
            console.error('Error uploading:', err)
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        handleFiles(e.dataTransfer.files)
    }

    return (
        <div className="image-upload">
            <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''} ${images.length >= maxImages ? 'disabled' : ''}`}
                onClick={() => images.length < maxImages && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {uploading ? (
                    <div className="upload-loading">
                        <div className="spinner small"></div>
                        <span>Uploading...</span>
                    </div>
                ) : (
                    <>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <p>Click or drag images here</p>
                        <span className="upload-hint">{images.length}/{maxImages} images • Max 5MB each</span>
                    </>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                style={{ display: 'none' }}
            />

            {images.length > 0 && (
                <div className="image-previews">
                    {images.map((url, index) => (
                        <div key={index} className="image-preview">
                            <img src={url} alt={`Upload ${index + 1}`} />
                            <button
                                className="image-remove"
                                onClick={() => removeImage(index)}
                                type="button"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
