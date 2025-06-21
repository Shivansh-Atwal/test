interface User {
    regno:string,
    name:string,
    trade:string
    batch:string
}

interface AuthState {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isJspr: boolean;
    user: User | null;
    accessToken: string | null;
}

export type {User, AuthState};