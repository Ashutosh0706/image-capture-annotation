
# Image Capture & Annotation Application

A responsive React application that allows users to capture images using their device camera, assess image quality, and annotate objects using rectangular bounding boxes.

## Live Demo

```https://image-capture-annotation.vercel.app/```

## GitHub Repository

```https://github.com/Ashutosh0706/image-capture-annotation.git```

## Project Overview

This project was developed as a frontend engineering assignment using React.js.

The application provides a camera-based image capture workflow with image quality analysis and interactive annotation tools.

Users can capture images, review them, assess image quality, draw rectangular bounding boxes, label objects, and export annotated images.

## Features

### 1. Camera Integration
- Live camera preview.
- Camera permission handling.
- Front and rear camera switching where supported.
- Camera start and stop controls.
- Graceful handling of unsupported devices and camera errors.

### 2. Image Capture
- Capture images from the live camera stream.
- Preview captured images.
- Retake images.
- Download original captured images.
- High-quality JPEG capture.

### 3. Torch Support
- Detect torch capability on supported devices.
- Enable and disable the camera torch.
- Handle unsupported torch functionality gracefully.

### 4. Image Quality Assessment
- Image resolution detection.
- File size measurement.
- Brightness analysis.
- Overall quality score.
- Quality feedback and suggestions.

### 5. Image Annotation
- Draw rectangular bounding boxes.
- Select existing annotations.
- Move and resize rectangles.
- Add and edit annotation labels.
- Delete individual annotations.
- Clear all annotations.
- Export the annotated image as PNG.

## Technology Stack

- React.js
- JavaScript
- Vite
- Tailwind CSS
- CSS
- Lucide React
- HTML5 Canvas API
- SVG
- MediaDevices API
- Pointer Events API
- Vitest
- React Testing Library

## Project Architecture

```text
src/
├── components/    # Reusable UI components
├── hooks/         # Camera, capture, and quality logic
├── utils/         # Reusable utility functions
├── App.jsx        # Main application component
└── main.jsx       # Application entry point
```

## Installation and Setup

### Prerequisites

- Node.js 20 or a compatible supported version.
- npm.
- A browser with camera support.
- A camera-enabled device for live capture.

### Clone the repository

```bash
git clone https://github.com/Ashutosh0706/image-capture-annotation.git
```

### Navigate to the project

```bash
cd image-capture-annotation
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### Run tests

```bash
npm run test:run
```

### Build for production

```bash
npm run build
```

## Camera Permissions

Camera access requires a secure browser context.

Use:
- localhost during local development.
- HTTPS when testing on a deployed or remote device.

The application requests camera permission through the browser's MediaDevices API.

## Technical Decisions

### Camera API
The browser MediaDevices API is used to request access to the device camera.

### Image Capture
The HTML Canvas API captures the current video frame and generates an image Blob.

### Annotation Rendering
SVG is used to render interactive bounding boxes over the captured image.

### Coordinate System
Annotation coordinates are normalized relative to the original image dimensions. This keeps rectangles aligned when the image is displayed at different screen sizes.

### Image Quality
Image resolution, file size, and sampled image brightness are used to calculate a rule-based quality score.

### Export
The original image and annotation shapes are drawn onto a Canvas to generate the final PNG.

## Current Limitations

- Annotation data is stored in component state and is not persisted across page refreshes.
- Image quality assessment uses rule-based thresholds rather than AI-based image analysis.
- Brightness analysis does not evaluate image sharpness or focus.
- Torch support depends on browser and device capabilities.
- The application does not currently store captured images on a backend.
