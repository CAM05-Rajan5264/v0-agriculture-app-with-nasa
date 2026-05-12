# Satellite Imagery Integration for Crop Field Monitoring

This document outlines the satellite imagery integration using NASA's Global Imagery Browse Services (GIBS) for monitoring crop fields.

## Overview

The satellite imagery integration provides real-time satellite data from NASA's MODIS (Moderate Resolution Imaging Spectroradiometer) satellites to monitor crop health and growth across assigned field locations.

### Key Features

- **Real-time Satellite Data**: Access NASA GIBS satellite tiles for multiple spectral bands
- **Multiple Imagery Layers**: 
  - True Color Imagery (natural color satellite view)
  - Agriculture/Vegetation False Color (vegetation highlights)
  - Vegetation Health Index (stress detection)
  - Thermal Imagery (water stress and temperature)
- **Interactive Map Viewer**: Leaflet-based map with zoom, pan, and layer switching
- **Field Location Marking**: Green circle markers showing exact crop field boundaries
- **Metadata Display**: Cloud cover, data quality, and acquisition information
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Libraries & APIs Used

1. **Leaflet.js v1.9.4**: Interactive mapping library
   - Lightweight and performant
   - Excellent touch/mobile support
   - CDN-based (no npm dependency)

2. **NASA GIBS (Global Imagery Browse Services)**
   - WMTS (Web Map Tile Service) tiles
   - MODIS Terra and Aqua data
   - Updated daily for most layers
   - Free and publicly available

3. **NASA CMR (Common Metadata Repository)**
   - Query satellite data metadata
   - Cloud cover and quality information
   - Granule-level data access

## Component Structure

### Main Component: `SatelliteImageryViewer`
**Location**: `/components/crop-monitoring/satellite-imagery-viewer.tsx`

**Props**:
```typescript
interface SatelliteImageryViewerProps {
  latitude: number        // Field center latitude
  longitude: number       // Field center longitude
  fieldName: string       // Display name of field
  cropName: string        // Crop type being grown
}
```

**Features**:
- Dynamically loads Leaflet from CDN
- Displays satellite imagery tiles
- Interactive layer selection
- Real-time loading states
- Error handling for API failures
- Responsive map container

### Library: `nasa-gibs-imagery.ts`
**Location**: `/lib/nasa-gibs-imagery.ts`

**Key Functions**:

1. **getNASASatelliteLayers()**: Returns array of available satellite layers
   - Constructs GIBS WMTS URLs with current date
   - Returns layer metadata and attribution

2. **getSatelliteMetadata()**: Fetches satellite acquisition information
   - Queries NASA CMR for MODIS data
   - Returns cloud cover, quality, resolution
   - Caches results for 1 hour

3. **analyzeSatelliteImagery()**: Analyzes crop health from satellite data
   - Assesses vegetation health
   - Identifies stress indicators
   - Provides crop-specific recommendations
   - Returns confidence score

4. **buildSatelliteTileUrl()**: Constructs dated tile URLs
   - Formats dates for NASA GIBS format
   - Supports different date ranges

5. **getOptimalZoomLevel()**: Calculates appropriate map zoom
   - Based on field area
   - Returns zoom 12-16 for typical fields

## Available Satellite Layers

### 1. True Color Imagery
- **Purpose**: Natural color view of field
- **Data Source**: MODIS Terra Corrected Reflectance
- **Best For**: Visual field assessment, identifying infrastructure, landuse
- **Resolution**: 250m

### 2. Agriculture/Vegetation (False Color)
- **Purpose**: Highlight vegetation and agricultural stress
- **Data Source**: MODIS Terra Bands 7-2-1
- **Best For**: Vegetation health assessment, biomass estimation
- **Resolution**: 500m

### 3. Vegetation Health Index
- **Purpose**: Detect vegetation stress and anomalies
- **Data Source**: MODIS Aqua Corrected Reflectance
- **Best For**: Disease detection, pest damage assessment
- **Resolution**: 500m

### 4. Thermal Imagery
- **Purpose**: Temperature and water stress detection
- **Data Source**: MODIS Terra Thermal Band 31
- **Best For**: Irrigation scheduling, water stress detection
- **Resolution**: 1km

## Usage Example

### In Crop Monitoring Dashboard

