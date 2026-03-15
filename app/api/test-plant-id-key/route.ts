'use server';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.PLANT_ID_API_KEY || process.env.PLANTID_API_KEY;

    console.log('[v0] Testing plant.id API key...');
    console.log('[v0] API Key exists:', !!apiKey);
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key not found in environment variables',
        checkedVars: ['PLANT_ID_API_KEY', 'PLANTID_API_KEY']
      });
    }

    console.log('[v0] API Key length:', apiKey.length);
    console.log('[v0] API Key format check - starts with:', apiKey.substring(0, 10));

    // Test the API key with a simple request
    const testResponse = await fetch('https://api.plant.id/v2/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify({
        images: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdADmX/9k='],
        modifiers: ['similar_images'],
        plant_details: ['description', 'url', 'common_names', 'taxonomy'],
      }),
    });

    const responseText = await testResponse.text();
    
    console.log('[v0] Test API response status:', testResponse.status);
    console.log('[v0] Test API response:', responseText.substring(0, 200));

    if (testResponse.status === 401) {
      return NextResponse.json({
        success: false,
        error: '401 Unauthorized - API key is invalid or not recognized',
        apiKeyProvided: apiKey.substring(0, 10) + '...',
        responseStatus: testResponse.status,
        responseBody: responseText,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'API key is valid',
      apiKeyLength: apiKey.length,
      responseStatus: testResponse.status,
    });
  } catch (error) {
    console.error('[v0] API key test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
