import { createSlice } from "@reduxjs/toolkit";
import { DashboardData } from "@/types/dashboard";

const initialState: DashboardData = {
    userDetails: {
        regno: "",
        name: "",
        avatar: "",
        trade: null,
        batch: null,
    },
    testStats: {
        total_tests_taken: "",
        average_score: "",
    },
    lastTest: {
        test_id: 0,
        test_name: "",
        test_timestamp: "",
        duration: 0,
        score: 0,
        total_score: 0,
    },
    recentTests: [],
    topicAnalysis: [],
};

const userDashSlice = createSlice({
    name: "userDash",
    initialState,
    reducers: {
        setDashboardData: (_, action) => {
            return action.payload;
        },
    },
});

export const { setDashboardData } = userDashSlice.actions;
export default userDashSlice.reducer;