import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ImageUpload from '../components/ImageUpload'

const CATEGORIES = ['Books', 'Electronics', 'Clothing', 'Furniture', 'Stationery', 'Sports', 'Other']

export default function CreateListing() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState([])
    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
    })

    const hasWhatsApp = profile?.whatsapp_number?.trim()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!hasWhatsApp) return

        if (!form.name.trim() || !form.price || !form.category) {
            alert('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            // 1. Upload images first
            const uploadedUrls = []
            for (const img of images) {
                if (!img || !img.file) continue

                const ext = img.file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
                const filePath = `listings/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, img.file)

                if (uploadError) {
                    console.error('Image upload error:', uploadError)
                    throw new Error('Failed to upload one or more images.')
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath)

                uploadedUrls.push(publicUrl)
            }

            // 2. Generate a 4-digit random alphanumeric ID
            const generateShortId = () => {
                const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                let id = ''
                for (let i = 0; i < 4; i++) {
                    id += chars.charAt(Math.floor(Math.random() * chars.length))
                }
                return id
            }

            // 3. Save to database
            const { error } = await supabase.from('products').insert({
                id: generateShortId(),
                user_id: user.id,
                name: form.name.trim(),
                price: parseFloat(form.price),
                description: form.description.trim(),
                category: form.category,
                images: uploadedUrls,
            })

            if (error) throw error
            navigate('/')
        } catch (err) {
            console.error('Error creating listing:', err)
            alert('Failed to create listing. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="create-listing-page">
            <div className="page-header">
                <h1>Sell an Item</h1>
                <p>List your item for other students to buy</p>
            </div>

            {!hasWhatsApp && (
                <div className="whatsapp-warning">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-content">
                        <h3>WhatsApp Number Required</h3>
                        <p>You need to add your WhatsApp number before listing products. Buyers will contact you via WhatsApp to negotiate and finalize deals.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                            Add WhatsApp Number
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className={`listing-form ${!hasWhatsApp ? 'form-disabled' : ''}`}>
                <div className="form-group">
                    <label htmlFor="name">Product Name *</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="e.g., Engineering Mathematics Textbook"
                        value={form.name}
                        onChange={handleChange}
                        disabled={!hasWhatsApp}
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
                            disabled={!hasWhatsApp}
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
                            disabled={!hasWhatsApp}
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
                        disabled={!hasWhatsApp}
                    />
                </div>

                <div className="form-group">
                    <label>Photos (max 3)</label>
                    <ImageUpload images={images} setImages={setImages} maxImages={3} />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading || !hasWhatsApp}
                >
                    {loading ? (
                        <>
                            <div className="spinner small"></div>
                            Publishing...
                        </>
                    ) : (
                        'Publish Listing'
                    )}
                </button>
            </form>
        </div>
    )
}
