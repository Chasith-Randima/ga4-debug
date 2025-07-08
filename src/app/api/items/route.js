import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('mydatabase');
    const collection = db.collection('items');
    
    const items = await collection.find({}).toArray();
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;
    
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
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
    
    return NextResponse.json(
      { 
        message: 'Item created successfully',
        item: { ...newItem, _id: result.insertedId }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
} 