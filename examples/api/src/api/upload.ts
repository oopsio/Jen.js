/**
 * File upload API (multipart form data)
 * POST /api/upload
 */

import type { ApiRequest, ApiResponse } from '../../../../src/api';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  // In a real app, you'd parse multipart form data
  // For this example, we assume req.body contains file info
  const { filename, size } = req.body;

  if (!filename) {
    return res.status(400).json({ error: 'Filename required' });
  }

  // Validate file
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (size && size > maxSize) {
    return res.status(413).json({ error: 'File too large' });
  }

  // Mock file save
  const uploadId = Math.random().toString(36).substring(7);

  res.status(200).json({
    message: 'File uploaded successfully',
    uploadId,
    filename,
    size,
    url: `/files/${uploadId}/${filename}`,
    uploadedAt: new Date().toISOString(),
  });
}

export const config = {
  bodyParser: {
    sizeLimit: '10mb', // Allow large file uploads
  },
  maxDuration: 60, // 60 second timeout for uploads
};
