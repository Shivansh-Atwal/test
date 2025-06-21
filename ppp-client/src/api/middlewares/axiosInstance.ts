import axios from "axios";
import { AuthState } from "@/types/User";
import { getLocalAuth } from "@/helpers/local-auth";

const baseUrl:string = window.location.origin.includes('localhost')? "http://localhost:3000":"https://api.pppsliet.me";

const axiosInstance = axios.create(
    { baseURL:baseUrl }
)

const axiosAuthInstance = axios.create(
    { baseURL:baseUrl }
);

axiosAuthInstance.interceptors.request.use(
    (config) => {
        const auth:AuthState | null = getLocalAuth();
        if(auth){
            if (config.headers) {
                config.headers.Authorization = `Bearer ${auth.accessToken}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export {axiosInstance, axiosAuthInstance,baseUrl};
