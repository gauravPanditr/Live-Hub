// File: /app/api/webhooks/livekit/route.ts

import { WebhookReceiver } from "livekit-server-sdk";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

// LiveKit webhook verification setup
const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headerPayload = headers();
  const authorization = (await headerPayload).get("Authorization");

  console.log("Authorization Header:", authorization);
  console.log("Raw Request Body:", rawBody);

  if (!authorization) {
    console.error("Missing Authorization header");
    return new Response("No authorization header", { status: 400 });
  }

  let event;
  try {
    // Verify the webhook signature
    event = await receiver.receive(rawBody, authorization);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("Received Webhook Event:", event.event);
  console.log("Ingress ID:", event.ingressInfo?.ingressId);

  const ingressId = event.ingressInfo?.ingressId;
  if (!ingressId) {
    console.error("Missing ingressId in event");
    return new Response("Missing ingressId", { status: 400 });
  }

  if (event.event === "ingress_started") {
    console.log("Ingress started, marking stream as live:", ingressId);
    try {
      await db.stream.update({
        where: { ingressId },
        data: { isLive: true, updatedAt: new Date() },
      });
    } catch (err) {
      console.error("Error updating stream to live:", err);
      return new Response("Database error", { status: 500 });
    }
  }

  if (event.event === "ingress_ended") {
    console.log("Ingress ended, marking stream as offline:", ingressId);
    try {
      await db.stream.update({
        where: { ingressId },
        data: { isLive: false, updatedAt: new Date() },
      });
    } catch (err) {
      console.error("Error updating stream to offline:", err);
      return new Response("Database error", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
}

