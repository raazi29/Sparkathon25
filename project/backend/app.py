from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
import httpx
import random
import os
import json
import base64
from datetime import datetime, timedelta
import uvicorn
from fastapi.responses import JSONResponse
import re

app = FastAPI(title="AI Shopping Assistant API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Models ---
class Product(BaseModel):
    id: str
    name: str
    price: float
    originalPrice: Optional[float] = None
    image: str
    images: List[str]
    category: str
    subcategory: Optional[str] = None
    rating: float
    reviews: int
    inStock: bool
    stockCount: int
    ecoRating: float
    description: str
    features: List[str]
    brand: str
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    tags: List[str]
    isNew: Optional[bool] = None
    isTrending: Optional[bool] = None
    discount: Optional[int] = None

class ChatMessage(BaseModel):
    id: str
    type: str  # 'user' or 'bot'
    content: str
    timestamp: datetime
    products: Optional[List[Product]] = None
    suggestions: Optional[List[str]] = None
    image: Optional[str] = None
    orderStatus: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    mood: Optional[str] = None
    occasion: Optional[str] = None
    budget: Optional[Dict[str, float]] = None
    image: Optional[str] = None
    voiceTranscript: Optional[str] = None
    orderId: Optional[str] = None

class OrderStatus(BaseModel):
    orderId: str
    status: str
    estimatedDelivery: str
    trackingNumber: str
    updates: List[Dict[str, str]]

# --- Mock Database ---
# Load mock data
with open(os.path.join(os.path.dirname(__file__), "mock_products.json"), "w") as f:
    # Sample products
    mock_products = [
        {
            "id": "1",
            "name": "Eco-Friendly Wireless Headphones",
            "price": 149.99,
            "originalPrice": 199.99,
            "image": "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400",
            "images": [
                "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400",
                "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=400"
            ],
            "category": "Electronics",
            "subcategory": "Audio",
            "rating": 4.8,
            "reviews": 324,
            "inStock": True,
            "stockCount": 45,
            "ecoRating": 9.2,
            "description": "Premium wireless headphones made from recycled materials with exceptional sound quality.",
            "features": ["Active Noise Cancellation", "30-hour battery", "Quick charge", "Recycled materials"],
            "brand": "EcoSound",
            "colors": ["Black", "White", "Green"],
            "tags": ["wireless", "eco-friendly", "premium"],
            "isNew": True,
            "discount": 25
        },
        {
            "id": "2",
            "name": "Sustainable Cotton T-Shirt",
            "price": 29.99,
            "image": "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400",
            "images": [
                "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400",
                "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400"
            ],
            "category": "Fashion",
            "subcategory": "Shirts",
            "rating": 4.6,
            "reviews": 189,
            "inStock": True,
            "stockCount": 78,
            "ecoRating": 8.5,
            "description": "Soft, comfortable t-shirt made from 100% organic cotton.",
            "features": ["Organic cotton", "Fair trade", "Pre-shrunk", "Breathable"],
            "brand": "GreenWear",
            "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
            "colors": ["White", "Black", "Navy", "Forest Green"],
            "tags": ["organic", "casual", "sustainable"],
            "isTrending": True
        },
        {
            "id": "3",
            "name": "Smart Home Security Camera",
            "price": 89.99,
            "image": "https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=400",
            "images": [
                "https://images.pexels.com/photos/430208/pexels-photo-430208.jpeg?auto=compress&cs=tinysrgb&w=400"
            ],
            "category": "Electronics",
            "subcategory": "Smart Home",
            "rating": 4.7,
            "reviews": 256,
            "inStock": True,
            "stockCount": 23,
            "ecoRating": 7.8,
            "description": "1080p HD security camera with motion detection and night vision.",
            "features": ["1080p HD", "Motion detection", "Night vision", "Mobile app"],
            "brand": "SecureHome",
            "colors": ["White", "Black"],
            "tags": ["smart-home", "security", "wifi"],
            "isNew": False
        },
        {
            "id": "4",
            "name": "Bamboo Kitchen Utensil Set",
            "price": 24.99,
            "image": "https://images.pexels.com/photos/4039921/pexels-photo-4039921.jpeg?auto=compress&cs=tinysrgb&w=400",
            "images": [
                "https://images.pexels.com/photos/4039921/pexels-photo-4039921.jpeg?auto=compress&cs=tinysrgb&w=400"
            ],
            "category": "Home",
            "subcategory": "Kitchen",
            "rating": 4.9,
            "reviews": 145,
            "inStock": True,
            "stockCount": 67,
            "ecoRating": 9.8,
            "description": "Complete bamboo kitchen utensil set - eco-friendly and durable.",
            "features": ["100% bamboo", "Dishwasher safe", "6-piece set", "Non-toxic"],
            "brand": "EcoKitchen",
            "tags": ["bamboo", "kitchen", "eco-friendly", "sustainable"],
            "isTrending": True
        },
        {
            "id": "5",
            "name": "Minimalist Backpack",
            "price": 79.99,
            "originalPrice": 99.99,
            "image": "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400",
            "images": [
                "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400"
            ],
            "category": "Fashion",
            "subcategory": "Bags",
            "rating": 4.5,
            "reviews": 98,
            "inStock": True,
            "stockCount": 34,
            "ecoRating": 8.1,
            "description": "Sleek, minimalist backpack perfect for work or travel.",
            "features": ["Water-resistant", "Laptop compartment", "Multiple pockets", "Ergonomic"],
            "brand": "UrbanCarry",
            "colors": ["Black", "Gray", "Navy"],
            "tags": ["minimalist", "travel", "laptop", "urban"],
            "discount": 20
        }
    ]
    json.dump(mock_products, f, indent=4)

# Create mock orders
mock_orders = {
    "ORD12345": {
        "status": "Shipped",
        "estimatedDelivery": "2024-05-20",
        "trackingNumber": "TRK987654321",
        "updates": [
            {"date": "2024-05-15", "status": "Order Placed", "location": "Online"},
            {"date": "2024-05-16", "status": "Processing", "location": "Warehouse #5"},
            {"date": "2024-05-17", "status": "Shipped", "location": "Distribution Center"}
        ]
    },
    "ORD67890": {
        "status": "Delivered",
        "estimatedDelivery": "2024-05-10",
        "trackingNumber": "TRK123456789",
        "updates": [
            {"date": "2024-05-05", "status": "Order Placed", "location": "Online"},
            {"date": "2024-05-06", "status": "Processing", "location": "Warehouse #2"},
            {"date": "2024-05-07", "status": "Shipped", "location": "Distribution Center"},
            {"date": "2024-05-10", "status": "Delivered", "location": "Customer Address"}
        ]
    }
}

# --- AI Service Integration ---
# Function to get response from open-source AI model
async def get_ai_response(prompt: str, mood: Optional[str] = None, 
                          occasion: Optional[str] = None, 
                          budget: Optional[Dict[str, float]] = None,
                          image_content: Optional[str] = None) -> str:
    """
    Get AI response using HuggingFace's inference API
    We use the free huggingface inference API for this example
    """
    # Create a comprehensive prompt
    system_prompt = "You are ARIA, an AI retail shopping assistant. You help customers find products, answer questions about fashion, recommend items based on preferences, and provide a helpful shopping experience."
    
    context = []
    if mood:
        context.append(f"The customer's current mood is: {mood}")
    if occasion:
        context.append(f"The customer is shopping for this occasion: {occasion}")
    if budget and 'min' in budget and 'max' in budget:
        context.append(f"The customer's budget range is ${budget['min']} to ${budget['max']}")
    
    context_str = " ".join(context)
    
    full_prompt = f"{system_prompt}\n\nContext: {context_str}\n\nCustomer: {prompt}\n\nARIA:"
    
    try:
        # Use HuggingFace's free inference API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api-inference.huggingface.co/models/google/gemma-7b-it",
                headers={"Authorization": f"Bearer hf_dummy_key_for_demo"},  # Replace with your actual key
                json={"inputs": full_prompt, "parameters": {"max_new_tokens": 250}}
            )
            
            if response.status_code == 200:
                return response.json()[0]["generated_text"].split("ARIA:")[1].strip()
            else:
                # Fallback response if API fails
                return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Let me provide some general assistance instead."
    except Exception as e:
        print(f"Error calling AI API: {e}")
        return "I'm having some trouble right now. Could you please try again in a moment?"

