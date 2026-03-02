# Chatbot Send Button Fix - Complete

## Issue Found

The chatbot send button is disabled and conversations cannot start because:

1. **WebSocket Connection State Not Updating**: The `isConnected` state in `useChatbot` hook is set to `true` on `connect` event, but the button checks this state before enabling
2. **Connection Timing Issue**: The socket connects but the state update might be delayed
3. **No Fallback**: If WebSocket fails, there's no HTTP fallback for sending messages
4. **No Visual Feedback**: User doesn't know why the button is disabled

## Root Cause

In `useChatbot.ts`:
```typescript
newSocket.on('connect', () => {
  console.log('Chatbot connected');
  setIsConnected(true); // This might not trigger re-render immediately
});
```

The button in `ChatbotWidget.tsx`:
```typescript
<button
  className="chatbot-send-btn"
  onClick={handleSend}
  disabled={!inputValue.trim() || !isConnected} // Blocked by isConnected
  aria-label="Send message"
  title={isConnected ? "Send message" : "Connecting to chatbot..."}
>
```

## Solution

### Fix 1: Add Connection Status Indicator
Show connection status in the header so users know when they can send messages.

### Fix 2: Improve Connection State Management
Ensure `isConnected` updates immediately when socket connects.

### Fix 3: Add Retry Logic
If connection fails, automatically retry with exponential backoff.

### Fix 4: Add HTTP Fallback
If WebSocket fails completely, fall back to HTTP API for sending messages.

## Implementation

Files to modify:
1. `src/renderer/hooks/useChatbot.ts` - Fix connection state management
2. `src/renderer/components/ChatbotWidget/ChatbotWidget.tsx` - Add connection indicator
3. `src/renderer/components/ChatbotWidget/ChatbotWidget.css` - Style connection indicator

---

**Status**: Implementing fixes now
**Priority**: Critical - Blocks all chatbot functionality
