import { axiosInstance } from "@/api/middlewares/axiosInstance";
import { axiosAuthInstance } from "@/api/middlewares/axiosInstance";

class UserService {
    login(regno: string, password: string) {
        return axiosInstance.post('/user/login', { regno, password }).then
            (res => res.data).catch(err => {
  const message = err?.response?.data?.message || "Something went wrong. Please try again.";
  return Promise.reject(new Error(message));
});
    }
    register(name: string, regno: string, trade: string, batch: string, password: string) {
        return axiosInstance.post('/user/register', { name, regno, trade, batch, password }).then
            (res => res.data).catch(err => {
  const message = err?.response?.data?.message || "Something went wrong. Please try again.";
  return Promise.reject(new Error(message));
});
    }
    verifySession() {
        return axiosAuthInstance.get('/user/verify-session').then
            (res => res.data).catch(err => Promise.reject(err.response.data));
    }
    sendOTP(regno: string) {
        return axiosInstance.get('/user/generate-otp/' + regno).then(res => res.data).catch(err => Promise.reject(err));
    }
    resetPassword(regno: string, otp: string, password: string) {
        return axiosInstance.post('/user/forgot-password', { regno, otp, password }).then(res => res.data).catch(err => Promise.reject(err));
    }
    getUserDashBoard() {
        return axiosAuthInstance.get('/user/dashboard').then(res => res.data).catch(err => Promise.reject(err));
    }
    updateAvatar(formData: FormData) {
        return axiosAuthInstance.post('/user/update-avatar', formData).then(res => res.data).catch(err => Promise.reject(err));
    }
    blockUsers(users: string[]) {
        return axiosAuthInstance.post('/user/block', { users }).then(res => res.data).catch(err => Promise.reject(err.response.data));
    }
    unblockUsers(users: string[]) {
        return axiosAuthInstance.post('/user/unblock', { users }).then(res => res.data).catch(err => Promise.reject(err.response.data));
    }
    getBlockedUsers(trade?: string) {
        return axiosAuthInstance.get('/user/blocked' + `${trade ? '?trade=' + trade : ''}`).then(res => res.data).catch(err => Promise.reject(err.response.data));
    }

    getJsprs(batch: string) {
        return axiosAuthInstance.get('/user/jsprs?batch=' + batch).then(res => res.data).catch(err => Promise.reject(err.response.data));
    }

    changePassword(regno: String, oldPassword: string, newPassword: string) {
        return axiosAuthInstance.post('/user/change-password', { regno, oldPassword, newPassword }).then(res => res.data).catch(err => Promise.reject(err.response.data));
    }

    editProfile(data: { mobile: string; email: string }) {
        return axiosAuthInstance.put('/user/edit-profile', data).then(res => res.data).catch(err => Promise.reject(err.response?.data || err));
    }
}

export default new UserService();