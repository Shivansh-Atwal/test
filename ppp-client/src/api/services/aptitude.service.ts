import { Aptitude } from "@/types/Aptitude";
import { axiosAuthInstance } from "../middlewares/axiosInstance";

class AptitudeService {
    public async getAptitudes() {
        return axiosAuthInstance.get('/aptitude').then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    public async createAptitude(apti: Aptitude) {
        return axiosAuthInstance.post('/aptitude/create', apti).then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    public async deleteAptitude(id: number) {
        return axiosAuthInstance.delete(`/aptitude/${id}`).then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    public async updateAptitude(apti: Aptitude) {
        return axiosAuthInstance.put(`/aptitude/${apti.id}`, apti).then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }
    public addQustionsToAptitude(aptiId: number, questionIds: number[]) {
        return axiosAuthInstance.put('/aptitude/add-questions/' + aptiId, { questionIds }).then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }
    public getUpcomingAptitudes() {
        return axiosAuthInstance.get('/aptitude/upcoming').then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    public getAptitudeQuestions(aptiId: number) {
        return axiosAuthInstance.get('/aptitude/' + aptiId).then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    public deleteQuestionFromApptitude(aptitudeId: number, questionId: number) {
        return axiosAuthInstance.post('/aptitude/question/delete', { aptitudeId, questionId }).then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    public getAptitudeResponses(aptitudeId: number, page: number, items: number) {
        return axiosAuthInstance.get(`/aptitude/responses/${aptitudeId}?page=${page}&items=${items}`).then(res => res.data).catch(err => Promise.reject(err));
    }

    public getAptitudeResult(aptitudeId: number, regno: string | null) {
        return axiosAuthInstance.get(`/aptitude/user/response/${aptitudeId}${regno ? '?regno=' + regno : ''}`).then(res => res.data).catch(err => Promise.reject(err));
    }

    // user routes 
    public getAptitudeForUser(data: {
        trade: string,
        regno: string,
    }, aptiId: any) {
        return axiosAuthInstance.post('/aptitude/appear/' + aptiId, data).then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    public submitAptitude(userData: { regno: string, trade: string }, aptitudeId: number, answers: {
        question_id: number;
        selected_option: number;
    }[]) {
        return axiosAuthInstance.post('/aptitude/submit/' + aptitudeId, { userData, answers }).then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    public getPastAptitudes() {
        return axiosAuthInstance.get('/aptitude/past').then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    public getToppers(aptitudeId: number) {
        return axiosAuthInstance.get('/aptitude/toppers/' + aptitudeId).then(res => res.data).catch(err => (Promise.reject(err.response.data)));
    }

    
}
export default new AptitudeService();