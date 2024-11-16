# Angular Project Setup and SVG Editor Component Guide

This document provides comprehensive instructions on how to set up and run an Angular project, along with an in-depth explanation of the `svg-editor` component. The `svg-editor` component is a powerful tool for editing SVG files, enabling users to upload, modify, and export SVG elements with ease.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up the Angular Project](#setting-up-the-angular-project)
   - [1. Clone the Repository](#1-clone-the-repository)
   - [2. Install Dependencies](#2-install-dependencies)
   - [3. Serve the Application](#3-serve-the-application)
   - [4. Build the Project](#4-build-the-project)
3. [Understanding the `svg-editor` Component](#understanding-the-svg-editor-component)
   - [Component Overview](#component-overview)
   - [HTML Template](#html-template)
   - [TypeScript Logic](#typescript-logic)
   - [CSS Styling](#css-styling)
4. [Component Functionality](#component-functionality)
   - [Uploading and Loading SVG Files](#uploading-and-loading-svg-files)
   - [Interacting with SVG Elements](#interacting-with-svg-elements)
   - [Context Menu Operations](#context-menu-operations)
   - [Exporting SVG Elements](#exporting-svg-elements)
   - [Preview Mode and Blink Animation](#preview-mode-and-blink-animation)
5. [Conclusion](#conclusion)

---

## Prerequisites

Before setting up the Angular project and utilizing the `svg-editor` component, ensure that your development environment meets the following requirements:

- **Node.js**: Version 14.x or later. Download from [Node.js Official Website](https://nodejs.org/).
- **Angular CLI**: Version 14.x or later. Install globally using:
  ```bash
  npm install -g @angular/cli
  ```
- **Git**: For cloning repositories. Download from [Git Official Website](https://git-scm.com/).
- **Code Editor**: Visual Studio Code is recommended. Download from [VS Code Official Website](https://code.visualstudio.com/).

---

## Setting Up the Angular Project

Follow these steps to set up and run the Angular project containing the `svg-editor` component.

### 1. Clone the Repository

Start by cloning the project repository to your local machine. Replace `<repository-url>` with the actual URL of your repository.

```bash
git clone <repository-url>
```

Navigate into the project directory:

```bash
cd <project-directory>
```

### 2. Install Dependencies

Install the necessary dependencies using `npm`. This command reads the `package.json` file and installs all listed packages.

```bash
npm install
```

### 3. Serve the Application

To run the Angular application in development mode with live-reloading, use the `ng serve` command:

```bash
ng serve
```

By default, the application will be accessible at `http://localhost:4200/`. Open this URL in your web browser to view the application.

### 4. Build the Project

To compile the Angular project for production, use the `ng build` command. This will generate optimized and minified files in the `dist/` directory.

```bash
ng build --prod
```

You can deploy the contents of the `dist/` directory to your preferred hosting service.

---

## Understanding the `svg-editor` Component

The `svg-editor` component is a standalone Angular component designed to facilitate the editing of SVG files. It offers features such as uploading SVGs, selecting and customizing elements, adding labels, and exporting modified SVGs.

### Component Overview

- **Selector**: `app-svg-editor`
- **Standalone**: Yes
- **Imports**:
  - `CommonModule`: Provides common Angular directives.
  - `FormsModule`: Enables two-way data binding with `ngModel`.
- **Dependencies**:
  - `d3`: A powerful library for manipulating documents based on data.

### HTML Template

The HTML structure of the `svg-editor` component is organized into two main sections:

1. **Sidebar**: Displays selected SVG elements and provides export options.
2. **Main Content**: Contains the SVG container, file upload controls, preview mode toggle, and dialogs.

Here's a breakdown of the key elements:

- **Selected Elements List**: Shows currently selected SVG elements with options to remove them.
- **Export Buttons**: 
  - `Export Selected Elements`: Downloads the selected elements as a new SVG file.
  - `Export from All`: Downloads the entire SVG content.
- **SVG Container**: A designated area where the uploaded SVG is rendered and manipulated.
- **Context Menu**: A custom right-click menu offering actions like adding to export, customizing elements, and adding labels.
- **Attribute Edit Dialog**: A modal dialog that allows users to edit attributes of selected SVG elements.
- **Preview Mode Controls**: Allows toggling between edit and preview modes and setting custom blink colors.

### TypeScript Logic

The TypeScript file (`svg-editor.component.ts`) manages the component's functionality, including:

- **State Management**:
  - `selectedElements`: Tracks SVG elements selected for export.
  - `isPreviewMode`: Toggles between edit and preview modes.
  - `showAttributeDialog`: Controls the visibility of the attribute edit dialog.
  - `contextMenuVisible`, `contextMenuX`, `contextMenuY`: Manage the custom context menu's state and position.
- **SVG Handling**:
  - **Loading SVGs**: Reads and renders uploaded SVG files using D3.js.
  - **Zooming and Panning**: Implements zoom behavior for the SVG container.
  - **Element Interaction**: Handles clicks and right-clicks on SVG elements for selection and context menu actions.
- **Label Management**:
  - **Adding Labels**: Supports adding text or image labels to SVG elements or at specific coordinates.
- **Export Functionality**:
  - **Export Selected Elements**: Generates a new SVG file containing only the selected elements.
  - **Export All Elements**: Downloads the entire SVG content.
- **Blink Animation**:
  - **Preview Mode**: In preview mode, clicking an element triggers a blink animation with a custom color.
- **Context Menu Actions**: Provides options to add elements to export, customize elements, and add labels.

### CSS Styling

The CSS file (`svg-editor.component.css`) styles the component's elements to ensure a user-friendly interface:

- **Selected Elements**: Highlights selected SVG elements with a blue stroke.
- **Labels**: Styles text and image labels for clarity and interactivity.
- **Layout**: Uses Flexbox for responsive design, ensuring the sidebar and main content are properly aligned.
- **Context Menu**: Styles the custom right-click context menu for better usability.
- **Buttons and Inputs**: Provides modern styling for buttons, file uploads, and form inputs.

---

## Component Functionality

The `svg-editor` component offers a robust set of features for SVG manipulation. Below is a detailed explanation of its core functionalities.

### Uploading and Loading SVG Files

- **File Upload**: Users can upload SVG files using the "Upload SVG File" button. The file input is hidden and triggered programmatically.
- **File Validation**: Ensures that only valid SVG files (`image/svg+xml`) are accepted. Alerts the user if an invalid file is selected.
- **Rendering SVG**: Uses D3.js to parse and render the uploaded SVG within the designated container (`#svg-container`).
- **ViewBox Management**: Ensures the SVG has a `viewBox` attribute for proper scaling. If absent, it sets a default viewBox based on the SVG's dimensions.
- **Zoom Behavior**: Implements zooming and panning using D3's zoom functionality, allowing users to navigate large SVGs effectively.
- **Event Listeners**: Attaches click and context menu event listeners to all SVG elements for interaction.

### Interacting with SVG Elements

- **Selection**: Clicking on an SVG element in edit mode opens the attribute edit dialog, allowing users to modify its attributes.
- **Customization**: Users can edit attributes such as color, size, and other SVG properties through the dialog.
- **Context Menu**: Right-clicking an element opens a custom context menu with options to add the element to export, customize it, or add a label.

### Context Menu Operations

The custom context menu provides the following options:

1. **Add to Export**: Toggles the selection state of the clicked element for exporting.
2. **Customize Element**: Opens the attribute edit dialog to modify the element's attributes.
3. **Add Label**: Prompts the user to add a text or image label to the element.

**Positioning**: The context menu intelligently positions itself within the viewport to prevent overflow.

### Exporting SVG Elements

- **Export Selected Elements**:
  - **Bounding Box Calculation**: Determines the minimal bounding box that encompasses all selected elements.
  - **SVG Generation**: Creates a new SVG element containing only the selected elements, maintaining their relative positions.
  - **Serialization and Download**: Serializes the new SVG and triggers a download as `exported_elements.svg`.

- **Export All Elements**:
  - **Cloning SVG Content**: Clones the entire SVG content, including all elements and definitions.
  - **Serialization and Download**: Serializes the cloned SVG and triggers a download as `exported_all_elements.svg`.

### Preview Mode and Blink Animation

- **Toggle Preview**: Users can switch between edit and preview modes using the "Preview Mode" button.
- **Blink Animation**:
  - **Activation**: In preview mode, clicking an element initiates a blink animation where the element alternates between its original color and a custom blink color.
  - **Customization**: Users can select the blink color using the color picker visible in preview mode.
  - **Duration**: The blink animation runs for 5 seconds before reverting to the original color.

- **Stopping Animations**: Exiting preview mode stops all ongoing blink animations and restores original colors.

---

## Conclusion

The `svg-editor` component is a versatile tool for managing and editing SVG files within an Angular application. By following the setup instructions and understanding the component's structure and functionalities, developers can seamlessly integrate advanced SVG editing capabilities into their projects. Whether it's for designing graphics, customizing elements, or exporting specific parts of an SVG, the `svg-editor` component provides a comprehensive solution tailored for modern web applications.

For further customization or feature enhancements, developers can extend the component's capabilities by leveraging additional D3.js functionalities or integrating other Angular features as needed.

---
