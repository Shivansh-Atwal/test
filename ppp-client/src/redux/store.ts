import { configureStore } from "@reduxjs/toolkit";
import aptitudeSlice from './slices/aptitude';
import authSlice from './slices/auth/index';
import { AuthState } from "@/types/User";
import userDashSlice from './userDash/index';
import { DashboardData } from "@/types/dashboard";

interface rootState {
    aptitude: {
        selectedQuestions: number[]
    },
    auth:AuthState,
    userDash: DashboardData
}

const store = configureStore({
    reducer: {
        aptitude: aptitudeSlice,
        auth:authSlice,
        userDash:userDashSlice,
    }
});

export type { rootState };
export default store;