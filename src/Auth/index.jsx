import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [userLoggedIn, setUserLoggedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
            setUserLoggedIn(Boolean(user))
            setLoading(false)
        }, (error) => {
            console.error('Firebase authentication state could not be loaded.', error)
            setCurrentUser(null)
            setUserLoggedIn(false)
            setLoading(false)
        })
        return unsubscribe
    }, [])

    const value = {
        currentUser,
        userLoggedIn,
        loading,
    }
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
