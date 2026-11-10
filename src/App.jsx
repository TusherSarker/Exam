import { useState } from 'react'
import {
  doCreateUserWithEmailAndPassword,
  doPasswordReset,
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSignOut,
  doUpdateUserProfile,
} from './Auth/auth'
import { useAuth } from './Auth/useAuth'
import './App.css'

const paths = {
  home: '/',
  login: '/login',
  signup: '/signin',
  forgot: '/forgot-password',
}
const currentYear = new Date().getFullYear()

function Brand({ light = false }) {
  return (
    <a className={`brand${light ? ' brand-light' : ''}`} href={paths.home}>
      <span className="brand-mark" aria-hidden="true">s</span>
      <span>solace</span>
    </a>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.25 10h11.5m-4.5-4.5 4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AuthLayout({ children, mode }) {
  return (
    <main className="auth-page">
      <section className="auth-art" aria-label="Solace">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="art-content">
          <Brand light />
          <div className="art-quote">
            <span className="eyebrow">A LITTLE MORE SPACE TO</span>
            <h2>Make room<br />for what matters.</h2>
            <p>A calmer way to bring your days, ideas, and people together.</p>
          </div>
          <div className="art-bottom">
            <span className="art-dot" />
            <span>Good things grow here.</span>
          </div>
        </div>
        <div className="art-decoration" aria-hidden="true">
          <span className="sun-shape" />
          <span className="art-caption">a softer kind of<br />getting things done</span>
        </div>
      </section>
      <section className={`auth-panel auth-${mode}`}>
        <div className="auth-panel-top">
          <span className="mobile-brand"><Brand /></span>
          <span className="top-prompt">
            {mode === 'signup' ? 'Already have an account?' : 'New around here?'}
            {' '}
            <a href={mode === 'signup' ? paths.login : paths.signup}>
              {mode === 'signup' ? 'Log in' : 'Create an account'}
            </a>
          </span>
        </div>
        <div className="auth-content">{children}</div>
        <footer className="auth-footer">
          <span>© {currentYear} Solace Studio</span>
          <a href="#privacy">Privacy</a>
          <a href="#help">Need help?</a>
        </footer>
      </section>
    </main>
  )
}

function AuthForm({ mode }) {
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState('')
  const [busy, setBusy] = useState(false)
  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'

  function getAuthErrorMessage(error) {
    switch (error?.code) {
      case 'auth/email-already-in-use':
        return 'An account already uses this email. Try logging in instead.'
      case 'auth/invalid-email':
        return 'Enter a valid email address and try again.'
      case 'auth/weak-password':
        return 'Choose a stronger password with at least 8 characters.'
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'The email or password is incorrect. Check your details and try again.'
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact support for help.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a while and try again.'
      case 'auth/network-request-failed':
        return 'Could not reach Firebase. Check your internet connection and try again.'
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled for this Firebase project.'
      case 'auth/popup-blocked':
        return 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.'
      case 'auth/popup-closed-by-user':
        return 'The Google sign-in window was closed before sign-in completed.'
      case 'auth/unauthorized-domain':
        return 'This website domain is not authorized in the Firebase project settings.'
      default:
        return 'Firebase could not complete the request. Please try again.'
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')
    const name = String(formData.get('name') || '').trim()

    setNotice('')
    setBusy(true)
    try {
      if (isForgot) {
        await doPasswordReset(email)
        setNoticeType('success')
        setNotice('If an account exists for this email, a password reset message will be sent.')
      } else if (isSignup) {
        const { user } = await doCreateUserWithEmailAndPassword(email, password)
        if (name) {
          try {
            await doUpdateUserProfile(user, { displayName: name })
          } catch {
            setNoticeType('info')
            setNotice('Your account was created, but your name could not be saved to your profile.')
            return
          }
        }
        window.location.assign(paths.home)
      } else {
        await doSignInWithEmailAndPassword(email, password)
        window.location.assign(paths.home)
      }
    } catch (error) {
      if (isForgot && error?.code === 'auth/user-not-found') {
        setNoticeType('success')
        setNotice('If an account exists for this email, a password reset message will be sent.')
      } else {
        setNoticeType('error')
        setNotice(getAuthErrorMessage(error))
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleSignIn() {
    setNotice('')
    setBusy(true)
    try {
      await doSignInWithGoogle()
      window.location.assign(paths.home)
    } catch (error) {
      setNoticeType('error')
      setNotice(getAuthErrorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const title = isForgot ? 'Reset your password' : isSignup ? 'Create your account' : 'Welcome back'
  const description = isForgot
    ? 'No worries. Enter the email linked to your account and we’ll help you get back in.'
    : isSignup
      ? 'A fresh start is just a few details away.'
      : 'Take a breath. Your space is right where you left it.'

  return (
    <AuthLayout mode={mode}>
      <div className="form-heading">
        <span className="form-kicker">{isForgot ? 'ACCOUNT RECOVERY' : isSignup ? 'YOUR SPACE, YOURS' : 'YOUR DAY, IN GOOD HANDS'}</span>
        <h1>{title}<span className="title-period">.</span></h1>
        <p>{description}</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        {isSignup && (
          <label className="field">
            <span>Your name</span>
            <input autoComplete="name" name="name" placeholder="How should we call you?" required />
          </label>
        )}
        <label className="field">
          <span>Email address</span>
          <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
        </label>
        {!isForgot && (
          <label className="field">
            <span className="field-label-row">
              <span>Password</span>
              {!isSignup && <a className="subtle-link" href={paths.forgot}>Forgot password?</a>}
            </span>
            <input
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength="8"
              name="password"
              placeholder="At least 8 characters"
              required
              type="password"
            />
          </label>
        )}
        {isSignup && (
          <label className="check-row">
            <input required type="checkbox" />
            <span>I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</span>
          </label>
        )}
        <button className="primary-button" disabled={busy} type="submit">
          {busy ? 'Please wait…' : isForgot ? 'Send reset link' : isSignup ? 'Create my account' : 'Log in to Solace'}
          <ArrowIcon />
        </button>
        {notice && <p className={`form-notice notice-${noticeType}`} role={noticeType === 'error' ? 'alert' : 'status'}>{notice}</p>}
      </form>
      {isForgot && <a className="back-link" href={paths.login}>← Back to log in</a>}
      {!isForgot && (
        <div className="form-divider"><span>or continue with</span></div>
      )}
      {!isForgot && (
        <button className="google-button" disabled={busy} type="button" onClick={handleGoogleSignIn}>
          <span className="google-g" aria-hidden="true">G</span>
          Continue with Google
        </button>
      )}
      {!isForgot && (
        <p className="form-terms">
          By {isSignup ? 'creating an account' : 'logging in'}, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
        </p>
      )}
    </AuthLayout>
  )
}

function FeatureIcon({ type }) {
  if (type === 'focus') {
    return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="10.5" stroke="currentColor" strokeWidth="1.5" /><circle cx="16" cy="16" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M16 2v3m0 22v3M2 16h3m22 0h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
  }
  if (type === 'flow') {
    return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 10h18M7 16h12M7 22h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="23" cy="16" r="2" fill="currentColor" /></svg>
  }
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 26s-10-5.8-10-13a5.5 5.5 0 0 1 10-3.1A5.5 5.5 0 0 1 26 13c0 7.2-10 13-10 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 16h3l2-3 3 6 2-3h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function HomePage() {
  const { currentUser, userLoggedIn } = useAuth()
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    setBusy(true)
    setNotice('')
    try {
      await doSignOut()
    } catch {
      setNotice('Could not sign out. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="home-page">
      <header className="site-header">
        <Brand />
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#approach">Our approach</a>
          <a href="#features">What you get</a>
        </nav>
        <div className="header-actions">
          {userLoggedIn ? (
            <>
              <span className="header-welcome">Hello, {currentUser.displayName || currentUser.email}</span>
              <button className="header-login" disabled={busy} onClick={handleSignOut} type="button">
                {busy ? 'Signing out…' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <a className="header-login" href={paths.login}>Log in</a>
              <a className="header-cta" href={paths.signup}>Get started <ArrowIcon /></a>
            </>
          )}
        </div>
      </header>
      {notice && <p className="home-auth-notice" role="alert">{notice}</p>}
      <section className="home-hero" id="approach">
        <div className="hero-copy">
          <span className="hero-label"><span /> YOUR SPACE TO RESET & REFRESH</span>
          <h1>Make a little<br />room for <em>more.</em></h1>
          <p>Less noise, more meaning. Bring your plans and thoughts into one thoughtful space, and find your own pace again.</p>
          <div className="hero-actions">
            <a className="primary-button hero-button" href={paths.signup}>Find your calm <ArrowIcon /></a>
            <a className="text-button" href="#features">Take a look <span>↓</span></a>
          </div>
          <div className="hero-social-proof">
            <div className="avatar-stack" aria-hidden="true"><span>A</span><span>M</span><span>J</span><span>+</span></div>
            <p><strong>A softer start, every day.</strong><br />Made for the way you really live.</p>
          </div>
        </div>
        <div className="hero-visual" aria-label="Illustration of a peaceful, sunlit landscape">
          <div className="visual-sun" />
          <div className="visual-window"><span /><span /><span /></div>
          <div className="visual-hill hill-back" />
          <div className="visual-hill hill-front" />
          <div className="visual-plant plant-left"><i /><i /><i /><b /></div>
          <div className="visual-plant plant-right"><i /><i /><i /><b /></div>
          <div className="visual-note">
            <span className="note-star">✳</span>
            <span><strong>One thing at a time.</strong><br />You’re right where you need to be.</span>
          </div>
          <span className="visual-caption">a quiet corner, just for you</span>
        </div>
        <span className="hero-side-note">A LITTLE MORE SPACE TO BE</span>
      </section>
      <section className="features-section" id="features">
        <div className="features-intro">
          <span className="section-label">A GOOD PLACE TO BEGIN</span>
          <h2>Life feels lighter<br />when it has <em>space.</em></h2>
        </div>
        <div className="feature-cards">
          <article className="feature-card">
            <span className="feature-icon"><FeatureIcon type="focus" /></span>
            <h3>Find your focus</h3>
            <p>Keep the important things close and let the rest be background noise.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon"><FeatureIcon type="flow" /></span>
            <h3>Make it flow</h3>
            <p>Give your ideas a place to land, grow, and gently take shape.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon"><FeatureIcon type="care" /></span>
            <h3>Go at your pace</h3>
            <p>Little by little is still forward. Make a rhythm that feels like yours.</p>
          </article>
        </div>
      </section>
      <section className="home-bottom">
        <p>A kinder way to make progress starts here.</p>
        <a href={paths.signup}>Create your free account <ArrowIcon /></a>
      </section>
      <footer className="site-footer">
        <Brand />
        <span>© {currentYear} Solace Studio. Make room for good things.</span>
        <a href={paths.login}>Already a member? Log in</a>
      </footer>
    </main>
  )
}

function App() {
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'

  if (currentPath === paths.login) return <AuthForm mode="login" />
  if (currentPath === paths.signup) return <AuthForm mode="signup" />
  if (currentPath === paths.forgot) return <AuthForm mode="forgot" />
  return <HomePage />
}

export default App
