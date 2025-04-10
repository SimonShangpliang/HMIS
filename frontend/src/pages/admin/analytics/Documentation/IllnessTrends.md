<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Detailed Documentation of IllnessTrends Component

## Component Overview

The `IllnessTrends` component implements a comprehensive disease surveillance system for monitoring and analyzing illness patterns across the hospital. It provides dual-perspective analysis through two interconnected modules: Individual Disease Tracking and Top K Diseases Analysis. Rather than just displaying static statistics, it offers interactive charts with drill-down capabilities that allow healthcare administrators and epidemiologists to identify temporal patterns in disease prevalence at both monthly and weekly granularity, while also providing comparative analysis of the most common illnesses.

## State Management

The component maintains several state variables organized by their functional purpose:

```jsx
// Disease selection states
const [selectedDisease, setSelectedDisease] = useState("");
const [diseases, setDiseases] = useState([]);

// Individual disease trend states
const [trendStartDate, setTrendStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
const [trendEndDate, setTrendEndDate] = useState(new Date());
const [diseaseData, setDiseaseData] = useState(null);
const [activeTab, setActiveTab] = useState("monthly");
const [selectedMonth, setSelectedMonth] = useState(null);

// Top K diseases analysis states
const [topKStartDate, setTopKStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
const [topKEndDate, setTopKEndDate] = useState(new Date());
const [kValue, setKValue] = useState(5);
const [topKData, setTopKData] = useState([]);
const [viewType, setViewType] = useState("chart");

// UI state
const [loading, setLoading] = useState(true);
```

The data flow is controlled by four primary `useEffect` hooks:

```jsx
// Fetch diseases list on component mount
useEffect(() =&gt; {
  fetchDiseases();
}, []);

// Set initial selected disease when list loads
useEffect(() =&gt; {
  if (diseases.length &gt; 0 &amp;&amp; !selectedDisease) {
    setSelectedDisease(diseases[^0].id);
  }
}, [diseases]);

// Fetch disease trend data when parameters change
useEffect(() =&gt; {
  if (selectedDisease) {
    fetchDiseaseTrends();
  }
}, [selectedDisease, trendStartDate, trendEndDate]);

// Fetch top K diseases when parameters change
useEffect(() =&gt; {
  if (diseases.length &gt; 0) {
    fetchTopKDiseases();
  }
}, [topKStartDate, topKEndDate, kValue, diseases]);
```

This design creates a cascade of data loading: first the diseases list, then initial disease selection, and finally the specific analysis data based on user parameters. The separate effect hooks ensure that each data segment refreshes only when its relevant parameters change.

## Data Fetching Implementation

### Disease List Retrieval

The `fetchDiseases` function retrieves the list of available diseases for analysis:

```jsx
const fetchDiseases = async () =&gt; {
  try {
    setLoading(true);
    // API call to fetch diseases list
    // Implementation details...
  } catch (error) {
    console.error("Error fetching diseases:", error);
    setLoading(false);
  }
};
```

This function sets the loading state during the request and populates the diseases dropdown upon success. The returned data includes disease identifiers and names, which are essential for subsequent operations.

### Disease Trends Retrieval

The `fetchDiseaseTrends` function retrieves comprehensive trend data for a specific disease over a selected date range:

```jsx
const fetchDiseaseTrends = async () =&gt; {
  try {
    setLoading(true);
    // API call to fetch disease trends data
    // Implementation details...
  } catch (error) {
    console.error("Error fetching disease trends:", error);
    setLoading(false);
  }
};
```

On the server side, this performs a multi-dimensional aggregation that:

1. Matches consultations for the specified disease within the date range
2. Groups data by month, calculating case counts
3. Further aggregates weekly data for each month
4. Computes age distribution statistics
5. Calculates total cases across the period

The resulting data structure contains:

- Disease details (id and name)
- Monthly trend data (labels and values)
- Weekly data organized by month
- Age distribution statistics
- Total case count


### Top K Diseases Retrieval

The `fetchTopKDiseases` function retrieves prevalence data for the most common diseases:

```jsx
const fetchTopKDiseases = async () =&gt; {
  try {
    setLoading(true);
    // API call to fetch top K diseases
    // Implementation details...
  } catch (error) {
    console.error("Error fetching top K diseases:", error);
    setLoading(false);
  }
};
```

The server-side aggregation for top diseases:

1. Counts consultations by disease within the specified date range
2. Sorts diseases by occurrence count in descending order
3. Limits results to the specified K value
4. Calculates percentage distribution for each disease
5. Returns the ranked list with count and percentage metrics

## Chart Data Preparation and Interaction

### Chart Data Formatting

The component prepares specialized datasets for each chart type:

