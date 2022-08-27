// This file contains action that can be performed on localStorage

const setToLocalStorage = (key: string, params: any) => {
    if(localStorage && key.length > 0 && params)
        localStorage.setItem(key, JSON.stringify(params))
}

const getFromLocalStorage = (key: string) => {
    if(localStorage && key.length > 0)
        return localStorage.getItem(key);
}

const removeFromLocalStorage = (key: string) => {
    if(localStorage && key.length > 0)
        localStorage.removeItem(key);
}

const clearLocalStorage = () => {
    if(localStorage)
        localStorage.clear();
}


export {
    setToLocalStorage as SetToLocalStorage,
    getFromLocalStorage as GetFromLocalStorage,
    removeFromLocalStorage as RemoveFromLocalStorage,
    clearLocalStorage as ClearLocalStorage
}