# Farm Tycoon - Smart Farming Game Guide

## Overview

**Farm Tycoon** is an interactive agricultural management simulation game that integrates real NASA weather and satellite data. Players manage virtual farms, plant crops, respond to weather conditions, and optimize harvests while competing on global leaderboards.

## Game Features

### 1. **Crop Management**
- Plant and grow 5 different crops: Tomato, Wheat, Corn, Potato, Rice
- Each crop has unique growth times (60-130 days) and resource requirements
- Monitor health, water levels, and growth progress in real-time
- Harvest mature crops to earn rewards

### 2. **NASA Weather Integration**
- **Real NASA POWER Data**: Temperature, humidity, rainfall, solar radiation
- **Dynamic Growth Modeling**: Weather directly affects crop growth rates
- **Disease Risk Calculation**: High humidity and poor conditions increase disease risk
- **Optimal Temperature Zones**: Each crop thrives in specific temperature ranges

### 3. **Resource Management**
- **Water**: Essential for all crops, affects growth and health
- **Fertilizer**: Boosts crop health and accelerates growth
- **Seeds**: Required to plant new crops
- **Gold**: Earned from harvests, used for disease treatment

### 4. **Smart Farming Mechanics**

#### Growth System
- Crops progress through stages: Seed → Sprouted → Growing → Mature → Harvestable
- Growth is influenced by NASA weather data (temperature, rainfall, humidity)
- Optimal conditions provide 10-20% growth boosts
- Adverse conditions reduce health and growth

#### Health & Disease
- Crops start at 80% health
- Health decreases in extreme weather (too hot, too cold, too dry, too wet)
- Disease risk increases with humidity > 80%
- Apply treatments to reduce disease risk (costs 50 Gold)

#### Yield Calculation
- Base yield depends on crop type (5-8 kg)
- Final yield multiplied by health percentage (70% health = 70% yield)
- NDVI score from satellite data boosts yield up to +15%
- Bonus for harvesting on optimal maturity date

### 5. **Achievement System**
Unlock achievements to earn bonus points:
- **First Harvest** (50 pts): Harvest your first crop
- **Perfect Crop** (200 pts): 100% health harvest
- **Yield Master** (300 pts): Harvest 10 crops
- **Water Saver** (100 pts): Minimal water usage
- **Disease Fighter** (150 pts): Treat disease 5 times
- **Quick Grower** (120 pts): Harvest 10 days early
- **High Yielder** (250 pts): 15+ kg harvest
- **Farming Legend** (500 pts): 5000+ total points

### 6. **Leaderboards**
- **Global Rankings**: Compete with all players
- **Scoring**: Based on total points earned from harvests and achievements
- **Farm Metrics**: Display score, gold earned, and farm name
- **Real-time Updates**: Rankings refresh every 30 seconds

### 7. **Satellite Data Integration**
- **NDVI Index**: Normalized Difference Vegetation Index (0-1 scale)
  - 0 = Dead vegetation
  - 0.5 = Moderate health
  - 1.0 = Excellent health
- **Health Impact**: NDVI < 0.4 reduces health; > 0.7 increases health
- **Visual Feedback**: See real satellite data effects on your crops

## Game Strategy Tips

### 1. **Optimal Planting**
- Check weather forecast before planting
- Plant during seasons with optimal temperature ranges
- Consider water availability in your region

### 2. **Resource Optimization**
- Water before growth progress exceeds 50%
- Use fertilizer to boost health and growth speed
- Harvest quickly to free resources for next crop

### 3. **Disease Management**
- Monitor disease risk (aim to keep below 40%)
- Treat early if risk spikes above 60%
- Reduce humidity by ensuring good spacing (in-game mechanic)

### 4. **Yield Maximization**
- Maintain 80%+ health throughout growth cycle
- Harvest at 100% maturity for maximum yield
- Use satellite data (NDVI) to time interventions

### 5. **Achieving Legend Status**
- Focus on multiple crops (Yield Master achievement)
- Maintain perfect health crops for bonus points
- Earn achievements for multiplier points
- Target total score of 5000+ for Farming Legend

## Game Mechanics Details

### Weather Impact Formula
```
Growth Modifier = Base × Temperature Modifier × Rainfall Modifier × Humidity Modifier
- Temperature Modifier: 1.1 if optimal, 0.5-1.0 if not
- Rainfall Modifier: Based on crop water needs
- Humidity Modifier: 1.05 if 30-80%, 0.9 if > 85%
```

### Yield Formula
```
Estimated Yield = Base Yield × Maturity × Health % × NDVI Bonus
- Base Yield: 5-8 kg depending on crop
- Maturity: 0.3-1.2× based on days grown
- Health: 0.3-1.0× based on crop health
- NDVI Bonus: 1.0-1.15× based on satellite data
```

### Points Formula
```
Total Points = Base Yield × 50 + Health × 2 + Timeliness Bonus + Achievements
```

## NASA Data Used

### POWER API (Daily Resolution)
- **Temperature**: Min/max daily temperature (°C)
- **Relative Humidity**: Percentage (0-100%)
- **Precipitation**: Rainfall depth (mm/day)
- **Solar Radiation**: Incident shortwave radiation (MJ/m²/day)

### Satellite Data Integration
- **NDVI Index**: From Landsat/Sentinel imagery
- **Soil Moisture**: Estimated from weather and satellite data
- **Disease Risk**: Calculated from humidity and temperature patterns

## Progression System

### Early Game (First 5 Harvests)
- Learn crop mechanics
- Build resource base
- Unlock basic achievements
- Target: 500 points

### Mid Game (5-15 Harvests)
- Optimize resource usage
- Master weather predictions
- Focus on health maintenance
- Target: 2000 points

### Late Game (15+ Harvests)
- Maximize yields consistently
- Unlock all achievements
- Dominate leaderboards
- Target: 5000+ points for legend status

## Troubleshooting

### Crop Health Dropping
- Check weather conditions
- Increase water application
- Reduce disease risk with treatment

### Low Yields
- Harvest crops at 100% maturity
- Maintain health above 70%
- Check NDVI score (aim for 0.6+)

### Resources Running Low
- Focus on high-yield crops (wheat, tomato)
- Reduce treatment frequency
- Complete achievements for bonus points

## Contact & Support

For technical issues or game feedback, check the Developer page in the dashboard for logs and system information.

---

**Farm Tycoon** - Where Real Science Meets Virtual Farming! 🌾🚀
