# Handling File Uploads

Guide to implementing file uploads in Jen.js.

## Simple File Upload

Create upload endpoint:

```typescript
// site/api/(upload).ts
import { writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { extname } from 'node:path';

export async function handle(req, res) {
  if (req.method === 'POST') {
    let chunks = [];
    let size = 0;
    
    req.on('data', chunk => {
      chunks.push(chunk);
      size += chunk.length;
      
      // Limit to 10MB
      if (size > 10 * 1024 * 1024) {
        req.pause();
        res.writeHead(413);
        res.end('File too large');
      }
    });
    
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const filename = `upload-${randomBytes(8).toString('hex')}`;
      const filepath = `./public/uploads/${filename}`;
      
      writeFileSync(filepath, buffer);
      
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        filename,
        url: `/uploads/${filename}`
      }));
    });
  }
}
```

## Multipart Form Data

Parse multipart uploads:

```typescript
// src/lib/upload.ts
export function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const boundary = req.headers['content-type']
      ?.split('boundary=')[1];
    
    let data = '';
    let file = null;
    
    req.on('data', chunk => {
      data += chunk.toString();
    });
    
    req.on('end', () => {
      // Parse boundary-separated data
      const parts = data.split(`--${boundary}`);
      
      const formData = {};
      let fileData = null;
      let filename = '';
      
      for (const part of parts) {
        if (part.includes('Content-Disposition: form-data')) {
          const nameMatch = /name="([^"]+)"/.exec(part);
          const filenameMatch = /filename="([^"]+)"/.exec(part);
          
          if (nameMatch && filenameMatch) {
            filename = filenameMatch[1];
            const contentStart = part.indexOf('\r\n\r\n') + 4;
            fileData = part.substring(contentStart).trim();
          } else if (nameMatch) {
            const name = nameMatch[1];
            const contentStart = part.indexOf('\r\n\r\n') + 4;
            const value = part.substring(contentStart).trim();
            formData[name] = value;
          }
        }
      }
      
      resolve({ formData, file: { filename, data: fileData } });
    });
    
    req.on('error', reject);
  });
}
```

Use it:

```typescript
import { parseMultipart } from '@src/lib/upload';

export async function handle(req, res) {
  if (req.method === 'POST') {
    try {
      const { formData, file } = await parseMultipart(req);
      
      // Save file
      writeFileSync(`./public/uploads/${file.filename}`, file.data);
      
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        filename: file.filename,
        fields: formData
      }));
    } catch (err) {
      res.writeHead(400);
      res.end('Upload failed');
    }
  }
}
```

## Upload Form

HTML form for uploading:

```typescript
// site/(upload).tsx
export default function UploadPage() {
  return (
    <html>
      <head>
        <title>Upload File</title>
      </head>
      <body>
        <h1>Upload File</h1>
        
        <form id="upload-form" action="/api/upload" method="POST">
          <input type="file" name="file" required />
          <button type="submit">Upload</button>
        </form>
        
        <div id="result"></div>
        
        <script>{`
          const form = document.getElementById('upload-form');
          const result = document.getElementById('result');
          
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            
            try {
              const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              });
              
              const data = await res.json();
              
              if (data.success) {
                result.innerHTML = \`
                  <p>Upload successful!</p>
                  <img src="\${data.url}" alt="Uploaded" />
                \`;
              }
            } catch (err) {
              result.innerHTML = '<p>Upload failed</p>';
            }
          });
        `}</script>
      </body>
    </html>
  );
}
```

## Image Processing

Process uploaded images:

```typescript
// Install: npm install sharp
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

export async function handle(req, res) {
  if (req.method === 'POST') {
    let chunks = [];
    
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        
        // Resize image
        const resized = await sharp(buffer)
          .resize(800, 600, { fit: 'inside' })
          .toBuffer();
        
        const filename = `image-${Date.now()}.jpg`;
        writeFileSync(`./public/uploads/${filename}`, resized);
        
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          url: `/uploads/${filename}` 
        }));
      } catch (err) {
        res.writeHead(400);
        res.end('Image processing failed');
      }
    });
  }
}
```

## Validation

Validate uploaded files:

```typescript
function validateFile(filename, size, mimeType) {
  // Check extension
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  
  if (!allowed.includes(ext)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // Check size (10MB limit)
  if (size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File too large' };
  }
  
  // Check MIME type
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];
  
  if (!allowedMimes.includes(mimeType)) {
    return { valid: false, error: 'Invalid MIME type' };
  }
  
  return { valid: true };
}

export async function handle(req, res) {
  if (req.method === 'POST') {
    const filename = req.headers['x-filename'];
    const size = parseInt(req.headers['content-length']);
    const mimeType = req.headers['content-type'];
    
    const validation = validateFile(filename, size, mimeType);
    
    if (!validation.valid) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: validation.error }));
      return;
    }
    
    // Process upload...
  }
}
```

## Database Storage

Store file metadata in database:

```typescript
// site/api/(upload).ts
import { getDB } from '@src/lib/db';

export async function handle(req, res) {
  if (req.method === 'POST') {
    let chunks = [];
    
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const filename = `${Date.now()}.jpg`;
        const filepath = `./public/uploads/${filename}`;
        
        writeFileSync(filepath, buffer);
        
        const db = getDB();
        const file = await db.insert('uploads', {
          filename,
          path: filepath,
          size: buffer.length,
          mime_type: 'image/jpeg',
          uploaded_at: new Date()
        });
        
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          id: file.id,
          url: `/uploads/${filename}`
        }));
      } catch (err) {
        res.writeHead(500);
        res.end('Upload failed');
      }
    });
  }
}
```

## Progress Tracking

Track upload progress on client:

```typescript
export default function UploadPage() {
  return (
    <html>
      <head><title>Upload with Progress</title></head>
      <body>
        <input type="file" id="file" />
        <progress id="progress" max="100"></progress>
        <div id="status"></div>
        
        <script>{`
          const fileInput = document.getElementById('file');
          const progress = document.getElementById('progress');
          const status = document.getElementById('status');
          
          fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                progress.value = percent;
                status.textContent = \`\${Math.round(percent)}%\`;
              }
            });
            
            xhr.addEventListener('load', () => {
              status.textContent = 'Upload complete!';
            });
            
            xhr.open('POST', '/api/upload');
            xhr.send(file);
          });
        `}</script>
      </body>
    </html>
  );
}
```

## Cleanup

Remove old uploads:

```typescript
// src/lib/cleanup.ts
import { unlink } from 'node:fs/promises';
import { getDB } from './db';

export async function cleanupOldUploads(days = 30) {
  const db = getDB();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const old = await db.find('uploads', {
    uploaded_at: { $lt: cutoff }
  });
  
  for (const file of old) {
    try {
      await unlink(file.path);
      await db.delete('uploads', { id: file.id });
    } catch (err) {
      console.error(`Failed to clean up ${file.filename}:`, err);
    }
  }
}
```

## Best Practices

1. Validate file types and size
2. Store metadata in database
3. Use random filenames to prevent collisions
4. Implement rate limiting
5. Scan for malware
6. Use CDN for serving files
7. Implement cleanup for old files
8. Track upload progress
9. Handle errors gracefully
10. Use HTTPS for uploads
