# 📖 Admin Pagination - Quick Reference Guide

## 🎯 Quick Overview

Pagination has been implemented for AdminUsers and AdminReviews pages to display 20 items per page with smooth navigation.

## 📦 Component Location

```
src/renderer/components/Pagination/
├── Pagination.tsx    # Main component
└── Pagination.css    # Styles
```

## 🚀 Usage Example

```typescript
import { Pagination } from '../../components/Pagination/Pagination';

const MyComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      {/* Render paginatedItems */}
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={items.length}
      />
    </>
  );
};
```

## 🎨 Features

✅ **Smart Page Display**
- Shows up to 5 page numbers
- Uses ellipsis (...) for large page counts
- Always shows first and last page

✅ **Navigation**
- Previous/Next buttons
- Direct page number clicking
- Disabled states for boundaries

✅ **User Feedback**
- "Showing X to Y of Z items"
- Active page highlighting
- Smooth scroll to top

✅ **Responsive**
- Mobile-friendly design
- Touch-optimized buttons
- Adaptive layout

## 📊 Current Implementation

### AdminUsers Page
- **Location:** `src/renderer/pages/admin/AdminUsers.tsx`
- **Items per page:** 20
- **Features:** Search integration, auto-reset on search

### AdminReviews Page
- **Location:** `src/renderer/pages/admin/AdminReviews.tsx`
- **Items per page:** 20
- **Features:** Feature toggle, stats display

## 🔧 Configuration

### Change Items Per Page
```typescript
const ITEMS_PER_PAGE = 20; // Change this value
```

### Customize Scroll Behavior
```typescript
const handlePageChange = (page: number) => {
  setCurrentPage(page);
  window.scrollTo({ 
    top: 0, 
    behavior: 'smooth' // or 'auto' for instant
  });
};
```

## 🎨 Styling Customization

The pagination uses CSS variables for easy theming:

```css
.pagination-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change gradient colors here */
}
```

## 📱 Responsive Breakpoints

```css
@media (max-width: 768px) {
  /* Mobile styles */
  .pagination-button {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }
}
```

## 🧪 Testing Checklist

- [ ] Navigate between pages
- [ ] Click Previous/Next buttons
- [ ] Click specific page numbers
- [ ] Test with < 20 items (no pagination)
- [ ] Test with exactly 20 items (1 page)
- [ ] Test with 21+ items (multiple pages)
- [ ] Test search reset functionality
- [ ] Test on mobile devices
- [ ] Verify item count accuracy

## 🐛 Common Issues

### Pagination Not Showing
- Check if `totalPages > 1`
- Verify items array has data
- Ensure condition: `{items.length > 0 && <Pagination />}`

### Wrong Item Count
- Verify `totalItems` prop is correct
- Check `itemsPerPage` matches constant
- Ensure filtered data is used

### Page Not Resetting
- Add useEffect for search term changes:
```typescript
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm]);
```

## 🚀 Future Enhancements

- [ ] Server-side pagination (API-level)
- [ ] Items-per-page selector (10, 20, 50, 100)
- [ ] Jump to page input
- [ ] Keyboard navigation (arrow keys)
- [ ] URL parameter sync
- [ ] Loading states between pages

## 📞 Need Help?

Refer to:
- `ADMIN-PHASE2-STEP2.1-PAGINATION-COMPLETE.md` - Full implementation details
- `ADMIN-DASHBOARD-COMPREHENSIVE-INVESTIGATION-AND-IMPLEMENTATION-PLAN.md` - Overall plan

---

**Quick Start:** Copy the Pagination component and follow the usage example above!
