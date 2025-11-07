# SkyTrack
SkyTrack is a real-time satellite tracking application that visualizes thousands of active satellites orbiting Earth using WebGL and satellite propagation data.

## Description
**SkyTrack** allows users to explore Earth's orbit in real time with thousands of active satellites rendered in an immersive 3D globe view.  
Built with **CesiumJS**, it combines real-time data fetched from **Celestrak TLE feeds** and calculates satellite positions using **Satellite.js** propagation models.

Users can:
- Search satellites by name or NORAD ID
- Click any satellite to view live position data (altitude, latitude, longitude, speed)
- Watch smooth orbital movement across the globe
- Experience a visually stunning interface with a **modern glassmorphism UI**

This project is designed for both **space enthusiasts** and **educational demonstrations** to visualize global satellite networks and orbital patterns dynamically.

## Features
- **3D Globe Visualization** powered by CesiumJS  
- **Real-Time Orbital Tracking** using TLE propagation  
- **Search Functionality** (by name or NORAD ID)  
- **Interactive Satellite Selection** with detailed stats  
- **Glassmorphism UI Design** with responsive layout  
- **Batch Loading Optimization** for thousands of satellites  
- **Dynamic Color Coding** for satellite categories  
- **Real-Time Data Panels** showing speed, altitude, and coordinates  
- **Categorization** (GPS, Starlink, Galileo, ISS, Weather, etc.)

## How It Works
1. The app loads TLE (Two-Line Element) data from **Celestrak**’s satellite feed.  
2. Each TLE is processed using **Satellite.js** to generate orbital elements.  
3. CesiumJS renders a **3D Earth globe** and animates satellite positions in real time.  
4. When a satellite is clicked:
   - The app calculates its live latitude, longitude, and altitude.
   - Displays detailed info (speed, height, coordinates) in a glass UI panel.
5. Users can search satellites instantly by name or NORAD ID.

## Core Functions

- loadSatellites() - Fetches and processes satellite data from Celestrak
- classifySatellite() - Categorizes satellites by type and purpose
- updateSatelliteInfo() - Displays real-time orbital parameters
- Interactive camera controls and satellite selection
- Search functionality with instant results

## API & Data Sources

- Celestrak NORAD Elements: Active satellite TLE data
- Cesium Ion: World terrain and base imagery
- Satellite.js: SGP4/SDP4 propagation algorithms

## Satellite Categories

- 🟡 Space Stations (ISS, Tiangong)
- 🟢 GPS Navigation
- 🔵 Galileo System
- 🔴 GLONASS
- 🔷 Starlink Constellation
- 🟠 Weather Satellites
- 🟣 Communication Satellites
- 🟪 Scientific Research
- ⚪ Other Satellites

##  Usage & Installation

### Prerequisites
- A modern browser with **WebGL support**
- Internet connection (to load CesiumJS, Satellite.js, and Celestrak data)

### Installation Steps

1. **Clone or Download the Project**
### If using git
- git clone https://github.com/cloudxplorer/SkyTrack
- cd SkyTrack
- python -m http.server 4444

Now open your modern Web browser and visit the link given below

- https://localhost:4444

DEMO:- [SkyTrack](https://cloudxplorer.github.io/SkyTrack/)

### Key Technical Features
- **Responsive Design**: Mobile-first responsive layout
- **Progressive Web App**: Offline-capable features
- **Real-time Updates**: Live data synchronization
- **Security First**: Comprehensive input validation and XSS protection

## License
This project is proprietary software. All rights reserved. The source code is provided for educational and evaluation purposes. Redistribution or commercial use without permission is prohibited.

## Acknowledgments

- CesiumJS for the amazing 3D geospatial platform
- Celestrak for providing satellite orbital data
- Satellite.js for orbital propagation calculations
- NASA and other space agencies for making satellite data publicly available
