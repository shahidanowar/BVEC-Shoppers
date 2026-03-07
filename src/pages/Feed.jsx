import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['All', 'Books', 'Electronics', 'Clothing', 'Furniture', 'Stationery', 'Sports', 'Other']
const SORT_OPTIONS = [
    { value: 'newest', label: 'Sort' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price_low', label: 'Price: Low → High' },
    { value: 'price_high', label: 'Price: High → Low' },
]

export default function Feed() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [category, setCategory] = useState('All')
    const [sort, setSort] = useState('newest')

    useEffect(() => {
        fetchProducts()
    }, [category, sort])

    async function fetchProducts() {
        setLoading(true)
        try {
            let query = supabase
                .from('products')
                .select('*, profiles(full_name, avatar_url, whatsapp_number)')

            if (category !== 'All') {
                query = query.eq('category', category)
            }

            switch (sort) {
                case 'newest':
                    query = query.order('created_at', { ascending: false })
                    break
                case 'oldest':
                    query = query.order('created_at', { ascending: true })
                    break
                case 'price_low':
                    query = query.order('price', { ascending: true })
                    break
                case 'price_high':
                    query = query.order('price', { ascending: false })
                    break
            }

            const { data, error } = await query
            if (error) throw error
            setProducts(data || [])
        } catch (err) {
            console.error('Error fetching products:', err)
        } finally {
            setLoading(false)
        }
    }

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    )

    const handleSearch = (e) => {
        e.preventDefault()
        setSearch(searchInput)
    }

    return (
        <div className="feed-page">

            <div className="feed-controls">
                <form className="search-bar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    {searchInput && (
                        <button type="button" className="search-clear" onClick={() => { setSearchInput(''); setSearch('') }}>×</button>
                    )}
                    <button type="submit" className="search-btn">
                        <svg className="search-btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span className="search-btn-text">Search</span>
                    </button>
                </form>

                <select
                    className="sort-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="filters-scroll-row">

                <div className="category-chips">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className={`chip ${category === cat ? 'chip-active' : ''}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="feed-loading">
                    <div className="spinner"></div>
                    <p>Loading listings...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="feed-empty">
                    <span className="empty-icon">📦</span>
                    <h3>No items found</h3>
                    <p>{search ? 'Try a different search term' : 'Be the first to list something!'}</p>
                </div>
            ) : (
                <div className="product-grid">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}
