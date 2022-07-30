import RestException from 'twilio/lib/base/RestException';
import twilioClient from './client';

const VERIFY_SERVICE_SID = 'VA8fe01f6ccca6c198aaaf592da51ad99c';

export enum SendCodeResponse {
  SUCCESS,
  INVALID_EMAIL,
  MAX_ATTEMPTS_REACHED,
}

export async function sendCodeToUser(
  username: string,
): Promise<SendCodeResponse> {
  const email = `${username}@gatech.edu`;

  try {
    // https://www.twilio.com/docs/verify/email
    await twilioClient.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications.create({ to: email, channel: 'email' });

    return SendCodeResponse.SUCCESS;
  } catch (error: unknown) {
    if (error instanceof RestException) {
      switch (error.code) {
        case 60200: // https://www.twilio.com/docs/api/errors/60200
          return SendCodeResponse.INVALID_EMAIL;
        case 60203: // https://www.twilio.com/docs/api/errors/60203
          return SendCodeResponse.MAX_ATTEMPTS_REACHED;
        default:
          throw error;
      }
    } else {
      throw error;
    }
  }
}

export enum VerifyCodeResponse {
  SUCCESS,
  NO_MATCH,
  NOT_FOUND,
}

export async function doesUserCodeMatch(
  username: string,
  code: string,
): Promise<VerifyCodeResponse> {
  const email = `${username}@gatech.edu`;

  try {
    // https://www.twilio.com/docs/verify/api/verification-check
    const verificationCheck = await twilioClient.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: email, code });

    // Unfortunately, `status` is typed only as string, but the API docs give us
    // more clarity on the expected values.
    // > The status of the verification. Can be: pending, approved, or canceled.
    if (verificationCheck.status === 'approved') {
      return VerifyCodeResponse.SUCCESS;
    }

    return VerifyCodeResponse.NO_MATCH;
  } catch (error: unknown) {
    if (error instanceof RestException) {
      if (error.status === 404) {
        return VerifyCodeResponse.NOT_FOUND;
      }
    }

    throw error;
  }
}
