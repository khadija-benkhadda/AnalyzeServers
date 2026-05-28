# IP Reputation Analysis Application

## Overview

This application provides a focused solution for analyzing IP reputation scores from uploaded Excel files. It allows for granular filtering by entity and multi-select for servers, and displays the analysis in a comprehensive, server-centric dashboard.

## Features

- **File Upload:** A user-friendly interface to upload multiple Excel files.
- **Advanced Filtering:**
  - **Entity Filter:** A dropdown menu to select an entity.
  - **Multi-Server Filter:** A multi-select dropdown with checkboxes to select one or more servers within the selected entity, including a "Select All" option.
- **Immersive Analysis Dashboard:**
  - **Full-Page Layout:** The dashboard utilizes a full-page layout to provide a detailed, side-by-side analysis of a single server, with the chart on one side and an interactive table on the other.
  - **Server Buttons:** Selected servers are displayed as buttons, allowing for easy navigation between different servers' analysis views.
  - **Interactive Pie Chart:** Clicking on a segment of the pie chart (e.g., "Clean", "High") instantly filters the adjacent table to display only the IPs from that category.
  - **Enhanced Data Table:**
    - **Reputation Score Filter:** A dropdown menu allows for filtering the IPs in the table by their specific "Reputation Score."
    - **Blacklist Highlighting:** In the table, any IP that is blacklisted (`Detected on blacklist: Blacklisted`) is highlighted in red for immediate visual attention.
- **Reputation Levels:** The reputation score is categorized as "Clean" (0), "Good" (1-39), "Medium" (40-69), or "High" (70-100) for immediate assessment.
- **Data Enrichment:** The application can now handle more complex scenarios where the "Entity" and "Server Name" columns are missing from an uploaded file. It uses a fallback mechanism to enrich the data, first by trying to extract the entity from the server name and then by using a mapping file.
- **Global Analysis View:**
    - A "Global Analysis" button provides a high-level, aggregated view of all servers combined.
    - This view includes a summary pie chart for all IP reputations and a comprehensive data table.
    - The table in the global view includes a "Server" column to easily identify the origin of each IP address.

## Style and Design

- **Component Library:** The application uses Material-UI for a clean and modern interface.
- **Charting Library:** `recharts` is used to create the interactive pie charts.
- **Layout:** The layout is organized with filter controls at the top, followed by a full-width, immersive analysis view that combines a chart and an interactive table.
- **Compact Controls:** The buttons and dropdown menus are sized `small` for a more compact and refined control panel.
- **Readability:** The table uses alternating row colors to improve readability.
- **Typography:** The typography is consistent and easy to read, with clear headings for filters and analysis sections.

## Implementation Plan

### Step 1: Initial Setup (Completed)

- Installed dependencies: `react-dropzone`, `@mui/material`, `@mui/icons-material`, `xlsx`.
- Created the main `App.jsx` and the `Dashboard.jsx` component.

### Step 2: Diagram-Style IP Reputation Dashboard (Completed)

- Implemented an accordion-based layout where each server is displayed in its own expandable section.

### Step 3: Analysis by Level (Completed)

- The dashboard was grouped by analysis level, providing a more intuitive view of the IP reputation data.

### Step 4: Two-Level Filtering (Completed)

- Added dropdown menus to filter the data by entity and server.

### Step 5: Multi-Server Filter (Completed)

- Enhanced the server filter to allow for the selection of multiple servers using checkboxes, including a "Select All" option.

### Step 6: Server-Centric Dashboard with Charts (Completed)

- **Installed `recharts`:** Added the `recharts` library for charting.
- **Individual Server Cards:** The dashboard now displays a card for each selected server.
- **Analysis Charts:** Each server card includes a pie chart showing the breakdown of IP reputation levels.
- **Detailed Server Modal:** A modal window provides a detailed view of each server's IPs, with highlighting for blacklisted IPs.

### Step 7: UI Refinements (Completed)

- **Moved Country Display:** The country is now displayed on the server card instead of the dropdown.
- **Conditional Dashboard:** The dashboard is now hidden until a server is selected.
- **Paginated Modal:** The detailed server modal now includes pagination to handle large lists of IPs, and its size has been reduced for a more compact view.

### Step 8: Visual Polish (Completed)

- **Updated Color Palette:** The chart colors have been updated to a more subtle, "nude" palette with a slight opacity.
- **Full-Width Layout:** The vertical lines on the sides of the main content area have been removed for a more open and modern, full-width layout.

### Step 9: Focused Server View (Completed)

- **Server Buttons:** The dashboard now displays buttons for each selected server.
- **Focused View:** Clicking a server button shows only that server's chart, in a more focused analysis experience.

### Step 10: Immersive & Interactive Dashboard (Completed)

- **Full-Page Layout:** The dashboard has been redesigned to feature a full-page, side-by-side analysis view with a chart and interactive table.
- **Interactive Chart:** The pie chart now filters the table when a segment is clicked.
- **Enhanced Table:** The table now includes a dropdown to filter by reputation score and highlights blacklisted IPs in red.

### Step 11: Data Enrichment and Code Quality (Completed)

- **Enhanced Data Enrichment:** The application can now handle more complex scenarios where the "Entity" and "Server Name" columns are missing from an uploaded file.
- **Improved Code Quality:** Fixed all linting issues, including `no-prototype-builtins`, `react/prop-types`, `no-unused-vars`, and `react/react-in-jsx-scope`.
- **Modern ESLint Configuration:** Updated the ESLint configuration to a modern, flat configuration.

### Step 12: Global Analysis View (Current)

- Added a "Global Analysis" button and view to provide an aggregated analysis of all servers.
- This includes a global pie chart and an updated table that shows which server an IP belongs to in this view.
