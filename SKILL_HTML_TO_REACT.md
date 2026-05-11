# Skill: Convert HTML to React Components

**Prompt Template for Claude/Antigravity:**

```
Convert the following HTML file to a React component with Tailwind CSS styling.

**Input File:** [FILE_NAME].html (from public/)
**Output:** [FILE_NAME].tsx (in web/src/pages/)
**Target Style:** Dark glass theme (#061820 background, blur effects)
**Data Source:** Supabase + localStorage via SessionManager

## Requirements:

1. **Structure**
   - Keep the same layout and sections
   - Convert HTML elements to React JSX
   - Add TypeScript types for all props/state

2. **Styling**
   - Replace inline styles with Tailwind classes
   - Use glass-morphism effect: `bg-white/5 backdrop-blur-sm border border-white/10`
   - Dark theme: `bg-[#061820]` for main background
   - Buttons: Gradient or glass effect with hover states

3. **Interactivity**
   - Convert `onclick` handlers to React `onClick` events
   - Replace `localStorage` with SessionManager or Supabase
   - Add loading states and error handling
   - Use `react-hot-toast` for notifications

4. **Data Integration**
   - Load data on component mount with `useEffect`
   - Use Supabase SDK for database queries
   - Fall back to localStorage if needed
   - Handle async operations correctly

5. **Auth & Navigation**
   - Use `useSupabaseAuth()` for user context
   - Add Sidebar component for navigation
   - Implement logout button
   - Guard page with session check

6. **Responsive Design**
   - Use Tailwind grid/flex for layout
   - Mobile-first approach
   - Test on small screens

## Example Dark Theme Colors:
- Background: #061820
- Card: rgba(255, 255, 255, 0.05) with backdrop-blur
- Border: rgba(255, 255, 255, 0.1)
- Text: white or rgba(255, 255, 255, 0.7)
- Accent: #C9A84C (gold) or emerald-500 for action buttons

## File References:
- **HTML Source:** /home/user/lunomi/public/[FILE_NAME].html
- **Output Path:** /home/user/lunomi/web/src/pages/[FILE_NAME].tsx
- **Styles Guide:** /home/user/lunomi/web/src/index.css
- **Components:** /home/user/lunomi/web/src/components/
- **Context:** /home/user/lunomi/web/src/contexts/SupabaseAuthContext.tsx

## Conversion Checklist:
- [ ] All HTML elements converted to JSX
- [ ] TypeScript types defined
- [ ] Tailwind styling applied (no inline styles)
- [ ] onClick handlers working
- [ ] Data loading from correct source
- [ ] Toast notifications for feedback
- [ ] Error handling implemented
- [ ] Responsive design verified
- [ ] Auth guard implemented
- [ ] No console errors or warnings

## Start with:
1. Read the HTML file
2. Extract main sections/components
3. Create JSX structure
4. Add Tailwind styling
5. Implement data loading
6. Add interactivity
7. Test and polish
```

## Usage Examples:

### Example 1: Convert POS Page
```
Convert /home/user/lunomi/public/pos.html to React component.

This is the main POS interface with:
- Item grid/list for selecting products
- Shopping cart with quantity adjustment
- Payment methods selection
- Total calculation and checkout

Keep all functionality, apply dark glass theme, connect to Supabase orders table.
```

### Example 2: Convert Kitchen Display System
```
Convert /home/user/lunomi/public/kitchen.html to React component.

This is the kitchen order queue with:
- Order cards showing items and status
- Status buttons (pending → preparing → ready → done)
- Timer showing how long order has been waiting
- Real-time updates as orders change

Use Supabase subscriptions for real-time order updates, apply dark theme.
```

### Example 3: Convert Inventory Page
```
Convert /home/user/lunomi/public/inventory.html to React component.

This manages product inventory with:
- Product list with stock levels
- Add/Edit/Delete product forms
- Stock in/out transactions
- Low stock alerts

Connect to Supabase products table, use SessionManager for cache.
```

---

## Integration Steps

1. **After conversion**, add route to `web/src/main.tsx`:
   ```typescript
   import POS from './pages/POS';
   
   <Route path="/pos" element={<POS />} />
   ```

2. **Add to sidebar navigation** in `web/src/components/Sidebar.tsx`:
   ```typescript
   { label: 'POS', path: '/pos', icon: '🛒' }
   ```

3. **Build and test locally**:
   ```bash
   cd web && npm run dev
   ```

4. **Deploy to Vercel** (automatic on push to main)

---

## Common Patterns

### Data Loading with Supabase
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    const { data: result, error } = await supabase
      .from('table_name')
      .select('*');
    if (error) toast.error('Error loading data');
    setData(result);
    setLoading(false);
  };
  loadData();
}, []);
```

### Form Submission
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await supabase.from('table').insert([data]);
    toast.success('Saved successfully');
  } catch (error) {
    toast.error('Error saving data');
  }
  setLoading(false);
};
```

### Glass Card Component
```typescript
<div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
  {/* Content */}
</div>
```

---

## Tips for Antigravity/Claude

- Always read the HTML file first to understand structure
- Extract inline JavaScript to separate functions
- Use consistent naming: `handle` for events, `load` for data fetching
- Add proper TypeScript types, don't use `any`
- Test each component individually before integrating
- Use Tailwind utilities, minimize custom CSS
- Add loading skeletons for better UX
- Implement proper error boundaries
