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
