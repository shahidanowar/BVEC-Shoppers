import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

const AUTH_SESSION_TIMEOUT_MS = 8000

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [profileLoading, setProfileLoading] = useState(false)
    const mountedRef = useRef(false)

    useEffect(() => {
        mountedRef.current = true
        let subscription = null

        const initSession = async () => {
            let timeoutId = null
            let didTimeout = false

            timeoutId = setTimeout(() => {
                didTimeout = true
                if (!mountedRef.current) return
                console.warn('Auth session lookup is slow; continuing without blocking UI.')
                setLoading(false)
            }, AUTH_SESSION_TIMEOUT_MS)

            try {
                console.log('[Auth] Attempting getSession...')
                console.time('Session fetch')
                const { data, error } = await supabase.auth.getSession()
                console.timeEnd('Session fetch')
                console.log('[Auth] getSession finished', { data, error })

                if (timeoutId) clearTimeout(timeoutId)
                if (!mountedRef.current) return

                if (error) {
                    throw error
                }

                const session = data?.session
                setUser(session?.user ?? null)
                setLoading(false)

                if (session?.user) {
                    fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                }
            } catch (err) {
                if (timeoutId) clearTimeout(timeoutId)
                if (didTimeout) {
                    return
                }
                console.error('Session error:', err)
                if (!mountedRef.current) return
                setUser(null)
                setProfile(null)
                setLoading(false)
            }
        }

        initSession()

        const setupAuthListener = () => {
            const { data } = supabase.auth.onAuthStateChange(
                (_event, session) => {
                    if (!mountedRef.current) return
                    setUser(session?.user ?? null)
                    setLoading(false)
                    if (session?.user) {
                        fetchProfile(session.user.id)
                    } else {
                        setProfile(null)
                    }
                }
            )
            subscription = data.subscription
        }

        setupAuthListener()

        return () => {
            mountedRef.current = false
            if (subscription) {
                subscription.unsubscribe()
            }
        }
    }, [])

    async function fetchProfile(userId) {
        if (!userId) return
        setProfileLoading(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist yet, create it
                const { data: userData, error: userError } = await supabase.auth.getUser()
                if (userError) throw userError
                const meta = userData?.user?.user_metadata
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        full_name: meta?.full_name || meta?.name || '',
                        avatar_url: meta?.avatar_url || meta?.picture || '',
                    })
                    .select()
                    .single()
                if (insertError) throw insertError
                if (mountedRef.current) setProfile(newProfile)
            } else if (error) {
                throw error
            } else if (mountedRef.current) {
                setProfile(data)
            }
        } catch (err) {
            console.error('Error fetching profile:', err)
            if (mountedRef.current) setProfile(null)
        } finally {
            if (mountedRef.current) setProfileLoading(false)
        }
    }

    async function signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        })
        if (error) console.error('Error signing in:', error)
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) console.error('Error signing out:', error)
    }

    async function updateProfile(updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()
        if (error) throw error
        setProfile(data)
        return data
    }

    const value = {
        user,
        profile,
        loading,
        profileLoading,
        signInWithGoogle,
        signOut,
        updateProfile,
        fetchProfile,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
