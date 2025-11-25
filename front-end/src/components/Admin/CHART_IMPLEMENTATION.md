# Statistics Dashboard - Chart Implementation Guide

## 📊 Implemented Charts

### 1. **Summary Cards** (4 Cards)

- **Total Sales** - Hiển thị tổng doanh thu với biểu tượng tăng/giảm
- **Total Orders** - Tổng số đơn hàng với phần trăm tăng trưởng
- **Total Customers** - Tổng số khách hàng
- **Average Order Value** - Giá trị trung bình mỗi đơn hàng

### 2. **Sales Revenue** - Area Chart 📈

**Chart Type:** Area Chart (ApexCharts)

**Why Area Chart?**

- Hiển thị xu hướng doanh thu theo thời gian rất rõ ràng
- Gradient fill tạo visual appeal và dễ nhìn
- Smooth curve giúp theo dõi trend tốt hơn
- Phù hợp cho time-series data

**Features:**

- Gradient fill effect (opacity 0.4 → 0.1)
- Smooth curve interpolation
- Y-axis formatted as $XXk for readability
- Tooltip shows exact values
- Grid lines for better reading

**Colors:**

- Primary: `#8B7355` (Beige-700)
- Gradient opacity: 40% → 10%

### 3. **Orders by Status** - Donut Chart 🍩

**Chart Type:** Donut Chart (ApexCharts)

**Why Donut Chart?**

- Perfect for showing percentage distribution
- Center label shows total count
- Color-coded status categories
- Space-efficient and visually appealing
- Easy to compare proportions at a glance

**Features:**

- 70% donut size for optimal label space
- Center shows "Total Orders" with count
- Legend positioned at bottom
- Hover shows count + percentage
- No data labels on slices (cleaner look)

**Colors Mapping:**

- PENDING: `#EAB308` (Yellow)
- PROCESSING: `#3B82F6` (Blue)
- DELIVERED: `#10B981` (Green)
- CANCELLED: `#EF4444` (Red)
- RETURNED: `#F97316` (Orange)

### 4. **Top Products / Top Customers** - Horizontal Bar Chart 📊

**Chart Type:** Horizontal Bar Chart (ApexCharts)

**Why Horizontal Bar Chart?**

- Easy to read long product/customer names
- Clear comparison between items
- Data labels show exact values
- Ranking is visually obvious (top to bottom)
- Horizontal layout works better on wide screens

**Features:**

- **Toggle Switch:** Switch between Products and Customers view
- Horizontal bars with rounded corners (4px)
- Data labels showing dollar amounts
- Top 5 items only (focused insights)
- X-axis formatted as currency
- Hover tooltip with formatted values

**Toggle Implementation:**

```tsx
const [topView, setTopView] = useState<"products" | "customers">("products");
```

**Data Shown:**

- **Products:** Revenue from sales
- **Customers:** Total amount spent

**Colors:**

- Bar color: `#8B7355` (Beige-700)
- Text on bars: White
- Active toggle: Beige-700 bg with white text
- Inactive toggle: Beige-600 text

## 🎨 Color Palette

All charts follow the Bookverse brand colors:

```css
Primary: #8B7355 (Beige-700)
Text Heading: #3D3229
Text Body: #6B5E4C
Background: #F5F3F0
Border: #E5E1DC
```

## 📦 Dependencies

```json
{
  "apexcharts": "^3.46.0",
  "react-apexcharts": "^1.4.1"
}
```

## 🔧 Chart Configuration

### Area Chart Options

- **Toolbar:** Hidden for cleaner look
- **Stroke:** Smooth curve, 2px width
- **Fill:** Gradient (shade intensity: 1)
- **Grid:** Dashed lines (#F5F3F0)
- **Data Labels:** Disabled

### Donut Chart Options

- **Donut Size:** 70%
- **Legend:** Bottom position
- **Data Labels:** Disabled (cleaner)
- **Center Label:** Shows total count

### Bar Chart Options

- **Orientation:** Horizontal
- **Border Radius:** 4px
- **Data Labels:** Enabled, white text
- **Label Position:** Inside bars

## 📱 Responsive Design

All charts are responsive and adapt to screen size:

- Desktop (lg): 2-column grid for Revenue & Status charts
- Mobile: Single column layout
- Charts use percentage width (100%)
- Heights are fixed for consistency

## 🚀 Usage Example

```tsx
// Import
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

// Render
<ReactApexChart
  options={salesRevenueOptions}
  series={salesRevenueOptions.series}
  type="area"
  height={350}
/>;
```

## 💡 UX/UI Best Practices Applied

1. **Visual Hierarchy:**

   - Summary cards at top (most important metrics)
   - Charts below in logical order
   - Toggle for related data (Products/Customers)

2. **Color Consistency:**

   - Brand colors throughout
   - Meaningful status colors (Green=Success, Red=Cancelled, etc.)
   - Consistent text colors for accessibility

3. **Data Formatting:**

   - Currency formatted as `$X,XXX`
   - Large numbers shown as `$XXk`
   - Percentages rounded to 1 decimal

4. **Interactive Elements:**

   - Tooltips on hover
   - Toggle switch with clear active state
   - Time range selector (1W, 1M, 3M, 6M, 1Y)

5. **Information Density:**

   - Not overwhelming - focused on key metrics
   - Top 5 items only (not 10 or 20)
   - Clean spacing between elements

6. **Accessibility:**
   - Good contrast ratios
   - Readable font sizes (12px min)
   - Hover states for interactivity

## 🔄 Future Enhancements

Potential improvements:

- Add drill-down functionality on charts
- Export charts as images
- Real-time data updates
- Comparison with previous period
- Custom date range picker
- Filter by category/status
- Print-friendly dashboard view

## 📝 Notes

- Mock data is used for `salesByMonth` and growth percentages until backend provides real data
- Chart updates automatically when `topView` toggle changes
- All charts use the same font family: "Inter, sans-serif"
- Grid lines use 4px dash pattern for subtle appearance
