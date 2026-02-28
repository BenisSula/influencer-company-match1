# Collaboration Request Complete Information Display - Fix Plan

## Issue Analysis

Based on the uploaded image and codebase investigation, the collaboration request system is **partially working** but has several issues:

### Current State
✅ **Working:**
- Basic collaboration request creation
- Connection storage in database
- Accept/Reject functionality
- Message sending on collaboration request

❌ **Issues Found:**
1. **Incomplete Information Display** - The Connections page doesn't show all collaboration request details
2. **Missing Fields** - Some fields from the modal aren't being saved or displayed
3. **Data Flow Inconsistencies** - Backend uses camelCase, frontend expects snake_case
4. **UI/UX Issues** - Information is not prominently displayed
5. **Missing Validation** - No proper validation for required fields

### What Should Be Displayed

According to the image, when viewing a collaboration request, users should see:
- ✅ Partner name and avatar
- ✅ Partner niche/industry
- ✅ Collaboration type (e.g., "Sponsored Post")
- ✅ Budget range (e.g., "$500 - $2000")
- ✅ Timeline (e.g., "2-4 weeks")
- ❌ **MISSING:** Deliverables
- ❌ **MISSING:** Platforms
- ❌ **MISSING:** Start/End dates
- ❌ **MISSING:** Project title
- ❌ **MISSING:** Additional notes/project description
- ✅ Message from requester
- ✅ Connected date
- ✅ Action buttons (Accept, Decline, View Profile, Message, Rate)

---

## Root Causes

### 1. **Backend Data Structure Issues**
```typescript
// Current DTO is missing fields
export class CreateCollaborationRequestDto {
  recipientId: string;
  message?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  deliverables?: string[];  // ✅ Defined but not always saved
  platforms?: string[];      // ✅ Defined but not always saved
  collaborationType?: CollaborationType;
  startDate?: string;        // ✅ Defined but not displayed
  endDate?: string;          // ✅ Defined but not displayed
  additionalNotes?: string;  // ✅ Defined but not displayed
  
  // ❌ MISSING:
  projectTitle?: string;     // Not in DTO
  projectDescription?: string; // Mapped to additionalNotes
}
```

### 2. **Frontend Modal Missing Fields**
The `CollaborationRequestModal.tsx` doesn't collect:
- Project title
- Deliverables (as array)
- Platforms (as array)
- Start date
- End date
- Project description (separate from message)

### 3. **Connections Page Display Issues**
The `Connections.tsx` page shows basic info but doesn't display:
- Deliverables list
- Platforms list
- Start/End dates
- Project title
- Additional notes

### 4. **Data Mapping Issues**
```typescript
// Backend saves as:
collaborationRequestData: {
  message, budgetMin, budgetMax, timeline,
  deliverables, platforms, collaborationType,
  startDate, additionalNotes
}

// Frontend expects both:
collaboration_request_data (snake_case)
collaborationRequestData (camelCase)
```

---

## Comprehensive Fix Plan

### Phase 1: Backend Enhancements ✅

#### 1.1 Update DTO to Include All Fields
**File:** `backend/src/modules/matching/dto/create-collaboration-request.dto.ts`

```typescript
export class CreateCollaborationRequestDto {
  @IsString()
  recipientId: string;

  @IsString()
  @IsNotEmpty()
  message: string;  // Make required

  // Project Information
  @IsOptional()
  @IsString()
  projectTitle?: string;  // NEW

  @IsOptional()
  @IsString()
  projectDescription?: string;  // NEW (separate from message)

  // Budget
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  // Timeline
  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Deliverables & Platforms
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  // Type
  @IsOptional()
  @IsEnum(CollaborationType)
  collaborationType?: CollaborationType;

  // Additional
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
```

#### 1.2 Update Entity Interface
**File:** `backend/src/modules/matching/entities/connection.entity.ts`

```typescript
export interface CollaborationRequestData {
  // Core
  message: string;
  
  // Project
  projectTitle?: string;
  projectDescription?: string;
  
  // Budget
  budgetMin?: number;
  budgetMax?: number;
  
  // Timeline
  timeline?: string;
  startDate?: string;
  endDate?: string;
  
  // Deliverables
  deliverables?: string[];
  platforms?: string[];
  
  // Type
  collaborationType?: CollaborationType;
  
  // Additional
  additionalNotes?: string;
}
```

#### 1.3 Update Service to Save All Fields
**File:** `backend/src/modules/matching/matching.service.ts`

