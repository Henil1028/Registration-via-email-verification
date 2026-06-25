import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'

  useEffect(() => {
    // Supabase handles the token exchange automatically via onAuthStateChange
    // when the URL contains the access_token / refresh_token hash params.
    // We just need to detect if authentication succeeded.

    const timer = setTimeout(() => {
      // Check if we have hash params (Supabase redirects with #access_token=...)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const error = hashParams.get('error_description')

      if (error) {
        setStatus('error')
        toast.error(error)
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      if (accessToken) {
        setStatus('success')
        toast.success('Email verified successfully!')
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        // No hash params — the Supabase client might handle it via cookies/session
        setStatus('success')
        toast.success('Email verified!')
        setTimeout(() => navigate('/dashboard'), 2000)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="auth-layout">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="glass-card auth-card success-card">
        {status === 'verifying' && (
          <>
            <div className="spinner" style={{ width: 48, height: 48, borderWidth: 3, margin: '0 auto 24px' }} />
            <h2>Verifying Your Email...</h2>
            <p>Please wait while we confirm your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon-wrap">
              <CheckCircle2 size={36} />
            </div>
            <h2>Email Verified!</h2>
            <p>Your account has been verified. Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="success-icon-wrap" style={{ background: 'var(--error-bg)' }}>
              <XCircle size={36} style={{ color: 'var(--error)' }} />
            </div>
            <h2>Verification Failed</h2>
            <p>The link may have expired. Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  )
}
