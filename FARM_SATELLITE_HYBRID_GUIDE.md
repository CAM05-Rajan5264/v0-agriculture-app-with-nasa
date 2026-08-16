# Farm Satellite Hybrid Imaging Guide

## Overview

The Farm Satellite Hybrid Imaging system provides real-time satellite imagery of crop fields using NASA's GIBS (Global Imagery Browse Services) and MODIS satellite data. The hybrid view combines satellite imagery with map overlays for better field boundary visualization.

## Features

### Hybrid Satellite Layers

1. **Satellite Hybrid** (Default)
   - NASA MODIS true color satellite imagery
   - Overlaid with OpenStreetMap for field boundary reference
   - Opacity controlled for better visibility
   - Best for general field monitoring

2. **True Color (NASA MODIS)**
   - Natural color satellite imagery from NASA MODIS Terra
   - Shows actual field conditions as seen from space
   - Daily updates from NASA satellites
   - Resolution: 250m (MODIS native)

3. **Agriculture/Vegetation**
   - False color composite (Bands 7-2-1)
   - Emphasizes healthy vegetation in bright green/red
   - Agricultural stress shows in yellow/brown
   - Excellent for crop health assessment

4. **Thermal/Temperature**
   - Infrared thermal imagery from MODIS Band 31
   - Shows soil and crop surface temperatures
   - Identifies moisture stress (cooler = stressed)
   - Helps detect irrigation effectiveness

5. **MODIS Aqua (Afternoon)**
   - Afternoon satellite pass (1:30 PM local time)
   - Shows afternoon vegetation conditions
   - Complements Terra's morning pass
   - Better for detecting daily stress patterns

## Technical Architecture

### Component Structure

```
FarmSatelliteHybrid
├── Map Container (Leaflet.js)
│   ├── NASA GIBS Tile Layer
│   ├── OpenStreetMap Overlay (for hybrid)
│   ├── Field Location Marker
│   └── Popup with Field Info
├── Controls
│   ├── Layer Selector (5 satellite views)
│   ├── Zoom Controls (in/out)
│   └── Refresh Button
└── Information Panel
    ├── Data Source Badge
    ├── Last Updated Time
    ├── Layer Description
    └── Field Metadata
```

### Data Flow

1. **Component Initialization**
   - Load Leaflet.js and CSS from CDN
   - Initialize map with field coordinates
   - Fetch latest NASA GIBS tiles

2. **Layer Management**
   - Each layer loads MODIS satellite data from NASA GIBS
   - Tiles are cached by browser for performance
   - Layer switching removes old layer, adds new one
   - Maintains field marker and popup across switches

3. **Real-time Updates**
   - NASA updates satellite data daily
   - MODIS Terra passes: ~10:30 AM local time
   - MODIS Aqua passes: ~1:30 PM local time
   - Tiles auto-update with latest available data

## NASA GIBS Tile Endpoints

All tiles are retrieved from NASA's free GIBS service:

```
Base URL: https://gibs.earthdata.nasa.gov/wmts-webmerc/

Supported Layers:
- MODIS_Terra_CorrectedReflectance_TrueColor (daily)
- MODIS_Terra_CorrectedReflectance_Bands721 (daily)
- MODIS_Terra_BrightnessTemp_Band31_Day (daily)
- MODIS_Aqua_CorrectedReflectance_TrueColor (daily)

Format: {product}/default//GoogleMapsCompatible_Level3/{z}/{y}/{x}.jpg
```

## Usage in Crop Monitoring

### Integration with Crop Health Monitoring

The satellite hybrid imaging is integrated into the Crop Monitoring Dashboard:

1. Navigate to **Dashboard > Crop Monitoring**
2. Select a farm and field
3. Click on the **Satellite Imagery** tab
4. View real-time satellite imagery of the field

### Interpreting Satellite Data

**True Color Imagery:**
- Green: Healthy, dense vegetation
- Brown: Bare soil or mature crop
- Water: Dark blue/black

**Agriculture/Vegetation Layer:**
- Bright Red/Magenta: Dense, healthy vegetation
- Green: Moderate vegetation
- Yellow/Tan: Stressed vegetation or soil
- Brown: Bare soil

