import { useState, useRef } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB absolute max
const COMPRESS_THRESHOLD = 400 * 1024 // 400KB

export default function ImageUpload({ images, setImages, maxImages = 3 }) {
    const [uploadingIndex, setUploadingIndex] = useState(null)
    const fileInputRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(null)

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (event) => {
                const img = new Image()
                img.src = event.target.result
                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let { width, height } = img
                    const maxDim = 1200

                    if (width > height && width > maxDim) {
                        height = Math.round((height * maxDim) / width)
                        width = maxDim
                    } else if (height > width && height > maxDim) {
                        width = Math.round((width * maxDim) / height)
                        height = maxDim
                    }

                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(file) // fallback to original
                            return
                        }
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        })
                        resolve(compressedFile)
                    }, 'image/jpeg', 0.7)
                }
                img.onerror = () => resolve(file)
            }
            reader.onerror = () => resolve(file)
        })
    }

    const handleFiles = async (file) => {
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.')
            return
        }
        if (file.size > MAX_FILE_SIZE) {
            alert('Image must be under 5MB before compression.')
            return
        }

        setUploadingIndex(activeIndex)

        try {
            let finalFile = file;
            // Compress if over 400KB
            if (file.size > COMPRESS_THRESHOLD) {
                finalFile = await compressImage(file)
            }

            const previewUrl = URL.createObjectURL(finalFile)

            const newImages = [...images]
            while (newImages.length < maxImages) newImages.push(null)

            newImages[activeIndex] = { file: finalFile, previewUrl }

            // Clean up any nulls before passing to parent
            setImages(newImages.filter(item => item !== null))
        } catch (err) {
            console.error('Error processing image:', err)
            alert('Failed to process image.')
        } finally {
            setUploadingIndex(null)
            setActiveIndex(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeImage = (indexToRemove) => {
        const newImages = [...images]

        // Revoke the object URL to avoid memory leaks
        const img = newImages[indexToRemove]
        if (img && img.previewUrl) {
            URL.revokeObjectURL(img.previewUrl)
        }

        newImages.splice(indexToRemove, 1)
        setImages(newImages)
    }

    const handleBoxClick = (index) => {
        setActiveIndex(index)
        fileInputRef.current?.click()
    }

    // Helper to get image preview url at index safely
    const getImageUrl = (index) => images[index]?.previewUrl || null

    return (
        <div className="image-upload-boxes">
            {Array.from({ length: maxImages }).map((_, index) => {
                const url = getImageUrl(index)
                const isUploading = uploadingIndex === index

                return (
                    <div
                        key={index}
                        className={`upload-box ${url ? 'has-image' : ''}`}
                        onClick={() => !url && !isUploading && handleBoxClick(index)}
                    >
                        {isUploading ? (
                            <div className="upload-loading">
                                <div className="spinner small"></div>
                            </div>
                        ) : url ? (
                            <>
                                <img src={url} alt={`Upload ${index + 1}`} />
                                <button
                                    className="image-remove"
                                    onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                    type="button"
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <div className="upload-placeholder">
                                <span className="plus-icon">+</span>
                                <span className="box-label">Photo {index + 1}</span>
                            </div>
                        )}
                    </div>
                )
            })}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files[0])}
                style={{ display: 'none' }}
            />
        </div>
    )
}
