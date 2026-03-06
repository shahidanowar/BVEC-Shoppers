import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    await fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist yet, create it
                const { data: userData } = await supabase.auth.getUser()
                const meta = userData?.user?.user_metadata
                const { data: newProfile } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        full_name: meta?.full_name || meta?.name || '',
                        avatar_url: meta?.avatar_url || meta?.picture || '',
                    })
                    .select()
                    .single()
                setProfile(newProfile)
            } else {
                setProfile(data)
            }
        } catch (err) {
            console.error('Error fetching profile:', err)
        } finally {
            setLoading(false)
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
        signInWithGoogle,
        signOut,
        updateProfile,
        fetchProfile,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
