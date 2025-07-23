import type { NextApiRequest, NextApiResponse } from 'next';
import { DemoResponse } from '@shared/api';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<DemoResponse>
) {
  if (req.method === 'GET') {
    const response: DemoResponse = {
      message: 'Hello from Next.js API!'
    };
    res.status(200).json(response);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
