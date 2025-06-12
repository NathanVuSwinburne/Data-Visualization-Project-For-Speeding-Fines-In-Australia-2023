# Road Safety Data Files

This folder contains datasets used for the Road Safety Dashboard 2023.

## Data Sources from the Australian Road Safety Data
[BITRE Road Safety Data (2024)](https://www.bitre.gov.au/publications/2024/road-safety-enforcement-data)

The data represents speeding fine information across Australia for the year 2023. It includes:

- Monthly trends
- Jurisdiction breakdowns
- Detection methods
- Age group distributions
- Location types

## Data Processing with KNIME

The raw data was processed using KNIME Analytics Platform to clean, transform, and prepare it for visualization. The workflow included:

### 1. Data Cleaning and Standardization
- Converted text-based dates to proper date/time format
- Standardized categorical values (e.g., "Red light camera" → "Fixed camera systems")
- Normalized location categories (e.g., "Major Cities of Australia" → "Urban area of Australia")

### 2. Handling Missing Values
- Replaced missing `AGE_GROUP` values with "Unknown"
- Replaced missing `FINES` with 0
- Removed irrelevant columns (`ARRESTS`, `CHARGES`)

### 3. Data Filtering
- Kept only 2023 data
- Focused on "speed_fines" in the `METRIC` column
- Excluded generic/aggregate rows

### KNIME Workflow

#### 1. Data Exploration & Cleaning
<div style="text-align: left;">
  <img src="assets\knime_workflow_part1.png" width="800" alt="KNIME workflow for initial data exploration and cleaning"/>
</div>

*Figure 1 – Initial data exploration and cleaning workflow in KNIME.*

This workflow focuses on:
- Loading and inspecting the raw dataset
- Identifying missing values and data types
- Initial data profiling and quality checks
- Basic filtering and cleaning steps

#### 2. Data Transformation & Export
<div style="text-align: left;">
  <img src="assets\knime_workflow_part2.png" width="800" alt="KNIME workflow for data transformation and export"/>
</div>

*Figure 2 – Data transformation and export workflow in KNIME.*

Key processing steps:
1. **Data Loading**
   - CSV Reader for raw enforcement data
   - Initial data type conversion

2. **Data Cleaning**
   - Row filtering (2023 data only)
   - Column selection and removal
   - Missing value handling
   - Data standardization

3. **Transformation**
   - Date/time parsing
   - Categorical value standardization
   - Feature engineering (e.g., month extraction)

4. **Export**
   - Final data validation
   - CSV export for web visualization


## Files

- `master_fine.csv` - Processed dataset ready for visualization
- `raw/` - Original dataset (if included)
- `knime_workflow.knwf` - KNIME workflow file (optional)

## Data Dictionary

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| YEAR | Integer | Year of enforcement | 2023 |
| JURISDICTION | String | State/Territory code | VIC, NSW, QLD |
| LOCATION | String | Geographic area type | Urban, Regional, Remote |
| AGE_GROUP | String | Offender age category | 17-24, 25-34, 35-44 |
| DETECTION_METHOD | String | Enforcement method | Fixed camera, Mobile camera, Police |
| FINES | Integer | Number of fines issued | 1500 |
| Month (Name) | String | Month of offense | JAN, FEB, MAR |