import { axiosAuthInstance } from "@/api/middlewares/axiosInstance";

class DsaService {
    // Add DSA-related API methods here as needed
    getDsaSheets() {
        return axiosAuthInstance.get('/dsa/sheets').then(res => res.data).catch(err => Promise.reject(err.response?.data || err));
    }

    updateLeetcodeProfile(username: string) {
        return axiosAuthInstance.post('/dsa/leetcode', { username }).then(res => res.data).catch(err => Promise.reject(err.response?.data || err));
    }
}

const dsaService = new DsaService();
export default dsaService;
