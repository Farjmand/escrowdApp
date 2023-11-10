import type { NextApiRequest, NextApiResponse } from 'next';
import nftsData from '../../../public/nft.json';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(nftsData);
}