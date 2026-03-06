import { useNavigate } from 'react-router-dom'

function timeAgo(dateStr) {
    const now = new Date()
    const date = new Date(dateStr)
    const seconds = Math.floor((now - date) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
}

export default function ProductCard({ product }) {
    const navigate = useNavigate()
    const thumbnail = product.images?.[0] || null

    return (
        <div
            className="product-card"
            onClick={() => navigate(`/product/${product.id}`)}
        >
            <div className="product-card-image">
                {thumbnail ? (
                    <img src={thumbnail} alt={product.name} loading="lazy" />
                ) : (
                    <div className="product-card-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span>No Image</span>
                    </div>
                )}
                {product.category && (
                    <span className="product-card-badge">{product.category}</span>
                )}
            </div>
            <div className="product-card-body">
                <h3 className="product-card-title">{product.name}</h3>
                <p className="product-card-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
                <div className="product-card-meta">
                    <span className="product-card-seller">
                        <img
                            src={product.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${product.profiles?.full_name || 'U'}&background=6c63ff&color=fff&size=20`}
                            alt=""
                            className="seller-avatar-sm"
                        />
                        {product.profiles?.full_name || 'Anonymous'}
                    </span>
                    <span className="product-card-time">{timeAgo(product.created_at)}</span>
                </div>
            </div>
        </div>
    )
}
