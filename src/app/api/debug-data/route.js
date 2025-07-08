import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { setCorsHeaders } from '../../../lib/cors';

export async function OPTIONS() {
  // Respond to preflight requests
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      orderData,
      browserData,
      ga4Data,
      gtmData,
      stapeData,
      timestamp,
      pageUrl,
      userAgent,
      sessionId,
      clientId,
      debugInfo
    } = body;

    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return setCorsHeaders(NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      ));
    }

    const client = await clientPromise;
    const db = client.db('mydatabase');
    const collection = db.collection('debug_data');

    const debugRecord = {
      orderData,
      browserData,
      ga4Data,
      gtmData,
      stapeData,
      timestamp: timestamp || new Date(),
      pageUrl,
      userAgent,
      sessionId,
      clientId,
      debugInfo,
      createdAt: new Date()
    };

    const result = await collection.insertOne(debugRecord);

    return setCorsHeaders(NextResponse.json({
      success: true,
      message: 'Debug data saved successfully',
      recordId: result.insertedId
    }, { status: 201 }));

  } catch (error) {
    console.error('Error saving debug data:', error);
    return setCorsHeaders(NextResponse.json(
      { error: 'Failed to save debug data' },
      { status: 500 }
    ));
  }
}

export async function GET() {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return setCorsHeaders(NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      ));
    }

    const client = await clientPromise;
    const db = client.db('mydatabase');
    const collection = db.collection('debug_data');
    
    const debugRecords = await collection.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    return setCorsHeaders(NextResponse.json(debugRecords));
  } catch (error) {
    console.error('Error fetching debug data:', error);
    return setCorsHeaders(NextResponse.json(
      { error: 'Failed to fetch debug data' },
      { status: 500 }
    ));
  }
} 