```tsx
import { SatelliteImageryViewer } from "@/components/crop-monitoring/satellite-imagery-viewer"

export default function CropMonitoringPage() {
  return (
    <SatelliteImageryViewer
      latitude={28.661395}
      longitude={77.092855}
      fieldName="North Field"
      cropName="Corn"
    />
  )
}
```

### Accessing Satellite Data Functions

```tsx
import {
  getNASASatelliteLayers,
  getSatelliteMetadata,
  analyzeSatelliteImagery,
  getOptimalZoomLevel,
} from "@/lib/nasa-gibs-imagery"

// Get available layers
const layers = getNASASatelliteLayers()

// Fetch metadata for specific location
const metadata = await getSatelliteMetadata(latitude, longitude)

// Analyze crop health from satellite data
const analysis = await analyzeSatelliteImagery(latitude, longitude, "Corn")

// Get optimal zoom level for field
const zoom = getOptimalZoomLevel(fieldAreaHectares)
```

## Data Accuracy & Updates

- **Update Frequency**: Daily (varies by layer)
- **Data Source**: NASA MODIS Terra and Aqua satellites
- **Cloud Cover Handling**: Metadata includes cloud cover percentage
- **Quality Assessment**: Automatic quality rating based on cloud cover
- **Historical Data**: Available for past 30 days
- **Latency**: 1-2 days behind current date

## Integration with Crop Monitoring

The satellite imagery integrates with the crop health monitoring system:

1. **NDVI Correlation**: Compare NASA-derived NDVI with satellite visual data
2. **Growth Stage Assessment**: Validate phenological stages with visible crop development
3. **Water Stress Detection**: Cross-reference thermal imagery with calculated water stress
4. **Alerts & Recommendations**: Satellite anomalies trigger alerts and management recommendations

## API Rate Limiting & Caching

- **Tile Service**: NASA GIBS - no rate limiting for tile access
- **CMR API**: 2000 requests/hour (more than sufficient)
- **Metadata Caching**: 1 hour cache for satellite metadata queries
- **Tile Caching**: Browser-level caching (standard tile cache headers)

## Error Handling

The component gracefully handles common failure modes:

1. **Leaflet Load Failure**: Falls back to placeholder
2. **CMR API Unavailable**: Uses default metadata
3. **Tile Load Issues**: Displays error message with retry option
4. **Invalid Coordinates**: Validates lat/lng before rendering

## Browser Compatibility

- Chrome/Chromium: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Edge: ✓ Full support
- Mobile browsers: ✓ Full support with touch controls

## Performance Considerations

- **Lazy Loading**: Leaflet loaded only when component mounts
- **CDN Delivery**: Tiles served from NASA CDN with global distribution
- **Tile Size**: Optimized for web (typically 256x256 PNG)
- **Map Rendering**: Efficient canvas-based rendering
- **Memory Usage**: Maps cleaned up properly on unmount

## Future Enhancements

1. **Sentinel-2 Integration**: Add 10m resolution data from ESA
2. **Time Series Analysis**: Compare satellite data over crop season
3. **Change Detection**: Automated anomaly detection in vegetation indices
4. **Export Functionality**: Download satellite imagery and analysis reports
5. **Multi-Field Comparison**: Compare satellite metrics across multiple fields
6. **Historical Baselines**: Store and compare against field historical patterns

## Troubleshooting

### Map Not Displaying
- Check browser console for Leaflet load errors
- Verify latitude/longitude are valid
- Ensure internet connection is available

### Tiles Not Loading
- NASA GIBS services may have temporary outages
- Check network tab in browser dev tools
- Try refreshing the page or selecting a different layer

### Metadata Not Available
- CMR API may be temporarily unavailable
- Application falls back to default metadata
- Try again in a few moments

## References

- NASA GIBS: https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs
- NASA MODIS: https://modis.gsfc.nasa.gov/
- CMR API: https://cmr.earthdata.nasa.gov/search/
- Leaflet.js: https://leafletjs.com/
- WMTS Standard: https://www.ogc.org/standards/wmts

## Support & Contact

For issues with satellite data or integration:
- NASA EOSDIS: support@earthdata.nasa.gov
- Leaflet Issues: https://github.com/Leaflet/Leaflet/issues

For application-specific issues:
- Check application error logs
- Review browser console for client-side errors
- Verify Supabase database has correct field location coordinates
