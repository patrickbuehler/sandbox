# Dynamic Weather Web Application

A modern, responsive weather application with temperature-based dynamic backgrounds and smooth animations.

## ✨ Features

### Core Functionality
- **Real-time Weather Data**: Current temperature, humidity, wind speed, and pressure
- **Temperature Unit Toggle**: Switch between Fahrenheit and Celsius
- **City Selection**: 8 major cities worldwide (London, New York, Tokyo, Singapore, Sydney, Buenos Aires, Mexico City, San Francisco)
- **7-Day Forecast**: Expandable weekly weather forecast
- **Weather Icons**: Dynamic weather condition icons

### Visual Design
- **Dynamic Backgrounds**: Temperature-responsive color themes
  - 🧊 **Cold** (below 32°F/0°C): Deep blues and purples
  - ❄️ **Cool** (32-50°F/0-10°C): Light blues and teals
  - 🌿 **Mild** (50-70°F/10-21°C): Greens and yellows
  - ☀️ **Warm** (70-85°F/21-29°C): Oranges and warm yellows
  - 🔥 **Hot** (above 85°F/29°C): Reds and deep oranges
- **Animated Gradients**: Continuously moving background patterns
- **Smooth Transitions**: 1.5-second color transitions when switching cities
- **Glassmorphism Design**: Modern frosted glass effects with backdrop blur
- **Floating Animations**: Weather icons with subtle floating effects

### Interactive Elements
- **Hover Effects**: Subtle animations on all interactive elements
- **Parallax Background**: Mouse-responsive background movement
- **Loading States**: Animated loading spinner
- **Error Handling**: Graceful error states with retry functionality
- **Smooth Scrolling**: Intersection Observer animations for forecast items

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets for mobile devices
- **Adaptive Layout**: Grid system that adjusts to screen width

## 🚀 Quick Start

### Demo Mode (No API Key Required)
The app comes with mock data for demonstration purposes. Simply open `index.html` in your browser to see it in action.

### Production Setup (With Real Weather Data)

1. **Get an API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your free API key

2. **Configure the API**
   - Open `script.js`
   - Replace `'demo_key'` with your actual API key:
   ```javascript
   this.API_KEY = 'your_openweathermap_api_key_here';
   ```

3. **Enable Real API Calls**
   - In `script.js`, replace the mock data calls with real API calls:
   ```javascript
   // Replace this line in loadWeatherData():
   const weatherData = await this.getMockWeatherData();
   
   // With this:
   const weatherData = await this.fetchCurrentWeather();
   ```

4. **Serve the Files**
   - Use a local server (Live Server, Python's `http.server`, etc.)
   - CORS restrictions prevent API calls from `file://` protocol

## 📁 Project Structure

```
weather-app/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with animations
├── script.js           # JavaScript functionality
└── README.md          # This file
```

## 🎨 Customization

### Adding New Cities
1. Add the city to the HTML dropdown in `index.html`
2. Add coordinates to `cityCoordinates` object in `script.js`

### Modifying Temperature Ranges
Update the temperature thresholds in the `updateTemperatureTheme()` method:

```javascript
// Fahrenheit ranges
if (temp < 32) theme = 'cold';
else if (temp < 50) theme = 'cool';
// ... etc
```

### Custom Color Themes
Modify the CSS custom properties in `styles.css`:

```css
:root {
    --cold-gradient: your-custom-gradient;
    /* ... other theme colors */
}
```

## 🌐 Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Features Used**:
  - CSS Custom Properties
  - CSS Grid & Flexbox
  - Intersection Observer API
  - Fetch API
  - ES6+ JavaScript

## 📱 Progressive Web App (PWA) Ready

The app includes service worker registration for PWA capabilities. To enable:

1. Create a `sw.js` service worker file
2. Add a `manifest.json` file
3. Configure caching strategies

## 🔧 Development

### Local Development
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

### Performance Optimization
- Images are loaded from CDN (OpenWeatherMap)
- CSS animations use `transform` and `opacity` for smooth 60fps
- Intersection Observer reduces layout thrashing
- Debounced mouse movement events

## 🐛 Troubleshooting

**API Key Issues**
- Ensure your API key is valid and active
- Check API usage limits
- Verify CORS settings for your domain

**Loading Issues**
- Use HTTPS for production (mixed content restrictions)
- Check browser console for errors
- Ensure proper file paths

**Animation Performance**
- Reduce animation complexity on slower devices
- Consider `prefers-reduced-motion` media query

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the browser console for errors
- Verify API key configuration
- Test with mock data first
- Check network connectivity

---

**Enjoy your dynamic weather experience!** 🌤️ 