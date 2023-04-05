import json
import xmltodict
import boto3
import pandas as pd
import uuid
import dateutil.parser
import os
import logging

log = logging.getLogger()
log.setLevel(logging.INFO)

SERVICE_TYPE = 'VoiceConnector'
DETAIL_TYPE = 'AmazonChimeVoiceConnectorStreamingStatus'
RECORDING_END_TAG = '</recording>'


def extract_participant_stream_map(siprec_metadata):
    recording = siprec_metadata.get('recording', None)
    if not recording:
        log.warning('recording not found')
        return
    participant_stream_association = recording.get('participantstreamassoc', None)
    if not participant_stream_association:
        log.warning('participant stream association not found')
        return
    if type(participant_stream_association) != list:
        log.warning('participant stream association is not expected type')
        return
    participant_map = {}
    for participant_data in participant_stream_association:
        participant_id = participant_data.get('@participant_id', None)
        if not participant_id:
            log.warning('participant is missing @participant_id')
            continue
        send_stream = participant_data.get('send')
        if send_stream is None:
            log.warning('participant is missing send stream')
            continue
        participant_map[participant_id] = send_stream

    return participant_map


def extract_session_id(siprec_metadata):
    recording = siprec_metadata.get('recording', None)
    if not recording:
        log.warning('recording element is missing')
        return
    session = recording.get('session', None)
    if not session:
        log.warning('session element is missing')
        return
    return session.get('@session_id', None)


def format_to_parquet(payload):
    df = pd.DataFrame.from_dict(payload, orient='index').T
    return df.to_parquet()


def write_to_s3(bucket_name, date, payload):
    s3 = boto3.client('s3')
    key = f'amazon_chime_sdk_call_analytics/serviceType={SERVICE_TYPE}/detailType={DETAIL_TYPE}/year={date.year}/month={date.strftime("%m")}/day={date.strftime("%d")}/{int(date.timestamp())}_{uuid.uuid4()}.parquet'
    result = s3.put_object(
        Body=payload,
        Bucket=bucket_name,
        Key=key,
    )
    log.info(result)


def parse_siprec(siprec):
    end_tag = siprec.rfind(RECORDING_END_TAG)
    if end_tag < 0:
        log.error('Could not find end recording tag')
        raise RuntimeError('Error parsing siprec metadata')

    siprec = siprec[:end_tag + len(RECORDING_END_TAG)].strip()
    try:
        return xmltodict.parse(siprec)
    except Exception as e:
        log.error('Error parsing siprec metadata', exc_info=e)
        raise RuntimeError('Error parsing siprec metadata')


def lambda_handler(event, context):
    detail_type = event['detail-type']
    if detail_type != 'Chime VoiceConnector Streaming Status':
        log.debug('Detail type does not match, skipping event')
        return
    detail = event['detail']
    if 'siprecMetadata' not in detail:
        log.warning('event has no siprecMetadata, exiting')
        return
    siprec_metadata = detail['siprecMetadata']

    try:
        siprec_dict = parse_siprec(siprec_metadata)
    except Exception as e:
        log.error('Error parsing siprec metadata', exc_info=e)
        raise RuntimeError('Error parsing siprec metadata')
    session_id = extract_session_id(siprec_dict)
    participants = extract_participant_stream_map(siprec_dict)
    results = {
        'serviceType': SERVICE_TYPE,
        'detailType': DETAIL_TYPE,
        'voiceConnectorId':  detail['voiceConnectorId'],
        'transactionId': detail['transactionId'],
        'callId': detail['callId'],
        'startTime': detail.get('startTime', None),
        'endTime': detail.get('endTime', None),
        'sessionId': session_id,
        'siprecMetadata': json.dumps(siprec_dict),
    }
    for i, participant in enumerate(participants.keys()):
        results[f'participant{i + 1}'] = participant
        results[f'stream{i + 1}'] = participants[participant]

    try:
        parquet_data = format_to_parquet(results)
    except Exception as e:
        log.error('Error converting to parquet', exc_info=e)
        raise RuntimeError('Error converting to parquet')
    if 'S3BucketName' not in os.environ:
        log.error('Destination s3 bucket is not specified')
        raise RuntimeError('Destination S3 bucket is not specified')
    s3_destination = os.environ['S3BucketName']
    try:
        write_to_s3(s3_destination, dateutil.parser.isoparse(event['time']), parquet_data)
    except Exception as e:
        log.error('Error writing to s3', exc_info=e)
        raise RuntimeError('Error writing to s3')
    return {
        'statusCode': 200,
        'body': json.dumps(results)
    }
