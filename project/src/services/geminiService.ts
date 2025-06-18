import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = '';
const genAI = new GoogleGenerativeAI(API_KEY);

export interface ImageAnalysisResult {
  description: string;
  objects: string[];
  colors: string[];
  style: string;
  occasion: string;
  mood: string;
  recommendations: string[];
  confidence: number;
  tags: string[];
}

export interface ConversationContext {
  mood?: string;
  occasion?: string;
  budget?: { min: number; max: number };
  preferences?: string[];
  previousProducts?: string[];
  userProfile?: {
    age?: number;
    gender?: string;
    location?: string;
    interests?: string[];
  };
}

export interface ProductRecommendation {
  response: string;
  recommendedProducts: any[];
  suggestions: string[];
  reasoning: string;
  confidence: number;
  searchTerms: string[];
}

class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    }
  });
  
  private visionModel = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.6,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    }
  });

  async analyzeImage(imageData: string): Promise<ImageAnalysisResult> {
    try {
      // Convert base64 to the format Gemini expects
      const imagePart = {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: imageData.includes('data:image/png') ? 'image/png' : 'image/jpeg'
        }
      };

      const prompt = `As an expert fashion and product analyst, analyze this image comprehensively. Provide a detailed JSON response with this exact structure:

{
  "description": "Detailed 2-3 sentence description of what you see",
  "objects": ["specific", "product", "items", "visible"],
  "colors": ["primary", "secondary", "accent", "colors"],
  "style": "specific style category (e.g., minimalist, bohemian, modern, vintage)",
  "occasion": "most suitable occasion (casual, formal, party, work, date, vacation)",
  "mood": "emotional vibe (happy, sophisticated, relaxed, energetic, romantic)",
  "recommendations": ["specific", "product", "suggestions", "based", "on", "analysis"],
  "confidence": 0.95,
  "tags": ["relevant", "searchable", "keywords"]
}

Focus on:
- Fashion items (clothing, accessories, shoes)
- Home decor and furniture
- Electronics and gadgets
- Beauty and personal care items
- Any retail products visible

Be specific and actionable in recommendations. Include style details, materials, and use cases.`;

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Clean the response to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON found in response');
      } catch (parseError) {
        console.warn('JSON parsing failed, using fallback:', parseError);
        // Enhanced fallback with better analysis
        return {
          description: text.substring(0, 200) + '...',
          objects: this.extractObjectsFromText(text),
          colors: this.extractColorsFromText(text),
          style: 'modern',
          occasion: 'casual',
          mood: 'neutral',
          recommendations: ['Based on the image analysis, I can suggest similar products from our catalog.'],
          confidence: 0.7,
          tags: this.extractTagsFromText(text)
        };
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  async generateProductRecommendations(
    query: string, 
    context: ConversationContext = {},
    products: any[] = []
  ): Promise<ProductRecommendation> {
    try {
      const systemPrompt = `You are ARIA (AI Retail Intelligence Assistant), an advanced AI shopping consultant for RetailVerse. You have deep expertise in:
- Fashion and style trends
- Product recommendations
- Consumer psychology
- Market analysis
- Personal styling

Your personality: Knowledgeable, friendly, enthusiastic about helping users find perfect products, and always providing reasoning for recommendations.`;

      const contextInfo = this.buildContextString(context);
      const productCatalog = this.formatProductCatalog(products);

      const prompt = `${systemPrompt}

USER QUERY: "${query}"

CONTEXT:
${contextInfo}

AVAILABLE PRODUCTS:
${productCatalog}

Provide a comprehensive response in this JSON format:
{
  "response": "Engaging, personalized response (2-3 sentences) that addresses the user's query with enthusiasm and expertise",
  "recommendedProducts": ["product_id_1", "product_id_2", "product_id_3"],
  "suggestions": ["follow-up", "questions", "or", "related", "suggestions"],
  "reasoning": "Brief explanation of why these products were chosen",
  "confidence": 0.95,
  "searchTerms": ["relevant", "keywords", "for", "search"]
}

Guidelines:
- Recommend 2-4 most relevant products
- Consider user's mood, occasion, and budget
- Provide specific reasoning for choices
- Include follow-up suggestions to continue the conversation
- Be conversational and helpful
- If no products match perfectly, suggest alternatives or ask clarifying questions`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const recommendedProducts = products.filter(p => 
            parsed.recommendedProducts?.includes(p.id)
          );
          
          return {
            response: parsed.response,
            recommendedProducts,
            suggestions: parsed.suggestions || this.getDefaultSuggestions(),
            reasoning: parsed.reasoning || 'Selected based on your preferences and current trends.',
            confidence: parsed.confidence || 0.8,
            searchTerms: parsed.searchTerms || []
          };
        }
        throw new Error('No JSON found in response');
      } catch (parseError) {
        console.warn('JSON parsing failed, using enhanced fallback:', parseError);
        
        // Enhanced fallback with better product matching
        const matchedProducts = this.intelligentProductMatching(query, context, products);
        
        return {
          response: text.length > 500 ? text.substring(0, 500) + '...' : text,
          recommendedProducts: matchedProducts,
          suggestions: this.getContextualSuggestions(query, context),
          reasoning: 'Products selected based on query analysis and user context.',
          confidence: 0.7,
          searchTerms: this.extractSearchTerms(query)
        };
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations. Please try again.');
    }
  }

  async checkOrderStatus(orderId: string): Promise<{
    status: string;
    estimatedDelivery: string;
    trackingNumber: string;
    updates: Array<{ date: string; status: string; location: string }>;
  }> {
    // Enhanced order tracking simulation
    const statuses = [
      'Order Confirmed',
      'Processing',
      'Packed',
      'Shipped',
      'In Transit',
      'Out for Delivery',
      'Delivered'
    ];
    
    const locations = [
      'RetailVerse Warehouse',
      'Distribution Center',
      'Local Facility',
      'Delivery Vehicle',
      'Your Address'
    ];
    
    const currentStatusIndex = Math.floor(Math.random() * statuses.length);
    const currentStatus = statuses[currentStatusIndex];
    
    // Generate realistic tracking updates
    const updates = [];
    for (let i = 0; i <= currentStatusIndex; i++) {
      const date = new Date(Date.now() - (currentStatusIndex - i) * 24 * 60 * 60 * 1000);
      updates.push({
        date: date.toLocaleDateString(),
        status: statuses[i],
        location: locations[Math.min(i, locations.length - 1)]
      });
    }
    
    return {
      status: currentStatus,
      estimatedDelivery: new Date(Date.now() + (7 - currentStatusIndex) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      trackingNumber: `RT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      updates: updates.reverse()
    };
  }

  // Helper methods
  private buildContextString(context: ConversationContext): string {
    const parts = [];
    if (context.mood) parts.push(`Mood: ${context.mood}`);
    if (context.occasion) parts.push(`Occasion: ${context.occasion}`);
    if (context.budget) parts.push(`Budget: $${context.budget.min}-$${context.budget.max}`);
    if (context.preferences?.length) parts.push(`Preferences: ${context.preferences.join(', ')}`);
    if (context.userProfile) {
      const profile = context.userProfile;
      if (profile.age) parts.push(`Age: ${profile.age}`);
      if (profile.gender) parts.push(`Gender: ${profile.gender}`);
      if (profile.interests?.length) parts.push(`Interests: ${profile.interests.join(', ')}`);
    }
    return parts.length > 0 ? parts.join('\n') : 'No specific context provided';
  }

  private formatProductCatalog(products: any[]): string {
    return products.slice(0, 15).map(p => 
      `ID: ${p.id} | ${p.name} | $${p.price} | ${p.category} | Rating: ${p.rating} | ${p.description.substring(0, 100)}...`
    ).join('\n');
  }

  private intelligentProductMatching(query: string, context: ConversationContext, products: any[]): any[] {
    const queryLower = query.toLowerCase();
    const scored = products.map(product => {
      let score = 0;
      
      // Name matching
      if (product.name.toLowerCase().includes(queryLower)) score += 10;
      
      // Category matching
      if (product.category.toLowerCase().includes(queryLower)) score += 8;
      
      // Description matching
      if (product.description.toLowerCase().includes(queryLower)) score += 5;
      
      // Tags matching
      if (product.tags?.some((tag: string) => tag.toLowerCase().includes(queryLower))) score += 6;
      
      // Context matching
      if (context.mood && product.tags?.includes(context.mood)) score += 7;
      if (context.occasion && product.tags?.includes(context.occasion)) score += 7;
      
      // Budget matching
      if (context.budget) {
        if (product.price >= context.budget.min && product.price <= context.budget.max) score += 5;
      }
      
      // Popularity boost
      if (product.rating > 4.5) score += 3;
      if (product.isTrending) score += 4;
      if (product.isNew) score += 2;
      
      return { product, score };
    });
    
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.product);
  }

  private getDefaultSuggestions(): string[] {
    return [
      'Tell me more about your style preferences',
      'What\'s your budget range?',
      'Any specific occasion in mind?',
      'Show me trending products',
      'Find eco-friendly options'
    ];
  }

  private getContextualSuggestions(query: string, context: ConversationContext): string[] {
    const suggestions = [];
    
    if (!context.budget) suggestions.push('What\'s your budget for this?');
    if (!context.occasion) suggestions.push('What occasion is this for?');
    if (!context.mood) suggestions.push('What style mood are you going for?');
    
    suggestions.push('Show me similar products');
    suggestions.push('Find alternatives in different price ranges');
    suggestions.push('What are the trending options?');
    
    return suggestions.slice(0, 4);
  }

  private extractSearchTerms(query: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
    
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5);
  }

  private extractObjectsFromText(text: string): string[] {
    const objectKeywords = ['shirt', 'dress', 'pants', 'shoes', 'bag', 'watch', 'jewelry', 'hat', 'jacket', 'sweater', 'phone', 'laptop', 'headphones', 'camera', 'furniture', 'lamp', 'chair', 'table'];
    return objectKeywords.filter(keyword => text.toLowerCase().includes(keyword));
  }

  private extractColorsFromText(text: string): string[] {
    const colorKeywords = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange', 'navy', 'beige', 'gold', 'silver'];
    return colorKeywords.filter(color => text.toLowerCase().includes(color));
  }

  private extractTagsFromText(text: string): string[] {
    const tagKeywords = ['casual', 'formal', 'trendy', 'classic', 'modern', 'vintage', 'elegant', 'sporty', 'comfortable', 'stylish'];
    return tagKeywords.filter(tag => text.toLowerCase().includes(tag));
  }
}

export const geminiService = new GeminiService();
