# Expense Reports - Quick Reference

## Access the Feature

Navigate to: **Expenses → Reports → New Report**

## Generate a Report

### Basic Report (All Expenses in Date Range)

1. Select **Start Date**
2. Select **End Date**
3. Click **"Generate Report"**

### Filtered Report (Category-Specific)

1. Select **Start Date** and **End Date**
2. Choose a **Category** from dropdown
3. Click **"Generate Report"**

### Filtered Report (Vendor-Specific)

1. Select **Start Date** and **End Date**
2. Enter **Vendor** name (partial match works)
3. Click **"Generate Report"**

### Combined Filters

- You can combine **Category** + **Vendor** filters
- All filters are optional except dates

## Understanding the Report

### Summary Cards

- **Total Amount** - Sum of all expenses in filter
- **Total Expenses** - Count of expenses found
- **Date Range** - Dates you selected
- **Active Filters** - Which filters are applied

### Category Breakdown

- Shows expenses grouped by category
- Progress bar indicates % of total
- Displays count per category
- Shows amount per category

### Detailed Table

- Lists all individual expenses
- Columns: Date, Description, Category, Vendor, Payment Method, Amount
- Sorted by date (newest first)

## Export to CSV

1. Generate a report first
2. Click **"Export CSV"** button
3. File downloads automatically
4. Filename: `expense-report-{start}-to-{end}.csv`

### CSV Contains:

- Date
- Description
- Category
- Vendor
- Amount
- Payment Method
- Receipt Number
- Notes

## Tips

### Date Selection

- **Default dates:** First day of current month to today
- **Best practice:** Start with monthly reports, then expand
- End date is inclusive (includes entire day)

### Category Filter

- Leave blank for "All categories"
- Use to analyze specific spending areas
- Example: "Travel" category for trip expenses

### Vendor Filter

- Case-insensitive search
- Partial matches work
- Example: "Amaz" matches "Amazon"

### Performance

- Reports generate instantly
- No limit on date range
- Backend uses efficient aggregations

## Common Use Cases

### Monthly Expense Summary

```
Start Date: 2024-01-01
End Date: 2024-01-31
Category: (all)
Vendor: (none)
```

### Travel Expenses YTD

```
Start Date: 2024-01-01
End Date: 2024-12-31
Category: Travel
Vendor: (none)
```

### Vendor Analysis

```
Start Date: 2024-01-01
End Date: 2024-03-31
Category: (all)
Vendor: "Amazon"
```

### Category Comparison

```
Step 1: Generate report with Category A
Step 2: Export CSV
Step 3: Generate report with Category B
Step 4: Export CSV
Step 5: Compare in spreadsheet
```

## Troubleshooting

### No Expenses Found

- **Check:** Date range includes expense dates
- **Check:** Filters aren't too restrictive
- **Check:** Expenses exist in database

### Export Not Working

- **Check:** Report was generated first
- **Check:** Browser allows downloads
- **Check:** Popup blocker disabled

### Wrong Data Showing

- **Check:** Correct workspace selected
- **Check:** Date range is correct
- **Check:** Filters are as intended

## Keyboard Shortcuts

- **Tab** - Navigate between form fields
- **Enter** - Submit form (generate report)
- **Escape** - Clear dropdown selections

## Mobile Usage

- Fully responsive design
- All features work on mobile
- Tables scroll horizontally
- Cards stack vertically

## Permissions

- **Required:** Authenticated user
- **Allowed:** All roles (OWNER, ADMIN, MANAGER, USER)
- **Data:** Only your company's expenses visible

## API Details

### Endpoint

```
POST /reports/expenses
```

### Request

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "categoryId": "optional-uuid",
  "vendor": "optional-string"
}
```

### Response

```json
{
  "summary": {
    "totalAmount": 15240.50,
    "totalExpenses": 42,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "expenses": [...],
  "categoryBreakdown": [...]
}
```

## Support

For issues or feature requests, contact your system administrator.
