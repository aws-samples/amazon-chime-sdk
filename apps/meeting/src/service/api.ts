import { AxiosClient } from "./apiClient";

const get = async (url: string): Promise<any> => {
    return await AxiosClient.get(url);
};

const post = async (url: string, params?: any, config?: any): Promise<any> => {
    return AxiosClient.post(url, params, config);
}

const put = async (url: string, params?: any): Promise<any> => {
    return AxiosClient.put(url, params);
}

const patch = async (url: string, params?: any): Promise<any> => {
    return AxiosClient.patch(url, params);
}

const del = async (url: string): Promise<any> => {
    return await AxiosClient.delete(url);
};

export {
    get as GET_API,
    post as POST_API,
    put as PUT_API,
    patch as PATCH_API,
    del as DELETE_API
}