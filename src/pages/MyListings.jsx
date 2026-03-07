import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'

export default function MyListings() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) fetchMyProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    async function fetchMyProducts() {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, profiles(full_name, avatar_url)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="my-listings-page">
            <div className="page-header">
                <h1>My Listings</h1>
                <p>Manage your products</p>
                <p className="ux-hint" style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Click on any listing below to edit or delete it
                </p>
            </div>

            {loading ? (
                <div className="feed-loading">
                    <div className="spinner"></div>
                    <p>Loading your listings...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="feed-empty">
                    <span className="empty-icon">📋</span>
                    <h3>No listings yet</h3>
                    <p>Start selling to your college community!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/sell')}>
                        Create Your First Listing
                    </button>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}
