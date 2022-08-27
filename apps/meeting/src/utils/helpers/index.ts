// This file will contain helper functions for UI
import { GetFromLocalStorage } from './localStorageHelper'
import {LOCAL_STORAGE_ITEM_KEYS} from '../enums/index'
import { MeetingObject } from '../interfaces';

const extractMeetingIdAndUsernameFromURL = (url: string): MeetingObject => {
    let [path, searchParams] = url.split('?');
    let urlArr = path.split('/');
    const meetingId = urlArr[urlArr.length - 1];
    const query = new URLSearchParams(searchParams);
    let meetingObjectFromURL = {
        meetingId: meetingId,
        userName: query.get('username')??"",
        userType: query.get('usertype')??"",
    }
    return meetingObjectFromURL;
}

const isMeetingObjectPresentInLocalStorage = (): boolean => {
    return GetFromLocalStorage(LOCAL_STORAGE_ITEM_KEYS.MEETING_OBJECT) === "" ? false : true;
};

export {
    extractMeetingIdAndUsernameFromURL as ExtractMeetingIdAndUsernameFromURL,
    isMeetingObjectPresentInLocalStorage as IsMeetingObjectPresentInLocalStorage
}