Update `createCollaborationRequest` method to save all fields:

```typescript
connection.collaborationRequestData = {
  message: dto.message.trim(),
  projectTitle: dto.projectTitle,
  projectDescription: dto.projectDescription,
  budgetMin,
  budgetMax,
  timeline: dto.timeline,
  startDate: dto.startDate,
  endDate: dto.endDate,
  deliverables: dto.deliverables,
  platforms: dto.platforms,
  collaborationType: dto.collaborationType,
  additionalNotes: dto.additionalNotes,
};
```

---

### Phase 2: Frontend Modal Enhancements 🔧

#### 2.1 Update CollaborationRequestModal Component
**File:** `src/renderer/components/CollaborationRequestModal/CollaborationRequestModal.tsx`

Add missing form fields:

```typescript
const [projectTitle, setProjectTitle] = useState('');
const [projectDescription, setProjectDescription] = useState('');
const [deliverables, setDeliverables] = useState<string[]>([]);
const [platforms, setPlatforms] = useState<string[]>([]);
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [additionalNotes, setAdditionalNotes] = useState('');

// Add to form:
<div className="form-group">
  <label htmlFor="projectTitle">Project Title</label>
  <input
    type="text"
    id="projectTitle"
    value={projectTitle}
    onChange={(e) => setProjectTitle(e.target.value)}
    placeholder="e.g., Summer Product Launch Campaign"
  />
</div>

<div className="form-group">
  <label htmlFor="projectDescription">Project Description</label>
  <textarea
    id="projectDescription"
    value={projectDescription}
    onChange={(e) => setProjectDescription(e.target.value)}
    placeholder="Describe the project goals, target audience, and expected outcomes..."
    rows={3}
  />
</div>

// Deliverables multi-select
<div className="form-group">
  <label>Deliverables</label>
  <div className="checkbox-group">
    {['Instagram Post', 'Instagram Story', 'TikTok Video', 'YouTube Video', 'Blog Post', 'Product Review'].map(item => (
      <label key={item}>
        <input
          type="checkbox"
          checked={deliverables.includes(item)}
          onChange={(e) => {
            if (e.target.checked) {
              setDeliverables([...deliverables, item]);
            } else {
              setDeliverables(deliverables.filter(d => d !== item));
            }
          }}
        />
        {item}
      </label>
    ))}
  </div>
</div>

// Platforms multi-select
<div className="form-group">
  <label>Platforms</label>
  <div className="checkbox-group">
    {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn'].map(platform => (
      <label key={platform}>
        <input
          type="checkbox"
          checked={platforms.includes(platform)}
          onChange={(e) => {
            if (e.target.checked) {
              setPlatforms([...platforms, platform]);
            } else {
              setPlatforms(platforms.filter(p => p !== platform));
            }
          }}
        />
        {platform}
      </label>
    ))}
  </div>
</div>

// Date range
<div className="form-row">
  <div className="form-group">
    <label htmlFor="startDate">Start Date</label>
    <input
      type="date"
      id="startDate"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>
  <div className="form-group">
    <label htmlFor="endDate">End Date</label>
    <input
      type="date"
      id="endDate"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>
</div>

<div className="form-group">
  <label htmlFor="additionalNotes">Additional Notes</label>
  <textarea
    id="additionalNotes"
    value={additionalNotes}
    onChange={(e) => setAdditionalNotes(e.target.value)}
    placeholder="Any other requirements or information..."
    rows={2}
  />
</div>
```

Update submit handler:

```typescript
const requestData: any = {
  recipientId,
  message: message.trim(),
  projectTitle: projectTitle || undefined,
  projectDescription: projectDescription || undefined,
  collaborationType,
  budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
  budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
  timeline: timeline || undefined,
  startDate: startDate || undefined,
  endDate: endDate || undefined,
  deliverables: deliverables.length > 0 ? deliverables : undefined,
  platforms: platforms.length > 0 ? platforms : undefined,
  additionalNotes: additionalNotes || undefined,
};
```

---

### Phase 3: Connections Page Display Enhancements 🎨

#### 3.1 Update Connections.tsx to Show All Information
**File:** `src/renderer/pages/Connections.tsx`

Enhance the collaboration request card:

