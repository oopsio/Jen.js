import { VNode } from 'preact';
import { GoogleFont } from '../src/fonts/google';
import type { LoadContext, LoadResult } from '../src/core/data-loader';

const inter = GoogleFont('Inter', {
  weight: [400, 700],
  subsets: ['latin'],
  display: 'swap',
});

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  lastUpdated: string;
}

interface WeatherPageProps {
  weather: WeatherData;
  location: string;
}

/**
 * Server-side data loader with error handling
 */
export async function load(context: LoadContext): Promise<LoadResult> {
  // Get city from query params, default to San Francisco
  const city = (context.query?.city as string) || 'San Francisco';

  try {
    // In a real app, fetch from OpenWeather API or similar
    // const response = await fetch(`https://api.openweathermap.org/...`);

    // Mock weather data
    const weatherData: WeatherData = {
      city,
      temperature: 72,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 8,
      lastUpdated: new Date().toISOString(),
    };

    return {
      props: {
        weather: weatherData,
        location: city,
      },
      // Revalidate every 30 minutes (ISR)
      revalidate: 1800,
    };
  } catch (error) {
    // Return default data on error
    console.error('Failed to fetch weather:', error);

    return {
      props: {
        weather: {
          city,
          temperature: 0,
          condition: 'Data unavailable',
          humidity: 0,
          windSpeed: 0,
          lastUpdated: new Date().toISOString(),
        },
        location: city,
      },
    };
  }
}

/**
 * Weather page component
 */
export default function WeatherPage({
  weather,
  location,
}: WeatherPageProps): VNode {
  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: `${inter.style.fontFamily}, system-ui, sans-serif`,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '3rem auto',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h1 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '2.5rem' }}>
          {location}
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                color: '#667eea',
              }}
            >
              {weather.temperature}°F
            </div>
            <div
              style={{ color: '#666', fontSize: '1.1rem', marginTop: '0.5rem' }}
            >
              {weather.condition}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              color: '#666',
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Humidity</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {weather.humidity}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Wind Speed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {weather.windSpeed} mph
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: '1rem',
            borderTop: '1px solid #e0e0e0',
            fontSize: '0.9rem',
            color: '#999',
          }}
        >
          Last updated: {new Date(weather.lastUpdated).toLocaleTimeString()}
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#fff',
          fontSize: '0.9rem',
        }}
      >
        <p>
          Try adding <code>?city=New+York</code> to the URL to see different
          locations
        </p>
      </div>
    </div>
  );
}