```jsx
// Monthly trend chart data
const monthlyChartData = {
  labels: diseaseData?.monthlyData.labels || [],
  datasets: [
    {
      label: `${diseases.find(d =&gt; d.id === selectedDisease)?.name || 'Disease'} Cases (Monthly)`,
      data: diseaseData?.monthlyData.values || [],
      backgroundColor: "rgba(59, 130, 246, 0.5)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 2,
    },
  ],
};
```

Similar structures are created for:

- Weekly trend data
- Age distribution data
- Top K diseases comparison

Each dataset includes appropriate labels, data points, and visual styling parameters optimized for the specific chart type (bar, line, or pie).

### Interactive Drill-Down Implementation

The component implements interactive drill-down through a click handler:

```jsx
const handleBarClick = (_, elements) =&gt; {
  if (elements &amp;&amp; elements.length &gt; 0) {
    const monthIndex = elements[^0].index;
    const monthName = diseaseData.monthlyData.labels[monthIndex];
    setSelectedMonth(monthName);
    setActiveTab("weekly");
  }
};
```

This function:

1. Identifies which month bar was clicked
2. Extracts the month name from the data labels
3. Sets the selected month in state
4. Switches the view from monthly to weekly
5. Triggers a re-render with the detailed weekly data

This implementation allows users to explore seasonal patterns at different time scales without requiring page navigation.

### Chart Configuration

The charts are configured with a comprehensive options object:

```jsx
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top" },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      padding: 10,
      cornerRadius: 6,
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0, 0, 0, 0.05)" },
    },
  },
};
```

These options create a consistent visual style while optimizing user experience through:

- Responsive sizing that adapts to container dimensions
- Clear tooltips for detailed data point information
- Streamlined grid presentation for better readability
- Proper scaling from zero for accurate visual comparison


## Tab Management and View Transitions

The component implements a tab system to toggle between monthly and weekly views:

```jsx
{activeTab === "monthly" ? (
  <div>
    &lt;Bar data={monthlyChartData} options={{...chartOptions, onClick: handleBarClick}} height={300} /&gt;
  </div>
) : (
  <div>
    &lt;Bar data={weeklyChartData} options={chartOptions} height={300} /&gt;
  </div>
)}
```

The active tab controls which chart is rendered through conditional rendering. When drilling down from monthly to weekly view, a back button appears:

```jsx
{activeTab === "weekly" &amp;&amp; selectedMonth &amp;&amp; (
  <div>
    &lt;button
      onClick={() =&gt; setActiveTab("monthly")}
      className="text-blue-500 flex items-center"
    &gt;
      &lt;FaChartLine className="mr-1" /&gt; Back to Monthly View
    &lt;/button&gt;
    <h3>
      Weekly Breakdown for {selectedMonth}
    </h3>
  </div>
)}
```

This approach provides intuitive navigation between different temporal resolutions.

## Date Range Selection

The component implements date range selection through DatePicker components:

```jsx
<div>
  <div>
    &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;
      Start Date
    &lt;/label&gt;
    &lt;DatePicker
      selected={trendStartDate}
      onChange={(date) =&gt; setTrendStartDate(date)}
      className="form-input rounded border p-2 w-full"
      dateFormat="MMMM d, yyyy"
    /&gt;
  </div>
  <div>
    &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;
      End Date
    &lt;/label&gt;
    &lt;DatePicker
      selected={trendEndDate}
      onChange={(date) =&gt; setTrendEndDate(date)}
      className="form-input rounded border p-2 w-full"
      dateFormat="MMMM d, yyyy"
    /&gt;
  </div>
</div>
```

This implementation:

1. Provides labeled date pickers for start and end dates
2. Updates state when dates change
3. Triggers new data fetching through the useEffect dependency array
4. Maintains separate date ranges for individual disease trends and top K analysis

## Disease Selection Implementation

The component implements disease selection through a dropdown:

```jsx
<div>
  &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;
    Select Disease
  &lt;/label&gt;
  &lt;select
    value={selectedDisease}
    onChange={(e) =&gt; setSelectedDisease(e.target.value)}
    className="form-select rounded border p-2 w-full"
  &gt;
    {diseases.map((disease) =&gt; (
      &lt;option key={disease.id} value={disease.id}&gt;
        {disease.name}
      &lt;/option&gt;
    ))}
  &lt;/select&gt;
</div>
```

This approach:

1. Dynamically generates options from the fetched diseases list
2. Triggers data refresh when selection changes
3. Provides a user-friendly interface for switching between diseases

## Top K Diseases Configuration

The component provides controls for configuring the top diseases analysis:

