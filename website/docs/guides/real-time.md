# Real-Time Features

Build real-time applications with Jen.js using Server-Sent Events and polling.

## Server-Sent Events

Stream data to client in real-time:

```typescript
// site/api/(events).ts
export async function handle(req, res) {
  if (req.method === 'GET') {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    
    // Send initial message
    res.write('data: Connected\n\n');
    
    // Send updates every second
    const interval = setInterval(() => {
      const data = {
        timestamp: new Date().toISOString(),
        value: Math.random()
      };
      
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }, 1000);
    
    // Cleanup on disconnect
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  }
}
```

Client-side:

```typescript
export default function RealtimePage() {
  return (
    <html>
      <head><title>Real-Time Events</title></head>
      <body>
        <h1>Live Data</h1>
        <div id="data"></div>
        
        <script>{`
          const eventSource = new EventSource('/api/events');
          const dataDiv = document.getElementById('data');
          
          eventSource.addEventListener('message', (e) => {
            try {
              const data = JSON.parse(e.data);
              dataDiv.innerHTML = \`
                <p>Time: \${data.timestamp}</p>
                <p>Value: \${data.value.toFixed(2)}</p>
              \`;
            } catch {
              dataDiv.textContent = e.data;
            }
          });
          
          eventSource.addEventListener('error', () => {
            eventSource.close();
          });
        `}</script>
      </body>
    </html>
  );
}
```

## Polling

Regular updates via HTTP:

```typescript
// site/api/(status).ts
import { getDB } from '@src/lib/db';

export async function handle(req, res) {
  if (req.method === 'GET') {
    const db = getDB();
    const status = await db.findOne('system_status', {});
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    
    res.end(JSON.stringify(status));
  }
}
```

Client-side polling:

```typescript
export default function StatusPage() {
  return (
    <html>
      <head><title>System Status</title></head>
      <body>
        <h1>Status</h1>
        <div id="status"></div>
        
        <script>{`
          async function updateStatus() {
            try {
              const res = await fetch('/api/status');
              const data = await res.json();
              
              document.getElementById('status').innerHTML = \`
                <p>Uptime: \${data.uptime}h</p>
                <p>Users: \${data.online_users}</p>
                <p>Memory: \${data.memory_usage}MB</p>
              \`;
            } catch (err) {
              console.error('Error fetching status', err);
            }
          }
          
          // Update every 5 seconds
          updateStatus();
          setInterval(updateStatus, 5000);
        `}</script>
      </body>
    </html>
  );
}
```

## WebSocket-Like Polling

Simulate bidirectional communication:

```typescript
// site/api/(messages).ts
const clients = new Map();
let messageId = 0;

export async function handle(req, res) {
  const clientId = req.headers['x-client-id'] || Date.now().toString();
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  
  if (req.method === 'GET') {
    // Fetch messages for client
    const messages = clients.get(clientId) || [];
    clients.set(clientId, []);
    
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ messages, clientId }));
  } else if (req.method === 'POST') {
    // Receive message from client
    let body = '';
    
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const message = JSON.parse(body);
      
      // Broadcast to other clients
      for (const [id, msgs] of clients.entries()) {
        if (id !== clientId) {
          msgs.push({
            id: messageId++,
            from: clientId,
            content: message.content,
            timestamp: new Date()
          });
        }
      }
      
      res.writeHead(200);
      res.end('OK');
    });
  }
}
```

Client-side chat:

```typescript
export default function ChatPage() {
  return (
    <html>
      <head><title>Chat</title></head>
      <body>
        <h1>Chat</h1>
        <div id="messages"></div>
        <input type="text" id="input" placeholder="Type message..." />
        <button id="send">Send</button>
        
        <script>{`
          let clientId = null;
          const messagesDiv = document.getElementById('messages');
          const input = document.getElementById('input');
          
          async function fetchMessages() {
            try {
              const res = await fetch('/api/messages', {
                headers: { 'x-client-id': clientId }
              });
              const data = await res.json();
              
              clientId = data.clientId;
              
              for (const msg of data.messages) {
                const div = document.createElement('div');
                div.textContent = \`\${msg.from}: \${msg.content}\`;
                messagesDiv.appendChild(div);
              }
            } catch (err) {
              console.error('Error fetching messages', err);
            }
          }
          
          async function sendMessage() {
            const content = input.value;
            if (!content) return;
            
            try {
              await fetch('/api/messages', {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                  'x-client-id': clientId
                },
                body: JSON.stringify({ content })
              });
              
              input.value = '';
              await fetchMessages();
            } catch (err) {
              console.error('Error sending message', err);
            }
          }
          
          document.getElementById('send').addEventListener('click', sendMessage);
          
          // Poll for messages
          fetchMessages();
          setInterval(fetchMessages, 1000);
        `}</script>
      </body>
    </html>
  );
}
```

## Activity Feed

Real-time activity notifications:

```typescript
// site/api/(activity).ts
export async function handle(req, res) {
  if (req.method === 'GET') {
    const db = getDB();
    const since = req.headers['if-modified-since'] || 
                  new Date(0).toISOString();
    
    const activities = await db.find('activities', {
      created_at: { $gt: new Date(since) }
    }, { sort: { created_at: -1 }, limit: 50 });
    
    res.writeHead(200, {
      'content-type': 'application/json',
      'last-modified': new Date().toUTCString()
    });
    
    res.end(JSON.stringify(activities));
  } else if (req.method === 'POST') {
    // Log activity
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const { type, userId, data } = JSON.parse(body);
      
      const db = getDB();
      await db.insert('activities', {
        type,
        user_id: userId,
        data: JSON.stringify(data),
        created_at: new Date()
      });
      
      res.writeHead(200);
      res.end('OK');
    });
  }
}
```

Client-side feed:

```typescript
export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  
  useEffect(() => {
    const fetchActivities = async () => {
      const lastCheck = localStorage.getItem('lastActivityCheck') || 
                       new Date(0).toISOString();
      
      const res = await fetch('/api/activity', {
        headers: { 'if-modified-since': lastCheck }
      });
      
      const data = await res.json();
      setActivities(data);
      localStorage.setItem('lastActivityCheck', new Date().toISOString());
    };
    
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h2>Activity Feed</h2>
      {activities.map(activity => (
        <div key={activity.id}>
          <p>{activity.type}</p>
          <small>{new Date(activity.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

1. Use SSE for one-way real-time updates
2. Use polling for low-frequency updates
3. Implement reconnection logic
4. Clean up connections on disconnect
5. Rate limit updates to avoid overload
6. Cache last state for recovery
7. Monitor connection health
8. Use exponential backoff for retries
9. Keep payloads small
10. Test with poor network conditions

## Performance Tips

1. Debounce frequent updates
2. Batch multiple changes
3. Use delta (only changed data) instead of full state
4. Implement server-side connection pooling
5. Monitor open connections
6. Implement timeouts for stale connections
7. Use compression for large messages
