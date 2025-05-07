import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { resetIngresses } from '@/action/ingress'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOKS_SECRET

  // Check if the secret is available
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable')
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 })
  }

  // Log headers and payload for debugging purposes
  const headerPayload = headers()
  const svix_id = (await headerPayload).get("svix-id")
  const svix_timestamp = (await headerPayload).get("svix-timestamp")
  const svix_signature = (await headerPayload).get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers")
    return new Response('Missing Svix headers', { status: 400 })
  }

  // Retrieve and log the webhook payload
  const payload = await req.json()
  console.log("Received payload:", JSON.stringify(payload, null, 2)) // Log the entire payload

  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  // Verify the webhook event
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Webhook verification failed', { status: 400 })
  }

  // Log event type for debugging
  const eventType = evt.type
  const userId = payload.data.id
  const username = payload.data.username || "anon"
  const imageUrl = payload.data.image_url || ""

  console.log(`Processing event: ${eventType} for user: ${userId}`)

  try {
    // Handle user creation
    if (eventType === "user.created") {
      const existing = await db.user.findUnique({
        where: { externalUserId: userId },
      })

      if (existing) {
        console.log("User already exists, skipping creation.")
        return new Response("User already exists", { status: 200 })
      }

      // Create new user in the database
      const createdUser = await db.user.create({
        data: {
          externalUserId: userId,
          username,
          imageUrl,
          stream: {
            create: {
              name: `${username}'s stream`,
            },
          },
        },
      })

      console.log("✅ User created:", createdUser.id)
      return new Response('User created successfully', { status: 200 })
    }

    // Handle user updates
    if (eventType === "user.updated") {
      const currentUser = await db.user.findUnique({
        where: { externalUserId: userId },
      })

      if (!currentUser) {
        console.warn("User to update not found:", userId)
        return new Response("User not found", { status: 404 })
      }

      // Update user details in the database
      await db.user.update({
        where: { externalUserId: userId },
        data: { username, imageUrl },
      })

      console.log("🔄 User updated:", userId)
      return new Response('User updated successfully', { status: 200 })
    }

    // Handle user deletion
    if (eventType === "user.deleted") {
      await resetIngresses(userId)

      // Delete user from the database
      await db.user.delete({
        where: { externalUserId: userId },
      })

      console.log("🗑️ User deleted:", userId)
      return new Response('User deleted successfully', { status: 200 })
    }

    // If the event type is not handled
    return new Response('Event type not handled', { status: 400 })

  } catch (err: any) {
    console.error("❌ Error processing webhook:", err)
    return new Response("Internal server error", { status: 500 })
  }
}
