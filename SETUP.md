# Setup Instructions

## 1. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier is sufficient)
3. Create a database user with read/write permissions
4. Get your connection string from the cluster

## 2. Environment Variables

Create a `.env.local` file in the root directory with your MongoDB URI:

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mydatabase?retryWrites=true&w=majority
```

Replace `your-username`, `your-password`, and `your-cluster` with your actual MongoDB Atlas credentials.

## 3. Install Dependencies

```bash
npm install
```

## 4. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## 5. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the `MONGODB_URI` environment variable in your Vercel project settings
4. Deploy!

## Features

- ✅ Add new items with name and description
- ✅ View all items in a clean list
- ✅ Loading states and error handling
- ✅ Responsive design with Tailwind CSS
- ✅ MongoDB Atlas integration
- ✅ Optimized for Vercel deployment

## Database Structure

- Database: `mydatabase`
- Collection: `items`
- Document structure:
  ```json
  {
    "_id": "ObjectId",
    "name": "string",
    "description": "string", 
    "createdAt": "Date"
  }
  ``` 