# Function to process image (if uploaded) using vision API
async def process_image(image_data: str) -> str:
    """Process image using a vision API to extract visual information"""
    try:
        # This would normally call a vision API like Google Cloud Vision
        # For demo purposes, we'll return fixed responses
        # In a real implementation, you would decode the base64 image and send to a vision API
        
        # Simulate processing time
        # Here we return a static response, but in a real implementation
        # you would analyze the image and return actual information
        return "I can see what appears to be a clothing item in casual style, possibly for everyday wear."
    except Exception as e:
        print(f"Error processing image: {e}")
        return "I had trouble analyzing this image. Could you please describe what you're looking for?"

# Function to find products based on criteria
def find_products(query: str, mood: Optional[str] = None, 
                 occasion: Optional[str] = None, 
                 budget: Optional[Dict[str, float]] = None) -> List[Product]:
    """Find products matching the query and filters"""
    # Load products from mock data
    with open(os.path.join(os.path.dirname(__file__), "mock_products.json"), "r") as f:
        all_products = json.load(f)
    
    # Filter products
    filtered_products = all_products
    
    # Apply budget filter if provided
    if budget and 'min' in budget and 'max' in budget:
        filtered_products = [p for p in filtered_products 
                            if p['price'] >= budget['min'] and p['price'] <= budget['max']]
    
    # Simple keyword matching (in a real app, you'd use more sophisticated search)
    matching_products = []
    query_terms = query.lower().split()
    mood_terms = mood.lower().split() if mood else []
    occasion_terms = occasion.lower().split() if occasion else []
    
    search_terms = query_terms + mood_terms + occasion_terms
    
    for product in filtered_products:
        product_text = (
            product['name'].lower() + ' ' + 
            product['description'].lower() + ' ' + 
            ' '.join(product['tags']).lower() + ' ' +
            product['category'].lower()
        )
        
        # Check how many search terms match
        matches = sum(1 for term in search_terms if term in product_text)
        
        if matches > 0:
            # Add match score to product for sorting
            product['_match_score'] = matches
            matching_products.append(product)
    
    # Sort by match score and limit to top 3
    matching_products.sort(key=lambda p: p.get('_match_score', 0), reverse=True)
    result = matching_products[:3]
    
    # Clean up temporary match score
    for p in result:
        if '_match_score' in p:
            del p['_match_score']
    
    return result