**Thermal Imagery:**
- Bright colors (red/yellow): Hot areas (moisture stressed)
- Dark colors (blue/black): Cool areas (adequate moisture)
- Compare to time of day for accurate interpretation

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Mobile browsers: Responsive, touch controls

## Performance Optimization

1. **Tile Caching**
   - Leaflet caches tiles in browser cache
   - First load takes longer, subsequent loads faster
   - Clear cache if tiles appear outdated

2. **Lazy Loading**
   - Leaflet loads Leaflet.js from CDN only when needed
   - Maps not rendered until tab is clicked
   - Reduces initial page load time

3. **Responsive Design**
   - Mobile: Single column layout
   - Desktop: Multi-column layer selector
   - Map resizes with window

## Troubleshooting

### Map Not Displaying

**Issue:** Black or blank map area
- Check internet connection
- Verify NASA GIBS service is accessible
- Clear browser cache and reload
- Check browser console for errors

**Solution:**
```javascript
// Manual refresh
window.location.reload()
```

### Tiles Loading Slowly

**Issue:** Tiles take long time to load
- NASA servers may be busy
- Your internet connection may be slow
- Browser cache may be full

**Solution:**
1. Wait 30 seconds for tiles to load
2. Click Refresh button
3. Try different satellite layer
4. Clear browser cache

### Field Marker Not Showing

**Issue:** Green circle marker missing
- Coordinates may be outside map bounds
- Zoom level too low to see marker
- Marker hidden behind tiles

**Solution:**
1. Click Refresh to recenter
2. Zoom in using zoom controls
3. Check field coordinates in info panel

## Satellite Data Specifications

### NASA MODIS Satellite Data

| Parameter | Value |
|-----------|-------|
| **Satellite** | Terra, Aqua |
| **Sensor** | MODIS (Moderate Resolution Imaging Spectroradiometer) |
| **Resolution** | 250m (true color), 1km (thermal) |
| **Coverage** | Global, daily |
| **Latency** | 2-4 hours from satellite pass |
| **Wavelengths** | Visible, Near-IR, Thermal IR |

### Available Bands

- **Band 1:** Red (620-670 nm)
- **Band 2:** Near-IR (841-876 nm)
- **Band 7:** Mid-IR (2105-2155 nm)
- **Band 31:** Thermal (11.77-12.27 µm)

## Integration with Crop Health Metrics

Satellite imagery complements NASA Earth observation metrics:

1. **NDVI Correlation**
   - Agriculture/Vegetation layer shows NDVI patterns
   - Green areas = high NDVI
   - Brown areas = low NDVI

2. **Water Stress Detection**
   - Thermal imagery identifies dry areas
   - Compare with water stress metric
   - Guides irrigation decisions

3. **Growth Stage Monitoring**
   - Vegetation changes visible in satellite layers
   - Track crop development over time
   - Switch between satellite passes

4. **Disease Detection Support**
   - Unusual color patterns may indicate disease
   - Compare across dates to identify changes
   - Combine with field observations

## Future Enhancements

1. **Landsat Integration** - 30m resolution for detailed monitoring
2. **Time Series Analysis** - Historical satellite imagery archive
3. **Animation** - Satellite imagery timeline playback
4. **Export** - Download satellite imagery for reports
5. **Sentinel-2** - Free high-resolution European satellite data
6. **AI Analysis** - Automated crop anomaly detection from satellite

## Data Privacy & Licensing

- **NASA GIBS Data:** Public domain, freely available
- **OpenStreetMap:** ODbL license (attribution required)
- **Field Coordinates:** Private, not shared with NASA
- **No Personal Data:** Satellite data is publicly available

## Support & Resources

- **NASA GIBS Documentation:** https://earthdata.nasa.gov/
- **MODIS Satellite Info:** https://modis.gsfc.nasa.gov/
- **Leaflet.js:** https://leafletjs.com/
- **Project Documentation:** See SATELLITE_IMAGERY_SETUP.md

## Version History

- **v1.0** (May 2026) - Initial hybrid satellite imaging implementation
  - 5 NASA GIBS satellite layers
  - Leaflet.js-based interactive map
  - Real-time field location marker
  - Layer switching and zoom controls