```typescript
<div className="collaboration-request-detail-card">
  {/* Header with avatar and name - EXISTING */}
  <div className="collaboration-request-header">
    <Avatar src={partner?.avatarUrl} name={partner?.name || 'Unknown'} size="lg" />
    <div className="collaboration-request-header-info">
      <h4>{partner?.name || 'Unknown User'}</h4>
      <p>{partner?.niche || partner?.industry || 'No niche specified'}</p>
    </div>
  </div>

  {/* Project Title - NEW */}
  {data.projectTitle && (
    <div className="collaboration-project-title">
      <h5>📋 {data.projectTitle}</h5>
    </div>
  )}

  {/* Main Details Grid */}
  <div className="collaboration-request-details">
    {/* Collaboration Type */}
    {data.collaborationType && (
      <div className="collaboration-detail-item">
        <span className="collaboration-detail-label">Type:</span>
        <span className="collaboration-detail-value collaboration-type-badge">
          {data.collaborationType.replace(/_/g, ' ')}
        </span>
      </div>
    )}

    {/* Budget */}
    {data.budgetMin && data.budgetMax && (
      <div className="collaboration-detail-item">
        <span className="collaboration-detail-label">💰 Budget:</span>
        <span className="collaboration-detail-value collaboration-budget-value">
          ${data.budgetMin.toLocaleString()} - ${data.budgetMax.toLocaleString()}
        </span>
      </div>
    )}

    {/* Timeline */}
    {data.timeline && (
      <div className="collaboration-detail-item">
        <span className="collaboration-detail-label">⏰ Timeline:</span>
        <span className="collaboration-detail-value">{data.timeline}</span>
      </div>
    )}

    {/* Date Range - NEW */}
    {(data.startDate || data.endDate) && (
      <div className="collaboration-detail-item">
        <span className="collaboration-detail-label">📅 Duration:</span>
        <span className="collaboration-detail-value">
          {data.startDate && new Date(data.startDate).toLocaleDateString()}
          {data.startDate && data.endDate && ' - '}
          {data.endDate && new Date(data.endDate).toLocaleDateString()}
        </span>
      </div>
    )}

    {/* Platforms - NEW */}
    {data.platforms && data.platforms.length > 0 && (
      <div className="collaboration-detail-item collaboration-detail-full-width">
        <span className="collaboration-detail-label">📱 Platforms:</span>
        <div className="collaboration-platforms-list">
          {data.platforms.map((platform: string) => (
            <span key={platform} className="platform-badge">{platform}</span>
          ))}
        </div>
      </div>
    )}

    {/* Deliverables - NEW */}
    {data.deliverables && data.deliverables.length > 0 && (
      <div className="collaboration-detail-item collaboration-detail-full-width">
        <span className="collaboration-detail-label">📦 Deliverables:</span>
        <ul className="collaboration-deliverables-list">
          {data.deliverables.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    )}
  </div>

  {/* Project Description - NEW */}
  {data.projectDescription && (
    <div className="collaboration-project-description">
      <span className="collaboration-detail-label">📝 Project Description:</span>
      <p className="collaboration-description-text">{data.projectDescription}</p>
    </div>
  )}

  {/* Message */}
  {data.message && (
    <div className="collaboration-message">
      <span className="collaboration-detail-label">💬 Message:</span>
      <p className="collaboration-message-text">{data.message}</p>
    </div>
  )}

  {/* Additional Notes - NEW */}
  {data.additionalNotes && (
    <div className="collaboration-additional-notes">
      <span className="collaboration-detail-label">📌 Additional Notes:</span>
      <p className="collaboration-notes-text">{data.additionalNotes}</p>
    </div>
  )}

  {/* Action Buttons - EXISTING */}
  <div className="collaboration-request-actions">
    <Button variant="primary" onClick={() => handleAcceptCollaboration(request.id)}>
      ✓ Accept Collaboration
    </Button>
    <Button variant="secondary" onClick={() => handleRejectCollaboration(request.id)}>
      ✕ Decline
    </Button>
  </div>

  {/* Footer Actions - EXISTING */}
  <div className="collaboration-request-footer">
    <Button variant="secondary" size="sm" onClick={() => handleViewProfile(partner.id)}>
      View Profile
    </Button>
    <Button variant="secondary" size="sm" onClick={() => handleSendMessage(request)}>
      Send Message
    </Button>
    <Button variant="primary" size="sm" onClick={() => handleRateConnection(request)}>
      ⭐ Rate Partner
    </Button>
  </div>
</div>
```

---

### Phase 4: CSS Enhancements 🎨

