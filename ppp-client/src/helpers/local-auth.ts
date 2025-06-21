import { AuthState } from "@/types/User";

const setLocalAuth = (authState: AuthState) => {
    removeLocalAuth();
    localStorage.setItem('authState', JSON.stringify(authState));
    sessionStorage.setItem('authState', JSON.stringify(authState));
}

const getLocalAuth = () => {
    const session = localStorage.getItem('authState') || null;
    return session ? JSON.parse(session) : null;
}

const removeLocalAuth = () => {
    localStorage.removeItem('authState');
    sessionStorage.removeItem('authState');
}

export { setLocalAuth, getLocalAuth, removeLocalAuth };