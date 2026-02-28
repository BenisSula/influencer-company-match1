# Restart Backend Server - Apply Collaboration Request Fix

**Issue**: Backend code was fixed but server needs restart to apply changes  
**Solution**: Restart the backend server

## Quick Restart Commands

### Option 1: Stop and Start (Recommended)
```powershell
# Stop the backend server (press Ctrl+C in the terminal running it)
# Then start it again:
cd influencer-company-match1/backend
npm run start:dev
```

### Option 2: Find and Kill Process
```powershell
# Find the process
Get-Process -Name "node" | Where-Object {$_.Path -like "*influencer-company-match1*"}

# Kill it (replace PID with actual process ID)
Stop-Process -Id <PID> -Force

# Start backend again
cd influencer-company-match1/backend
npm run start:dev
```

### Option 3: Kill All Node Processes (Nuclear Option)
```powershell
# WARNING: This kills ALL node processes
Stop-Process -Name "node" -Force

# Start backend again
cd influencer-company-match1/backend
npm run start:dev
```

## What Was Fixed

The backend `createCollaborationRequest` method now:
- ✅ Safely handles missing budget field
- ✅ Validates message is provided
- ✅ Supports multiple data formats
- ✅ Won't crash on simple requests

## After Restart

Test the collaboration request:
1. Go to Matches page
2. Click "Request Collaboration" on any match
3. Enter a message
4. Click "Send Request"
5. Should see: "Collaboration request sent to [Name]!"

## If Still Not Working

Check the backend console for errors:
- Look for the startup message
- Check for any TypeScript compilation errors
- Verify the server is running on port 3000

## Verify Fix is Applied

After restart, the backend console should show:
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] MatchingModule dependencies initialized
```

When you send a collaboration request, you should see:
```
[MatchingService] Creating collaboration request
[MatchingService] Request data: { recipientId: '...', message: '...' }
```

No errors about "Cannot read property 'split' of undefined"!
