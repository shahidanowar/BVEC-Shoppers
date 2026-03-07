import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ImageUpload from '../components/ImageUpload'

const CATEGORIES = ['Books', 'Electronics', 'Clothing', 'Furniture', 'Stationery', 'Sports', 'Other']

export default function EditListing() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [images, setImages] = useState([])
    const [originalImages, setOriginalImages] = useState([])
    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
    })

    useEffect(() => {
        fetchProduct()
    }, [id])

    async function fetchProduct() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error

            if (data.user_id !== user.id) {
                navigate('/')
                return
            }

            setForm({
                name: data.name || '',
                price: data.price?.toString() || '',
                description: data.description || '',
                category: data.category || '',
            })

            // Format existing images for ImageUpload component
            const existingImages = data.images || []
            setOriginalImages(existingImages)

            const formattedImages = existingImages.map(url => ({
                file: null, // No local file for existing images
                previewUrl: url
            }))
            setImages(formattedImages)
        } catch (err) {
            console.error('Error fetching product:', err)
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!form.name.trim() || !form.price || !form.category) {
            alert('Please fill in all required fields')
            return
        }

        setSaving(true)
        try {
            // 1. Process images
            const finalUrls = []

            for (const img of images) {
                if (!img) continue

                if (img.file) {
                    // This is a new image, upload it
                    const ext = img.file.name.split('.').pop()
                    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
                    const filePath = `listings/${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(filePath, img.file)

                    if (uploadError) throw new Error('Failed to upload new image.')

                    const { data: { publicUrl } } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(filePath)

                    finalUrls.push(publicUrl)
                } else if (img.previewUrl) {
                    // This is an existing image we are keeping
                    finalUrls.push(img.previewUrl)
                }
            }

            // 2. Cleanup replaced/deleted old images from storage
            const pathsToRemove = originalImages
                .filter(url => !finalUrls.includes(url))
                .map(url => {
                    const parts = url.split('product-images/')
                    return parts.length > 1 ? parts[1] : null
                })
                .filter(Boolean)

            if (pathsToRemove.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('product-images')
                    .remove(pathsToRemove)
                if (storageError) console.error('Error removing old images:', storageError)
            }

            // 3. Update database
            const { error } = await supabase
                .from('products')
                .update({
                    name: form.name.trim(),
                    price: parseFloat(form.price),
                    description: form.description.trim(),
                    category: form.category,
                    images: finalUrls,
                })
                .eq('id', id)

            if (error) throw error
            navigate(`/product/${id}`)
        } catch (err) {
            console.error('Error updating listing:', err)
            alert('Failed to update listing. Please try again.')
        } finally {
            // Memory cleanup for local previews
            images.forEach(img => {
                if (img && img.file && img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl)
                }
            })
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading listing...</p>
            </div>
        )
    }

    return (
        <div className="create-listing-page">
            <div className="page-header">
                <h1>Edit Listing</h1>
                <p>Update your product details</p>
            </div>

            <form onSubmit={handleSubmit} className="listing-form">
                <div className="form-group">
                    <label htmlFor="name">Product Name *</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="e.g., Engineering Mathematics Textbook"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="price">Price (₹) *</label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="500"
                            value={form.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        placeholder="Describe your item — condition, reason for selling, etc."
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Photos (max 3)</label>
                    <ImageUpload images={images} setImages={setImages} maxImages={3} />
                </div>

                <div className="form-actions-row">
                    <button
                        type="button"
                        className="btn btn-secondary btn-lg"
                        onClick={() => navigate(`/product/${id}`)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="spinner small"></div>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
