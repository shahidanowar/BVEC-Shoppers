import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function timeAgo(dateStr) {
    const now = new Date()
    const date = new Date(dateStr)
    const seconds = Math.floor((now - date) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minutes ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
}

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetchProduct()
    }, [id])

    async function fetchProduct() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, profiles(full_name, avatar_url, whatsapp_number)')
                .eq('id', id)
                .single()

            if (error) throw error
            setProduct(data)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this listing?')) return
        setDeleting(true)
        try {
            const { error } = await supabase.from('products').delete().eq('id', id)
            if (error) throw error
            navigate('/')
        } catch (err) {
            console.error('Error deleting:', err)
            alert('Failed to delete listing')
        } finally {
            setDeleting(false)
        }
    }

    function openWhatsApp() {
        const phone = product.profiles?.whatsapp_number?.replace(/[^0-9]/g, '')
        if (!phone) {
            alert('Seller has not added their WhatsApp number yet.')
            return
        }
        const message = encodeURIComponent(
            `Hi! I'm interested in "${product.name}" (ID: ${product.id}) listed on BVEC Shoppers. Is it still available?`
        )
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading product...</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="feed-empty">
                <span className="empty-icon">🔍</span>
                <h3>Product not found</h3>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Feed</button>
            </div>
        )
    }

    const isOwner = user?.id === product.user_id

    return (
        <div className="product-detail-page">
            <button className="btn-back" onClick={() => navigate(-1)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
            </button>

            <div className="product-detail-layout">
                <div className="product-images-section">
                    {product.images?.length > 0 ? (
                        <>
                            <div className="product-main-image">
                                <img src={product.images[activeImage]} alt={product.name} />
                            </div>
                            {product.images.length > 1 && (
                                <div className="product-thumbnails">
                                    {product.images.map((img, i) => (
                                        <button
                                            key={i}
                                            className={`thumbnail ${i === activeImage ? 'active' : ''}`}
                                            onClick={() => setActiveImage(i)}
                                        >
                                            <img src={img} alt={`${product.name} ${i + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="product-no-image">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p>No photos available</p>
                        </div>
                    )}
                </div>

                <div className="product-info-section">
                    <div className="product-info-header">
                        {product.category && (
                            <span className="product-category-badge">{product.category}</span>
                        )}
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
                    </div>

                    {product.description && (
                        <div className="product-description">
                            <h3>Description</h3>
                            <p>{product.description}</p>
                        </div>
                    )}

                    <div className="product-seller-card">
                        <img
                            src={product.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${product.profiles?.full_name || 'U'}&background=6c63ff&color=fff`}
                            alt=""
                            className="seller-avatar"
                        />
                        <div className="seller-info">
                            <span className="seller-name">{product.profiles?.full_name || 'Anonymous'}</span>
                            <span className="seller-time">Listed {timeAgo(product.created_at)}</span>
                        </div>
                    </div>

                    <div className="product-actions">
                        {isOwner ? (
                            <button
                                className="btn btn-danger btn-lg"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Listing'}
                            </button>
                        ) : (
                            <button className="btn btn-whatsapp btn-lg" onClick={openWhatsApp}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Contact on WhatsApp
                            </button>
                        )}
                    </div>

                    <p className="product-id">ID: {product.id}</p>
                </div>
            </div>
        </div>
    )
}
