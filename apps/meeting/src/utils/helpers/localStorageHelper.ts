// This file contains action that can be performed on localStorage

const DEFAULT_EXPIRY_TIME_IN_SECONDS = 600;
const DEFAULT_EXPIRY_TIME_IN_MS = DEFAULT_EXPIRY_TIME_IN_SECONDS * 1000;

const setToLocalStorage = (key: string, params: any, ttl?: number | null) => {

    const now = new Date()

	// `item` is an object which contains the original value
	// as well as the time when it's supposed to expire
    ttl = ttl ? ttl : DEFAULT_EXPIRY_TIME_IN_MS;
	const item = {
		value: params,
		expiry: now.getTime() + ttl,
	}

    if(localStorage && key.length > 0 && item.value)
        localStorage.setItem(key, JSON.stringify(item))
}

const getFromLocalStorage = (key: string) => {

    const itemStr = localStorage.getItem(key)
	// if the item doesn't exist, return null
	if (!itemStr) {
		return null
	}
	const item = JSON.parse(itemStr)
	const now = new Date()
	// compare the expiry time of the item with the current time
	if (now.getTime() > item.expiry) {
		// If the item is expired, delete the item from storage
		// and return null
		localStorage.removeItem(key)
		return null
	}
	return item.value
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