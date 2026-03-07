import { useState, useRef } from 'react'


export default function ImageUpload({ images, setImages, maxImages = 3 }) {
    const [uploadingIndex, setUploadingIndex] = useState(null)
    const fileInputRef = useRef(null)
    const [activeIndex, setActiveIndex] = useState(null)

    const handleFiles = async (file) => {
        if (!file) return

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be under 5MB')
            return
        }

        setUploadingIndex(activeIndex)

        try {
            const ext = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
            const filePath = `listings/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            const newImages = [...images]
            while (newImages.length < maxImages) newImages.push('') // Ensure array size

            newImages[activeIndex] = publicUrl

            // Clean up any empty strings before passing to parent
            setImages(newImages.filter(url => url !== ''))
        } catch (err) {
            console.error('Error uploading:', err)
            alert('Failed to upload image.')
        } finally {
            setUploadingIndex(null)
            setActiveIndex(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const removeImage = (indexToRemove) => {
        const newImages = [...images]
        newImages.splice(indexToRemove, 1)
        setImages(newImages)
    }

    const handleBoxClick = (index) => {
        setActiveIndex(index)
        fileInputRef.current?.click()
    }

    // Helper to get image at index safely
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
