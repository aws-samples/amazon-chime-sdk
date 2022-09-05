import axios from 'axios';
import { LOCAL_STORAGE_ITEM_KEYS } from '../utils/enums';
import { GetFromLocalStorage } from '../utils/helpers/localStorageHelper';

const axiosClient = axios.create({
    baseURL: "",
    headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": `Bearer ${GetFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.TOKEN)}`
    }
});

// Interceptors can be implemented as needed
// axiosClient.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         return error;
//     }
// );
// 
// axiosClient.interceptors.request.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         return error;
//     }
// );

export {
    axiosClient as AxiosClient
};