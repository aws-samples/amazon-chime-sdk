// TODO: Take in a Device or a VideoTransformDevice instead of just a deviceId.
export const isOptionActive = (
  meetingManagerDeviceId: string | null,
  currentDeviceId: string
): boolean => {
  return currentDeviceId === meetingManagerDeviceId;
};