#### 4.1 Update Connections.css
**File:** `src/renderer/pages/Connections.css`

Add new styles:

```css
/* Project Title */
.collaboration-project-title {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.collaboration-project-title h5 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

/* Full width detail items */
.collaboration-detail-full-width {
  grid-column: 1 / -1;
}

/* Platforms */
.collaboration-platforms-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.platform-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #E3F2FD;
  color: #1976D2;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Deliverables */
.collaboration-deliverables-list {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.collaboration-deliverables-list li {
  margin: 0.25rem 0;
  color: #424242;
  font-size: 0.9375rem;
}

/* Project Description */
.collaboration-project-description {
  margin: 1rem 0;
  padding: 1rem;
  background: #F5F5F5;
  border-left: 4px solid #2196F3;
  border-radius: 4px;
}

.collaboration-description-text {
  margin: 0.5rem 0 0;
  color: #424242;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Additional Notes */
.collaboration-additional-notes {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  background: #FFF3E0;
  border-left: 4px solid #FF9800;
  border-radius: 4px;
}

.collaboration-notes-text {
  margin: 0.5rem 0 0;
  color: #424242;
  font-size: 0.9375rem;
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .collaboration-request-details {
    grid-template-columns: 1fr;
  }
  
  .collaboration-platforms-list {
    justify-content: flex-start;
  }
}
```

#### 4.2 Update Modal CSS
**File:** `src/renderer/components/CollaborationRequestModal/CollaborationRequestModal.css`

Add styles for new fields:

```css
/* Checkbox groups */
.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-group label:hover {
  background: #F5F5F5;
  border-color: #2196F3;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"]:checked + span {
  font-weight: 600;
  color: #2196F3;
}

/* Form sections */
.form-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #FAFAFA;
  border-radius: 8px;
}

.form-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #424242;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Date inputs */
input[type="date"] {
  padding: 0.75rem;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-family: inherit;
}

input[type="date"]:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}
```

---

### Phase 5: Data Flow Validation & Testing 🧪

#### 5.1 Add Logging
Add comprehensive logging to track data flow:

**Backend:**
```typescript
console.log('[MatchingService] Creating collaboration request:', {
  requesterId,
  recipientId: dto.recipientId,
  hasProjectTitle: !!dto.projectTitle,
  hasDeliverables: !!dto.deliverables?.length,
  hasPlatforms: !!dto.platforms?.length,
  hasStartDate: !!dto.startDate,
  fullData: dto
});
```

**Frontend:**
```typescript
console.log('[CollaborationRequestModal] Submitting request:', {
  recipientId,
  hasProjectTitle: !!projectTitle,
  deliverablesCount: deliverables.length,
  platformsCount: platforms.length,
  hasDateRange: !!(startDate && endDate),
  fullData: requestData
});
```

#### 5.2 Create Test Script
**File:** `test-collaboration-request-complete.js`

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testCompleteCollaborationRequest() {
  try {
    // 1. Login as company
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'techstartup@example.com',
      password: 'password123'
    });
    
    const token = loginRes.data.access_token;
    
    // 2. Get matches to find an influencer
    const matchesRes = await axios.get(`${API_URL}/matching/matches`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const influencer = matchesRes.data[0];
    
    // 3. Send complete collaboration request
    const requestData = {
      recipientId: influencer.id,
      message: 'Hi! I love your content and would like to collaborate.',
      projectTitle: 'Summer Product Launch Campaign',
      projectDescription: 'We are launching a new eco-friendly product line and need authentic influencer partnerships.',
      collaborationType: 'sponsored_post',
      budgetMin: 500,
      budgetMax: 2000,
      timeline: '2-4 weeks',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      deliverables: ['Instagram Post', 'Instagram Story', 'TikTok Video'],
      platforms: ['Instagram', 'TikTok'],
      additionalNotes: 'Please include our brand hashtag #EcoFriendly2026'
    };
    
    const requestRes = await axios.post(
      `${API_URL}/matching/collaboration-requests`,
      requestData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Collaboration request created:', requestRes.data);
    
    // 4. Login as influencer and check received requests
    const influencerLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'sarah@example.com',
      password: 'password123'
    });
    
    const influencerToken = influencerLoginRes.data.access_token;
    
    const receivedRes = await axios.get(
      `${API_URL}/matching/collaboration-requests/received`,
      { headers: { Authorization: `Bearer ${influencerToken}` } }
    );
    
    console.log('✅ Received requests:', JSON.stringify(receivedRes.data, null, 2));
    
    // 5. Verify all fields are present
    const request = receivedRes.data[0];
    const data = request.collaboration_request_data || request.collaborationRequestData;
    
    console.log('\n📋 Verification:');
    console.log('  ✓ Project Title:', data.projectTitle || '❌ MISSING');
    console.log('  ✓ Project Description:', data.projectDescription || '❌ MISSING');
    console.log('  ✓ Message:', data.message || '❌ MISSING');
    console.log('  ✓ Budget:', data.budgetMin && data.budgetMax ? `$${data.budgetMin}-$${data.budgetMax}` : '❌ MISSING');
    console.log('  ✓ Timeline:', data.timeline || '❌ MISSING');
    console.log('  ✓ Date Range:', data.startDate && data.endDate ? `${data.startDate} to ${data.endDate}` : '❌ MISSING');
    console.log('  ✓ Deliverables:', data.deliverables?.length || '❌ MISSING');
    console.log('  ✓ Platforms:', data.platforms?.length || '❌ MISSING');
    console.log('  ✓ Additional Notes:', data.additionalNotes || '❌ MISSING');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteCollaborationRequest();