```jsx
<div>
  <div>
    &lt;label className="block text-sm font-medium text-gray-700 mb-1"&gt;
      Top diseases:
    &lt;/label&gt;
    &lt;select
      value={kValue}
      onChange={(e) =&gt; setKValue(parseInt(e.target.value))}
      className="form-select rounded border p-2"
    &gt;
      {[3, 5, 10, 15].map((k) =&gt; (
        &lt;option key={k} value={k}&gt;
          {k}
        &lt;/option&gt;
      ))}
    &lt;/select&gt;
  </div>
  {/* Date pickers and view toggle */}
</div>
```

This implementation allows users to:

1. Select how many top diseases to display (3, 5, 10, or 15)
2. Configure date range for the analysis
3. Toggle between chart and card views for the results

## Visualization Toggles

The component implements a view toggle for top K diseases:

```jsx
<div>
  &lt;button
    onClick={() =&gt; setViewType("chart")}
    className={`px-2 py-1 rounded-l ${
      viewType === "chart" ? "bg-blue-500 text-white" : "bg-gray-200"
    }`}
  &gt;
    &lt;FaChartPie className="mr-1" /&gt; Chart
  &lt;/button&gt;
  &lt;button
    onClick={() =&gt; setViewType("cards")}
    className={`px-2 py-1 rounded-r ${
      viewType === "cards" ? "bg-blue-500 text-white" : "bg-gray-200"
    }`}
  &gt;
    &lt;FaVirus className="mr-1" /&gt; Cards
  &lt;/button&gt;
</div>
```

This toggle:

1. Changes the visualization style between a pie chart and card layout
2. Updates the UI with appropriate styling for the active view
3. Preserves the same underlying data while changing the presentation format

## Loading State Management

The component implements a loading spinner for data fetching operations:

```jsx
const Loader = () =&gt; (
  <div>
    <div></div>
  </div>
);

// Usage in render function
{loading ? (
  &lt;Loader /&gt;
) : (
  // Content rendering
)}
```

This provides visual feedback during data operations and prevents user interaction with stale or incomplete data.

## Summary Statistics Display

The component shows summary statistics for the selected disease and date range:

```jsx
<div>
  Total of {diseaseData.totalCases} cases recorded between{" "}
  {trendStartDate.toLocaleDateString()} and {trendEndDate.toLocaleDateString()}
</div>
```

This implementation:

1. Displays the total case count across the period
2. Shows the exact date range for context
3. Provides immediate insights without requiring chart interpretation

## Age Distribution Analysis

The component implements age distribution analysis using a pie chart:

```jsx
<div>
  <h3>Age Distribution</h3>
  <div>
    &lt;Pie data={ageDistributionChartData} options={{ maintainAspectRatio: false }} /&gt;
  </div>
</div>
```

This visualization:

1. Segments patients into age groups (0-18, 19-35, 36-50, 51-65, 65+)
2. Uses color coding to distinguish different age ranges
3. Provides tooltips with exact counts on hover
4. Helps identify vulnerable populations for targeted interventions

## Top K Diseases Visualization

The component provides two visualization options for top diseases:

```jsx
{viewType === "chart" ? (
  <div>
    &lt;Pie data={topKChartData} options={{ maintainAspectRatio: false }} height={300} /&gt;
  </div>
) : (
  <div>
    {topKData.map((disease) =&gt; (
      <div>
        <h3>{disease.name}</h3>
        <div>
          <span>{disease.count}</span>
          <span>{disease.percentage.toFixed(1)}%</span>
        </div>
        <div>
          <div></div>
        </div>
      </div>
    ))}
  </div>
)}
```

This implementation:

1. Provides a pie chart view for proportional comparison
2. Alternatively offers a card-based view with progress bars
3. Shows both absolute counts and percentage values
4. Allows for different visualization preferences

## Main Processing Flow

The complete data processing flow consists of:

1. Initial loading of the disease list when component mounts
2. Selection of default disease for trend analysis
3. Fetching trend data based on selected parameters
4. Transforming API response data into chart-compatible formats
5. Rendering appropriate charts based on current view (monthly/weekly)
6. Enabling user interaction through clicks for drill-down
7. Displaying summary statistics for quick insights
8. Simultaneously retrieving and rendering top K diseases data

This pipeline provides a comprehensive disease surveillance system with multiple analytical perspectives.

## Rendering Logic

The component's rendering follows a hierarchical structure:

1. Page header and description
2. Individual disease trend analysis:
    - Disease selection and date range controls
    - Loading indicator during data fetching
    - Monthly or weekly chart based on active tab
    - Age distribution visualization
    - Summary statistics
3. Top K diseases analysis:
    - Configuration controls (K value, date range, view type)
    - Chart or card visualization based on preference

Each section is conditionally rendered based on data availability and user selections, providing a clean and focused interface.

This component provides hospital epidemiologists and administrators with powerful tools to analyze disease patterns, identify outbreaks, monitor seasonal trends, and allocate resources effectively based on empirical disease prevalence data.
