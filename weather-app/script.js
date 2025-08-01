// Weather App JavaScript
class WeatherApp {
    constructor() {
        // API Configuration
        this.API_KEY = 'demo_key'; // Replace with your OpenWeatherMap API key
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
        
        // App State
        this.currentCity = 'London';
        this.isCelsius = false;
        this.currentWeatherData = null;
        this.forecastData = null;
        
        // City coordinates for API calls
        this.cityCoordinates = {
            'London': { lat: 51.5074, lon: -0.1278 },
            'New York': { lat: 40.7128, lon: -74.0060 },
            'Tokyo': { lat: 35.6762, lon: 139.6503 },
            'Singapore': { lat: 1.3521, lon: 103.8198 },
            'Sydney': { lat: -33.8688, lon: 151.2093 },
            'Buenos Aires': { lat: -34.6037, lon: -58.3816 },
            'Mexico City': { lat: 19.4326, lon: -99.1332 },
            'San Francisco': { lat: 37.7749, lon: -122.4194 }
        };
        
        // DOM Elements
        this.elements = {
            weatherApp: document.getElementById('weatherApp'),
            backgroundAnimation: document.getElementById('backgroundAnimation'),
            cityDropdown: document.getElementById('cityDropdown'),
            tempToggle: document.getElementById('tempToggle'),
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            weatherMain: document.getElementById('weatherMain'),
            retryBtn: document.getElementById('retryBtn'),
            
            // Weather display elements
            weatherIcon: document.getElementById('weatherIcon'),
            temperature: document.getElementById('temperature'),
            feelsLike: document.getElementById('feelsLike'),
            cityName: document.getElementById('cityName'),
            weatherDescription: document.getElementById('weatherDescription'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            pressure: document.getElementById('pressure'),
            
            // Forecast elements
            forecastToggle: document.getElementById('forecastToggle'),
            forecastContainer: document.getElementById('forecastContainer'),
            forecastList: document.getElementById('forecastList')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadWeatherData();
    }
    
    setupEventListeners() {
        // City selection
        this.elements.cityDropdown.addEventListener('change', (e) => {
            this.currentCity = e.target.value;
            this.loadWeatherData();
        });
        
        // Temperature unit toggle
        this.elements.tempToggle.addEventListener('change', (e) => {
            this.isCelsius = e.target.checked;
            if (this.currentWeatherData) {
                this.updateWeatherDisplay();
                this.updateForecastDisplay();
            }
        });
        
        // Forecast toggle
        this.elements.forecastToggle.addEventListener('click', () => {
            this.toggleForecast();
        });
        
        // Retry button
        this.elements.retryBtn.addEventListener('click', () => {
            this.loadWeatherData();
        });
    }
    
    async loadWeatherData() {
        this.showLoading();
        
        try {
            // For demo purposes, we'll use mock data instead of API calls
            // In production, replace this with actual API calls
            const weatherData = await this.getMockWeatherData();
            this.currentWeatherData = weatherData;
            
            const forecastData = await this.getMockForecastData();
            this.forecastData = forecastData;
            
            this.updateWeatherDisplay();
            this.updateForecastDisplay();
            this.updateTemperatureTheme();
            this.showWeatherData();
            
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showError();
        }
    }
    
    // Mock data for demo - replace with actual API calls
    async getMockWeatherData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockData = {
                    'London': { temp: 15, feels_like: 13, humidity: 72, wind_speed: 3.5, pressure: 1013, description: 'partly cloudy', icon: '02d' },
                    'New York': { temp: 22, feels_like: 25, humidity: 68, wind_speed: 4.2, pressure: 1015, description: 'sunny', icon: '01d' },
                    'Tokyo': { temp: 28, feels_like: 31, humidity: 75, wind_speed: 2.1, pressure: 1011, description: 'partly cloudy', icon: '02d' },
                    'Singapore': { temp: 32, feels_like: 38, humidity: 84, wind_speed: 1.8, pressure: 1009, description: 'thunderstorm', icon: '11d' },
                    'Sydney': { temp: 18, feels_like: 20, humidity: 65, wind_speed: 5.2, pressure: 1018, description: 'clear sky', icon: '01d' },
                    'Buenos Aires': { temp: 26, feels_like: 29, humidity: 58, wind_speed: 3.8, pressure: 1016, description: 'few clouds', icon: '02d' },
                    'Mexico City': { temp: 24, feels_like: 26, humidity: 45, wind_speed: 2.9, pressure: 1020, description: 'clear sky', icon: '01d' },
                    'San Francisco': { temp: 16, feels_like: 18, humidity: 78, wind_speed: 4.5, pressure: 1014, description: 'fog', icon: '50d' }
                };
                
                resolve(mockData[this.currentCity] || mockData['London']);
            }, 200);
        });
    }
    
    async getMockForecastData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const mockForecast = [];
                
                // Use current weather data if available, otherwise use default base temp
                const baseTemp = this.currentWeatherData ? this.currentWeatherData.temp : 20;
                
                for (let i = 0; i < 7; i++) {
                    const variation = Math.random() * 10 - 5;
                    
                    mockForecast.push({
                        day: days[i],
                        temp_max: Math.round(baseTemp + variation + 3),
                        temp_min: Math.round(baseTemp + variation - 3),
                        description: ['sunny', 'partly cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
                        icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)]
                    });
                }
                
                resolve(mockForecast);
            }, 100);
        });
    }
    
    // For production use - actual API calls
    async fetchCurrentWeather() {
        const coords = this.cityCoordinates[this.currentCity];
        const response = await fetch(
            `${this.BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        
        return response.json();
    }
    
    async fetchForecast() {
        const coords = this.cityCoordinates[this.currentCity];
        const response = await fetch(
            `${this.BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${this.API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Forecast data not available');
        }
        
        return response.json();
    }
    
    updateWeatherDisplay() {
        if (!this.currentWeatherData) return;
        
        const data = this.currentWeatherData;
        const temp = this.isCelsius ? data.temp : this.celsiusToFahrenheit(data.temp);
        const feelsLike = this.isCelsius ? data.feels_like : this.celsiusToFahrenheit(data.feels_like);
        const unit = this.isCelsius ? '°C' : '°F';
        
        // Update weather display
        this.elements.temperature.textContent = `${Math.round(temp)}${unit}`;
        this.elements.feelsLike.textContent = `Feels like ${Math.round(feelsLike)}${unit}`;
        this.elements.cityName.textContent = this.currentCity;
        this.elements.weatherDescription.textContent = data.description;
        this.elements.humidity.textContent = `${data.humidity}%`;
        this.elements.windSpeed.textContent = `${data.wind_speed} ${this.isCelsius ? 'km/h' : 'mph'}`;
        this.elements.pressure.textContent = `${data.pressure} hPa`;
        
        // Update weather icon
        this.elements.weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
        this.elements.weatherIcon.alt = data.description;
    }
    
    updateForecastDisplay() {
        if (!this.forecastData) return;
        
        this.elements.forecastList.innerHTML = '';
        
        this.forecastData.forEach(item => {
            const tempMax = this.isCelsius ? item.temp_max : this.celsiusToFahrenheit(item.temp_max);
            const tempMin = this.isCelsius ? item.temp_min : this.celsiusToFahrenheit(item.temp_min);
            const unit = this.isCelsius ? '°C' : '°F';
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <span class="forecast-day">${item.day}</span>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.icon}.png" alt="${item.description}">
                <div class="forecast-temps">
                    <span class="forecast-high">${Math.round(tempMax)}${unit}</span>
                    <span class="forecast-low">${Math.round(tempMin)}${unit}</span>
                </div>
                <span class="forecast-desc">${item.description}</span>
            `;
            
            this.elements.forecastList.appendChild(forecastItem);
        });
    }
    
    updateTemperatureTheme() {
        if (!this.currentWeatherData) return;
        
        const temp = this.isCelsius ? this.currentWeatherData.temp : this.celsiusToFahrenheit(this.currentWeatherData.temp);
        
        // Remove existing theme classes
        this.elements.weatherApp.classList.remove('cold', 'cool', 'mild', 'warm', 'hot');
        
        // Apply new theme based on temperature
        let theme;
        if (this.isCelsius) {
            if (temp <= -1) theme = 'cold';
            else if (temp < 16) theme = 'cool';
            else if (temp < 24) theme = 'mild';
            else if (temp < 29) theme = 'warm';
            else theme = 'hot';
        } else {
            if (temp <= 30) theme = 'cold';
            else if (temp < 60) theme = 'cool';
            else if (temp < 75) theme = 'mild';
            else if (temp < 85) theme = 'warm';
            else theme = 'hot';
        }
        
        this.elements.weatherApp.classList.add(theme);
    }
    
    toggleForecast() {
        const isExpanded = this.elements.forecastContainer.classList.contains('expanded');
        
        if (isExpanded) {
            this.elements.forecastContainer.classList.remove('expanded');
            this.elements.forecastToggle.classList.remove('active');
        } else {
            this.elements.forecastContainer.classList.add('expanded');
            this.elements.forecastToggle.classList.add('active');
        }
    }
    
    showLoading() {
        this.elements.loading.style.display = 'block';
        this.elements.error.style.display = 'none';
        this.elements.weatherMain.style.display = 'none';
    }
    
    showError() {
        this.elements.loading.style.display = 'none';
        this.elements.error.style.display = 'block';
        this.elements.weatherMain.style.display = 'none';
    }
    
    showWeatherData() {
        this.elements.loading.style.display = 'none';
        this.elements.error.style.display = 'none';
        this.elements.weatherMain.style.display = 'block';
    }
    
    celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    }
    
    fahrenheitToCelsius(fahrenheit) {
        return (fahrenheit - 32) * 5/9;
    }
}

// Initialize the weather app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Additional animations and effects
document.addEventListener('DOMContentLoaded', () => {
    // Add parallax effect to background
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 100;
        mouseY = (e.clientY / window.innerHeight) * 100;
        
        const backgroundAnimation = document.getElementById('backgroundAnimation');
        if (backgroundAnimation) {
            backgroundAnimation.style.backgroundPosition = `${mouseX}% ${mouseY}%`;
        }
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.detail, .forecast-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Service Worker registration for PWA features (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 