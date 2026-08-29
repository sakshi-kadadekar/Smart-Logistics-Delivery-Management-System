import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db';
import { predictShipmentDelay } from '../../src/utils/delayPredictor';
import { optimizeDeliveryRoute } from '../../src/utils/routeOptimizer';

export const aiRouter = Router();

// Lazy Google GenAI initialization with User-Agent telemetry
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// POST /api/ai/support-chat - Grounded AI Logistics Specialist
aiRouter.post('/support-chat', async (req: Request, res: Response) => {
  try {
    const { message, shipmentContext, userRole, trackingNumber } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Try to ground context with live DB lookup if trackingNumber is passed
    let activeContext = shipmentContext;
    if (!activeContext && trackingNumber) {
      activeContext = db.getShipmentByTrackingNumber(trackingNumber);
    }

    const ai = getGenAIClient();
    const systemPrompt = `You are "SwiftBot", the official AI logistics specialist for SwiftShip (India's premier smart delivery network).
Current user role: ${userRole || 'customer'}.
User inquiry tracking number context: ${trackingNumber || 'General logistics inquiry'}.

REAL-TIME GROUNDED DATABASE CONTEXT:
${activeContext ? JSON.stringify(activeContext, null, 2) : 'No specific shipment selected. Help the user track by asking for their tracking number starting with DLV (e.g. DLV98273519) or assist with pricing and logistics inquiries.'}

RULES:
1. Ground your answers strictly in the provided shipment data. NEVER make up fake driver names, cities, or statuses.
2. If the shipment exists, clearly state its current status (e.g., ORDER CREATED, IN TRANSIT, OUT FOR DELIVERY, DELIVERED), current location, estimated delivery date, driver details if assigned, and pickup/delivery cities.
3. Be professional, friendly, concise, and helpful. Use standard Indian Rupee (₹) and Indian time formats.
4. If a delay or exception is noted, explain the cause calmly and outline the next steps (e.g., linehaul transfer, last-mile hub dispatch).
5. If the tracking number is not found or not provided, guide them politely on how to find their tracking ID from their dashboard or booking SMS.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.6,
          },
        });

        const reply = response.text || 'I was able to retrieve your request. How else may I assist your delivery today?';
        return res.json({ success: true, reply, source: 'gemini-3.7-flash' });
      } catch (geminiErr: any) {
        console.warn('[Gemini AI] Grounded chat fallback triggered:', geminiErr?.message);
      }
    }

    // Grounded deterministic fallback
    let fallbackReply = '';
    if (activeContext && activeContext.tracking_number) {
      const s = activeContext;
      const statusClean = s.status.replace(/_/g, ' ');
      fallbackReply = `📦 **Status Update for ${s.tracking_number}**\n\n` +
        `• **Current Status:** ${statusClean}\n` +
        `• **Route:** ${s.sender_address?.city || 'Origin'} ➔ ${s.receiver_address?.city || 'Destination'}\n` +
        `• **Estimated Delivery:** ${s.estimated_delivery_date || 'In 1-2 business days'}\n` +
        `• **Delivery Tier:** ${s.delivery_type}\n` +
        `• **Package Type:** ${s.package_type || 'Standard Parcel'} (${s.weight_kg} kg)\n\n` +
        (s.driver_id ? `🚚 Your delivery partner is on schedule with vehicle assignment.` : `🏢 Package is being processed at the regional logistics sorting hub.`);
    } else {
      fallbackReply = `Welcome to SwiftShip Support! Please enter your 11-character Tracking ID (e.g. **DLV98273519**) or ask about freight rates, delivery zones, or schedule pickups.`;
    }

    return res.json({ success: true, reply: fallbackReply, source: 'grounded-engine' });
  } catch (err: any) {
    console.error('AI chat error:', err);
    res.status(500).json({ success: false, error: 'Failed to process AI chat message' });
  }
});

// POST /api/ai/delay-analysis - Analyze transit risks with Gemini 3.7 Flash + Heuristic Engine
aiRouter.post('/delay-analysis', async (req: Request, res: Response) => {
  try {
    const { shipment, trackingNumber } = req.body;

    let targetShipment = shipment;
    if (!targetShipment && trackingNumber) {
      targetShipment = db.getShipmentByTrackingNumber(trackingNumber);
    }

    if (!targetShipment) {
      return res.status(400).json({ success: false, error: 'Shipment object or valid tracking number required' });
    }

    const ai = getGenAIClient();
    if (ai) {
      try {
        const prompt = `Analyze logistical transit risk for this shipment in India:
Shipment Details:
- Tracking: ${targetShipment.tracking_number}
- Route: ${targetShipment.sender_address?.city} to ${targetShipment.receiver_address?.city} (Est. ${targetShipment.price_breakdown?.distance_km || 200} km)
- Status: ${targetShipment.status}
- Tier: ${targetShipment.delivery_type}
- Weight: ${targetShipment.weight_kg} kg
- Created: ${targetShipment.created_at}
- Target ETA: ${targetShipment.estimated_delivery_date}

Provide a JSON assessment with:
- risk_level: "LOW" | "MEDIUM" | "HIGH"
- delay_probability_percent: number (0-100)
- estimated_delay_window_hours: number
- contributing_factors: array of strings
- suggested_action: string
- confidence_score: number`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, source: 'gemini-3.7-flash', data: parsed });
        }
      } catch (geminiErr) {
        console.warn('[Gemini AI] Delay analysis fallback:', geminiErr);
      }
    }

    // Heuristic Predictor Engine
    const result = predictShipmentDelay(targetShipment);
    res.json({ success: true, source: 'delay-predictor-engine', data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to analyze delay risk' });
  }
});

// POST /api/ai/optimize-route - Intelligent TSP route ordering for drivers
aiRouter.post('/optimize-route', (req: Request, res: Response) => {
  try {
    const { driverLat, driverLng, shipmentIds, driverId } = req.body;

    let targetShipments = db.getShipments();
    if (shipmentIds && Array.isArray(shipmentIds) && shipmentIds.length > 0) {
      targetShipments = targetShipments.filter(s => shipmentIds.includes(s.id));
    } else if (driverId) {
      targetShipments = targetShipments.filter(s => s.driver_id === driverId && s.status !== 'DELIVERED' && s.status !== 'CANCELLED');
    } else {
      // Default to active Delhi/NCR shipments
      targetShipments = targetShipments.filter(s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED');
    }

    const startLat = Number(driverLat) || 28.5721;
    const startLng = Number(driverLng) || 77.2289;

    const plan = optimizeDeliveryRoute(startLat, startLng, targetShipments);

    res.json({
      success: true,
      data: plan
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to optimize route' });
  }
});
