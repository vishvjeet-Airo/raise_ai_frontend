import type { NextApiRequest, NextApiResponse } from 'next';

interface PingResponse {
  status: string;
  timestamp: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PingResponse>
) {
  if (req.method === 'GET') {
    const response: PingResponse = {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
    res.status(200).json(response);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
