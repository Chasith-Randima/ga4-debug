import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { setCorsHeaders } from '../../../lib/cors';

export async function OPTIONS() {
  // Respond to preflight requests
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
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
    const collection = db.collection('items');
    
    const items = await collection.find({}).toArray();
    
    return setCorsHeaders(NextResponse.json(items));
  } catch (error) {
    console.error('Error fetching items:', error);
    return setCorsHeaders(NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    ));
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;
    
    if (!name || !description) {
      return setCorsHeaders(NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      ));
    }
    
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return setCorsHeaders(NextResponse.json(
        { error: 'MongoDB not configured' },
        { status: 500 }
      ));
    }
    
    const client = await clientPromise;
    const db = client.db('mydatabase');
    const collection = db.collection('items');
    
    const newItem = {
      name,
      description,
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(newItem);
    
    return setCorsHeaders(NextResponse.json(
      { 
        message: 'Item created successfully',
        item: { ...newItem, _id: result.insertedId }
      },
      { status: 201 }
    ));
  } catch (error) {
    console.error('Error creating item:', error);
    return setCorsHeaders(NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    ));
  }
} 