# Generate contextual suggestions based on conversation
def generate_suggestions(message: str) -> List[str]:
    """Generate contextual suggestions for quick replies"""
    suggestions = []
    
    # Product type suggestions
    if any(word in message.lower() for word in ['wear', 'clothes', 'outfit', 'dress']):
        suggestions.extend(["Show me summer outfits", "I need business casual clothes"])
    
    # Price-related suggestions
    if any(word in message.lower() for word in ['price', 'cost', 'expensive', 'cheap', 'budget']):
        suggestions.extend(["Products under $50", "Luxury items on sale"])
    
    # Occasion-based suggestions
    if any(word in message.lower() for word in ['event', 'party', 'wedding', 'formal']):
        suggestions.extend(["What to wear to a wedding?", "Casual party outfit ideas"])
    
    # Default suggestions if none match
    if not suggestions:
        suggestions = [
            "Show me trending products",
            "What's new in fashion?",
            "Find eco-friendly products",
            "Help me track my order"
        ]
    
    # Shuffle and return 3 random suggestions
    random.shuffle(suggestions)
    return suggestions[:3]

# --- API Endpoints ---
@app.post("/api/chat", response_model=ChatMessage)
async def chat(request: ChatRequest):
    """Process a chat message and return AI response"""
    try:
        # Process image if provided
        image_analysis = None
        if request.image:
            image_analysis = await process_image(request.image)
        
        # Handle order tracking request
        if request.orderId or any(term in request.message.lower() for term in ['track', 'order', 'package', 'shipping']):
            order_id = request.orderId
            
            # Try to extract order ID from message if not explicitly provided
            if not order_id:
                # Simple regex to find order ID patterns like "ORD12345"
                order_match = re.search(r'ORD\d{5}', request.message)
                if order_match:
                    order_id = order_match.group(0)
            
            # If we have an order ID and it exists in our mock data
            if order_id and order_id in mock_orders:
                order_info = mock_orders[order_id]
                return ChatMessage(
                    id=f"msg_{datetime.now().timestamp()}",
                    type="bot",
                    content=f"I found your order {order_id}. It is currently {order_info['status']}. " +
                            f"Estimated delivery date is {order_info['estimatedDelivery']}. " +
                            f"You can track it with tracking number {order_info['trackingNumber']}.",
                    timestamp=datetime.now(),
                    orderStatus={
                        "status": order_info["status"],
                        "estimatedDelivery": order_info["estimatedDelivery"],
                        "trackingNumber": order_info["trackingNumber"],
                        "updates": order_info["updates"]
                    },
                    suggestions=generate_suggestions(request.message)
                )
            elif "order" in request.message.lower() or "track" in request.message.lower():
                return ChatMessage(
                    id=f"msg_{datetime.now().timestamp()}",
                    type="bot",
                    content="I couldn't find that order. Please provide a valid order ID in the format ORD12345, or check your order history.",
                    timestamp=datetime.now(),
                    suggestions=["View my orders", "Track ORD12345", "Contact support"]
                )
        
        # Get AI response
        ai_response = await get_ai_response(
            prompt=request.message,
            mood=request.mood,
            occasion=request.occasion,
            budget=request.budget,
            image_content=request.image
        )
        
        # Find products based on the query
        products = find_products(
            query=request.message, 
            mood=request.mood,
            occasion=request.occasion,
            budget=request.budget
        )
        
        # Generate contextual suggestions
        suggestions = generate_suggestions(request.message)
        
        # Create response
        message_content = ai_response
        
        # If we analyzed an image, include that analysis
        if image_analysis:
            message_content = f"{image_analysis}\n\n{message_content}"
        
        return ChatMessage(
            id=f"msg_{datetime.now().timestamp()}",
            type="bot",
            content=message_content,
            timestamp=datetime.now(),
            products=products if products else None,
            suggestions=suggestions,
            image=None
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/orders/{order_id}", response_model=OrderStatus)
async def get_order_status(order_id: str):
    """Get the status of an order"""
    if order_id in mock_orders:
        order_info = mock_orders[order_id]
        return OrderStatus(
            orderId=order_id,
            status=order_info["status"],
            estimatedDelivery=order_info["estimatedDelivery"],
            trackingNumber=order_info["trackingNumber"],
            updates=order_info["updates"]
        )
    else:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

# --- App Startup ---
@app.on_event("startup")
async def startup_event():
    """Initialize the application when it starts"""
    print("AI Shopping Assistant API is starting up...")
    # This would be where you'd load models, initialize connections, etc.

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
