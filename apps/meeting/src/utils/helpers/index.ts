// This file will contain helper functions for UI
import { GetFromLocalStorage, RemoveFromLocalStorage } from './localStorageHelper'
import {LOCAL_STORAGE_ITEM_KEYS, USER_TYPES} from '../enums/index'
import { IMeetingObject } from '../interfaces';

// match a string to a particular user type
const getUserType = (userStr: string): USER_TYPES => {
    switch(userStr) {
        case USER_TYPES.STUDENT: 
            return USER_TYPES.STUDENT;
        case USER_TYPES.TEACHER:
            return USER_TYPES.TEACHER;
        case USER_TYPES.ADMIN:
            return USER_TYPES.ADMIN;
        default:
            return USER_TYPES.STUDENT;
    };
}

// extract details like {meetingId, userName, userType} from url
const extractMeetingIdAndUsernameFromURL = (url: string): IMeetingObject => {
    let [path, searchParams] = url.split('?');
    let urlArr = path.split('/');
    const meetingId: string = urlArr[urlArr.length - 1];
    const query = new URLSearchParams(searchParams);
    const userName: string = query.get('username')??"";
    const userType = getUserType(query.get('usertype')??"");
    const meetingObjectFromURL = {
        meetingId, userName, userType
    }
    return meetingObjectFromURL;
}

// remove meeting related state from localStorage
const clearMeetingsFromLocalStorage = (): void => {
    RemoveFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.JOIN_INFO);
    RemoveFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.LOCAL_MEETING_ID);
    RemoveFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.MEETING_OBJECT);
    RemoveFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.MEETING_JOINED);
};
// to check if a meeting object is present in local storage
const isMeetingObjectPresentInLocalStorage = (): boolean => {
    return GetFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.MEETING_OBJECT) === "" ? false : true;
};

export {
    extractMeetingIdAndUsernameFromURL as ExtractMeetingIdAndUsernameFromURL,
    isMeetingObjectPresentInLocalStorage as IsMeetingObjectPresentInLocalStorage,
    clearMeetingsFromLocalStorage as ClearMeetingsFromLocalStorage
}