```

---

## Implementation Checklist

### Backend ✅
- [ ] Update `CreateCollaborationRequestDto` with all fields
- [ ] Update `CollaborationRequestData` interface
- [ ] Update `createCollaborationRequest` service method
- [ ] Add validation for required fields
- [ ] Test with Postman/curl

### Frontend Modal 🔧
- [ ] Add project title field
- [ ] Add project description field
- [ ] Add deliverables multi-select
- [ ] Add platforms multi-select
- [ ] Add start/end date pickers
- [ ] Add additional notes field
- [ ] Update submit handler
- [ ] Add form validation
- [ ] Test modal submission

### Connections Page 🎨
- [ ] Display project title
- [ ] Display project description
- [ ] Display deliverables list
- [ ] Display platforms badges
- [ ] Display date range
- [ ] Display additional notes
- [ ] Update CSS for new elements
- [ ] Test responsive layout

### Testing 🧪
- [ ] Create test script
- [ ] Test complete data flow
- [ ] Verify all fields save correctly
- [ ] Verify all fields display correctly
- [ ] Test accept/reject functionality
- [ ] Test on mobile devices

---

## Expected Result

After implementing all fixes, the Connections page will display:

```
┌─────────────────────────────────────────────────────────┐
│  [Avatar] TechStartup Inc                               │
│           Technology                                     │
│                                                          │
│  📋 Summer Product Launch Campaign                      │
│                                                          │
│  Type: Sponsored Post                                   │
│  💰 Budget: $500 - $2,000                               │
│  ⏰ Timeline: 2-4 weeks                                 │
│  📅 Duration: 03/01/2026 - 03/31/2026                   │
│                                                          │
│  📱 Platforms: [Instagram] [TikTok]                     │
│                                                          │
│  📦 Deliverables:                                       │
│     • Instagram Post                                    │
│     • Instagram Story                                   │
│     • TikTok Video                                      │
│                                                          │
│  📝 Project Description:                                │
│  We are launching a new eco-friendly product line...    │
│                                                          │
│  💬 Message:                                            │
│  Hi! I love your content and would like to collaborate. │
│                                                          │
│  📌 Additional Notes:                                   │
│  Please include our brand hashtag #EcoFriendly2026      │
│                                                          │
│  [✓ Accept Collaboration] [✕ Decline]                   │
│                                                          │
│  [View Profile] [Send Message] [⭐ Rate Partner]        │
│                                                          │
│  Connected 2/14/2026                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Priority Order

1. **HIGH PRIORITY** - Backend DTO and service updates (data must be saved)
2. **HIGH PRIORITY** - Frontend modal fields (data must be collected)
3. **MEDIUM PRIORITY** - Connections page display (data must be shown)
4. **MEDIUM PRIORITY** - CSS styling (make it look good)
5. **LOW PRIORITY** - Testing and validation

---

## Estimated Time

- Backend updates: 30 minutes
- Frontend modal: 1 hour
- Connections page: 1 hour
- CSS styling: 30 minutes
- Testing: 30 minutes

**Total: ~3.5 hours**

---

## Notes

- All changes are backward compatible
- Existing collaboration requests will still work
- New fields are optional to avoid breaking existing flows
- The system gracefully handles missing data
