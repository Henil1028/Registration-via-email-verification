import { Zap, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?'

  async function handleSignOut() {
    const { error } = await signOut()
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Signed out successfully')
      navigate('/login')
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Nav */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <div className="nav-brand-icon">
            <Zap size={20} color="white" />
          </div>
          <span className="nav-brand-text">CloudAtlas</span>
        </div>

        <div className="nav-user">
          <span className="user-email">{user?.email}</span>
          <div className="user-avatar">{initials}</div>
          <button className="btn btn-ghost btn-logout" onClick={handleSignOut}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <h1>
            Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!
          </h1>
          <p>Your account has been verified and you're all set.</p>

          <div className="status-badge">
            <span className="dot" />
            <Shield size={14} />
            Email Verified
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            marginTop: 48,
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <h3 style={{ marginBottom: 16, fontSize: '1.1rem', fontWeight: 600 }}>
            Account Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <DetailRow label="User ID" value={user?.id} />
            <DetailRow label="Email" value={user?.email} />
            <DetailRow label="Full Name" value={user?.user_metadata?.full_name || '—'} />
            <DetailRow
              label="Created At"
              value={
                user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'
              }
            />
            <DetailRow
              label="Email Verified"
              value={
                user?.email_confirmed_at ? (
                  <span style={{ color: 'var(--success)', fontWeight: 500 }}>✓ Verified</span>
                ) : (
                  <span style={{ color: 'var(--warning)', fontWeight: 500 }}>Pending</span>
                )
              }
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--surface-border)' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'monospace', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}
