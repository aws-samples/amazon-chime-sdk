import { useCallback, useEffect, useState } from 'react';
import { ListUsersInGroupCommand, UserType } from '@aws-sdk/client-cognito-identity-provider';
import { InvocationType, InvokeCommand, LogType } from '@aws-sdk/client-lambda';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import './CreateAppointment.css';
import { CognitoUser } from '../types';
import { CreateAppointmentFunctionEvent } from '../types/lambda';
import { useAuth } from '../providers/AuthProvider';
import { useAwsClient } from '../providers/AwsClientProvider';
import { useRoute } from '../providers/RouteProvider';
import Config from '../utils/Config';
import useMountedRef from '../hooks/useMountedRef';

export default function CreateAppointment(): JSX.Element {
  const { cognitoClient, lambdaClient } = useAwsClient();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(new Date());
  const [patients, setPatients] = useState<CognitoUser[]>([]);
  const [selectedPatientUsername, setSelectedPatientUsername] = useState<string>('');
  const { setRoute } = useRoute();
  const [loading, setLoading] = useState<boolean>(false);
  const mountedRef = useMountedRef();

  useEffect(() => {
    (async () => {
      try {
        const users: UserType[] = [];
        let nextToken: string | undefined;
        do {
          const data = await cognitoClient.send(
            new ListUsersInGroupCommand({
              UserPoolId: Config.CognitoUserPoolId,
              GroupName: Config.PatientUserPoolGroupName,
              NextToken: nextToken,
            })
          );
          users.push(...(data.Users || []));
          nextToken = data.NextToken;
        } while (nextToken);

        if (!mountedRef.current) {
          return false;
        }

        /**
         * Convert
         * Array: [{ Name: 'hello', value: 'example@email.com' }, { Name: 'email', value: 'example@email.com' }]
         * to
         * Object: { username: 'hello', email: 'example@email.com' }
         */
        setPatients(
          users.map<CognitoUser>((user: UserType) => {
            return {
              username: user.Username,
              attributes: user.Attributes?.reduce(
                (previous, current) => ({
                  ...previous,
                  [current.Name!]: current.Value,
                }),
                {}
              ),
            } as CognitoUser;
          })
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }, [cognitoClient, mountedRef]);

  const onChangePatient = useCallback(
    (event) => {
      setSelectedPatientUsername(event.target.value);
    },
    [setSelectedPatientUsername]
  );

  const onSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      try {
        setLoading(true);
        const patient = patients.find((patient: CognitoUser) => patient.username === selectedPatientUsername);
        if (!patient) {
          throw new Error(`Patient ${selectedPatientUsername} does not exist.`);
        }
        await lambdaClient.send(
          new InvokeCommand({
            FunctionName: Config.CreateAppointmentFunctionArn,
            InvocationType: InvocationType.RequestResponse,
            LogType: LogType.None,
            Payload: new TextEncoder().encode(
              JSON.stringify({
                doctorUsername: user.username,
                patientUsername: patient.username,
                timestamp: dayjs(startDate).second(0).millisecond(0).toISOString(),
              } as CreateAppointmentFunctionEvent)
            ),
          })
        );
        setRoute('AppointmentList');
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    },
    [
      lambdaClient,
      patients,
      selectedPatientUsername,
      setRoute,
      startDate,
      user,
    ]
  );

  const onClickAppointmentList = useCallback(() => {
    setRoute('AppointmentList');
  }, [setRoute]);

  const now = new Date();

  return (
    <div className="CreateAppointment">
      <form className="CreateAppointment__form" onSubmit={onSubmit}>
        <div className="CreateAppointment__dateContainer">
          <label>Date and time</label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date) => setStartDate(date)}
            showTimeSelect
            timeFormat="h:mm aa"
            timeIntervals={5}
            minDate={now}
            maxDate={dayjs(now).add(3, 'month').toDate()}
            dateFormat="MMMM d, yyyy h:mm aa"
            portalId="amazon-chime-sdk-date-picker"
          />
        </div>
        <div className="CreateAppointment__selectContainer">
          <label>Patient</label>
          <div className="CreateAppointment__selectAndArrow">
            <select className="CreateAppointment__select" value={selectedPatientUsername} onChange={onChangePatient}>
              <option value={''}>Choose your patient</option>
              {patients?.map((patient) => (
                <option key={patient.username} value={patient.username}>
                  {`${patient.attributes.name}`}
                </option>
              ))}
            </select>
            <div className="CreateAppointment__selectArrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.59 8.58984L12 13.1698L7.41 8.58984L6 9.99984L12 15.9998L18 9.99984L16.59 8.58984Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <div className="CreateAppointment__buttonContainer">
          <button type="submit" className="CreateAppointment__button" disabled={!selectedPatientUsername || loading}>
            {'Create an appointment'}
          </button>
        </div>
      </form>
      <div className="CreateAppointment__listButtonContainer">
        <button type="submit" className="CreateAppointment__listButton" onClick={onClickAppointmentList}>
          {'Back to appointments'}
        </button>
      </div>
    </div>
  );
}
