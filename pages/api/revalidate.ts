import type { NextApiRequest, NextApiResponse } from 'next';
import { withSentry, captureException } from '@sentry/nextjs';

import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

import { Course } from '../../src/@types';

const SECRET = process.env.SANITY_WEBHOOK_SECRET ?? '';

if (SECRET === '') {
  throw new Error('Cannot read Sanity Webhook Secret!');
}

async function readBody(readable: NextApiRequest): Promise<string> {
  const chunks = [];

  // eslint-disable-next-line no-restricted-syntax
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

type SanityWebhookPayload = {
  _type: 'review';
  course: Pick<Course, 'code'>;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ revalidated: true } | { error: string }>,
) {
  const signature = req.headers[SIGNATURE_HEADER_NAME];

  if (typeof signature !== 'string') {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  try {
    const body = await readBody(req);

    if (!isValidSignature(body, signature, SECRET)) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    const payload = JSON.parse(body) as SanityWebhookPayload;
    await res.revalidate(`/courses/${payload.course.code}/reviews`);
    res.json({ revalidated: true });
  } catch (err) {
    res.status(500).json({ error: 'Error revalidating. Try again later.' });
    captureException(err);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default withSentry(handler);
