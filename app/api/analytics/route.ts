import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Get credentials from environment variables
const getCredentials = () => {
  // Try to get from JSON string first (Vercel)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    } catch (error) {
      console.error('Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:', error);
    }
  }
  
  // Fallback to individual environment variables
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
  
  // For local development, try to import the file
  if (process.env.NODE_ENV === 'development') {
    try {
      const serviceAccount = require('@/service-account-key.json');
      return serviceAccount;
    } catch (error) {
      console.error('Error loading service account file:', error);
    }
  }
  
  return null;
};

const credentials = getCredentials();

// Initialize Google Analytics Data API client only if credentials are available
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

if (credentials) {
  analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
}

// Your GA4 Property ID
const propertyId = process.env.GA4_PROPERTY_ID || '515496218';

export async function GET() {
  try {
    // If no credentials, return zeros
    if (!analyticsDataClient) {
      console.warn('Analytics credentials not configured');
      return NextResponse.json({
        activeUsers: 0,
        todayVisitors: 0,
        totalVisitors: 0,
        error: 'Analytics not configured',
      });
    }

    const [activeUsersResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [
        {
          name: 'activeUsers',
        },
      ],
    });

    // Get today's visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const [todayResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: 'today',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'sessions',
        },
      ],
    });

    // Get total visitors (last 30 days as a proxy for total)
    const [totalResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'totalUsers',
        },
      ],
    });

    const activeUsers = parseInt(activeUsersResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
    const todayVisitors = parseInt(todayResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
    const totalVisitors = parseInt(totalResponse.rows?.[0]?.metricValues?.[0]?.value || '0');

    return NextResponse.json({
      activeUsers,
      todayVisitors,
      totalVisitors,
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        message: error.message,
        activeUsers: 0,
        todayVisitors: 0,
        totalVisitors: 0,
      },
      { status: 200 } // Return 200 with zeros instead of error
    );
  }
}
