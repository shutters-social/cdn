import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import type { DidDocument } from './atproto';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'eu-west-2',
});
const docClient = DynamoDBDocumentClient.from(client);

const DID_CACHE_TABLE = process.env.AWS_DID_CACHE_TABLE;
const CID_CACHE_TABLE = process.env.AWS_CID_CACHE_TABLE;

export const getCachedDidDoc = async (did: string) => {
  const res = await docClient.send(
    new GetCommand({
      TableName: DID_CACHE_TABLE,
      Key: { did: did },
    }),
  );

  if (!res.Item) return null;

  return JSON.parse(res.Item.doc) as DidDocument;
};

export const setCachedDidDoc = async (didDoc: DidDocument) => {
  await docClient.send(
    new PutCommand({
      TableName: DID_CACHE_TABLE,
      Item: {
        did: didDoc.id,
        doc: JSON.stringify(didDoc),
        expiresAt: expiresIn(4),
      },
    }),
  );
};

const blobVerificationKey = (did: string, pdsUrl: string, cid: string) => ({
  did,
  key: `${pdsUrl}:${cid}`,
});

export const getCachedBlobVerification = async (
  pdsUrl: string,
  did: string,
  cid: string,
) => {
  const res = await docClient.send(
    new GetCommand({
      TableName: CID_CACHE_TABLE,
      Key: blobVerificationKey(did, pdsUrl, cid),
    }),
  );

  if (!res.Item) return null;

  return JSON.parse(res.Item.verified) as boolean;
};

export const setCachedBlobVerification = async (
  pdsUrl: string,
  did: string,
  cid: string,
  verified: boolean,
) => {
  await docClient.send(
    new PutCommand({
      TableName: CID_CACHE_TABLE,
      Item: {
        ...blobVerificationKey(did, pdsUrl, cid),
        verified,
        expiresAt: expiresIn(168),
      },
    }),
  );
};

const SECONDS_IN_AN_HOUR = 60 * 60;
const expiresIn = (hours: number) => {
  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  return secondsSinceEpoch + hours * SECONDS_IN_AN_HOUR;
};
