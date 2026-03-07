import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
    const { profile, updateProfile } = useAuth()
    const [whatsapp, setWhatsapp] = useState(profile?.whatsapp_number || '')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [isEditing, setIsEditing] = useState(!profile?.whatsapp_number)

    useEffect(() => {
        setWhatsapp(profile?.whatsapp_number || '')
        if (profile?.whatsapp_number) {
            setIsEditing(false)
        }
    }, [profile?.whatsapp_number])

    const handleSave = async (e) => {
        e.preventDefault()

        if (!whatsapp.trim()) {
            alert('Please enter your WhatsApp number')
            return
        }

        setSaving(true)
        setSaved(false)
        try {
            await updateProfile({ whatsapp_number: whatsapp.trim() })
            setSaved(true)
            setIsEditing(false)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error('Error updating profile:', err)
            alert('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1>Profile</h1>
                <p>Manage your account settings</p>
            </div>

            <div className="profile-card-large">
                <img
                    src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'U'}&background=6c63ff&color=fff&size=128`}
                    alt="Profile"
                    className="profile-avatar-lg"
                />
                <h2>{profile?.full_name || 'User'}</h2>
            </div>

            <form onSubmit={handleSave} className="profile-form">
                <div className="form-group">
                    <label htmlFor="whatsapp">
                        WhatsApp Number *
                        <span className="label-hint">10-digit mobile number</span>
                    </label>
                    <div className="input-with-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span className="country-code-prefix" style={{ color: 'var(--text-secondary)', fontWeight: 600, paddingLeft: '8px' }}>+91</span>
                        <input
                            id="whatsapp"
                            type="tel"
                            placeholder="9876543210"
                            value={whatsapp?.replace(/^91/, '')}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                setWhatsapp(val ? `91${val}` : '');
                            }}
                            maxLength={10}
                            disabled={!isEditing}
                            style={{
                                flex: 1,
                                minWidth: 0,
                                ...(!isEditing ? { backgroundColor: 'transparent', cursor: 'default', color: 'var(--text-primary)', fontWeight: '600' } : {})
                            }}
                        />
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                style={{ background: 'none', color: 'var(--accent)', fontWeight: '600', padding: '0 8px', cursor: 'pointer', border: 'none', marginRight: '8px' }}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    <p className="form-help">
                        This number will be shared with buyers who want to contact you about your listings.
                    </p>
                </div>

                {isEditing && (
                    <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                        {saving ? (
                            <>
                                <div className="spinner small"></div>
                                Saving...
                            </>
                        ) : saved ? (
                            <>✓ Saved!</>
                        ) : (
                            'Save Profile'
                        )}
                    </button>
                )}

                {saved && !isEditing && (
                    <p style={{ color: 'var(--success)', fontWeight: '600', textAlign: 'center' }}>✓ Profile Saved Successfully!</p>
                )}
            </form>
        </div>
    )
}
