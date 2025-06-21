import { axiosAuthInstance, baseUrl } from "@/api/middlewares/axiosInstance";
import { QuestionFilters } from "@/types/Question";

class QuestionService {
    public getQuestions(page: number, limit: number, filters: QuestionFilters) {
        return axiosAuthInstance.post('/question/get?page=' + page + '&limit=' + limit, filters).then
            (res => res.data).catch(err => Promise.reject(err.response.data));
    }

    public addQuestion(question: any) {
        return axiosAuthInstance.post('/question/create', question).then
            (res => res.data).catch(err => Promise.reject(err.response.data));
    }

    public deleteQuestion(id: number) {
        return axiosAuthInstance.delete(`/question/${id}`).then
            (res => res.data).catch(err => Promise.reject(err.response.data));
    }

    public explainUsingAi(questionId: number) {
        return fetch(`${baseUrl}/question/ask-ai/${questionId}`, {
            method: 'POST',
            headers: {
                'Accept': 'text/event-stream',
            },
        });
    }

    public getTopics(type: string) {
        return axiosAuthInstance.get('/question/topics?type=' + type).then
            (res => res.data).catch(err => Promise.reject(err.response.data));
    }
}

export default new QuestionService();