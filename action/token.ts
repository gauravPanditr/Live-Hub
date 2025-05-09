"use server";

import { v4 as uuidv4 } from "uuid";
import { AccessToken } from "livekit-server-sdk";
import { getSelf } from "@/lib/auth-service";
import { getUserById } from "@/lib/user-service";
import { isBlockedByUser } from "@/lib/block-service";

export const createViewerToken = async (hostIdentity: string) => {
  let self;

  try {
    // Try fetching the current user (authenticated)
    self = await getSelf();

    if (!self?.id || !self?.username) {
      throw new Error("Invalid user object");
    }
  } catch (error) {
    // If auth fails, fall back to guest identity
    console.error("🟠 Guest fallback - failed to fetch user:", error);

    self = {
      id: `guest-${uuidv4()}`,
      username: `guest#${Math.floor(Math.random() * 10000)}`,
    };
  }

  // Fetch the host user
  const host = await getUserById(hostIdentity);
  if (!host) {
    console.error(`❌ Host user with ID ${hostIdentity} not found`);
    throw new Error("Host user not found");
  }

  // Check if the viewer is blocked by the host
  const isBlocked = await isBlockedByUser(host.id);
  if (isBlocked) {
    console.error(`⛔ User ${self.id} is blocked by host ${host.id}`);
    throw new Error("User is blocked by the host");
  }

  const isHost = self.id === host.id;
  const identity = isHost ? `host-${self.id}` : self.id;

  try {
    // Debug log for token creation
    console.log("🔐 Creating token for identity:", identity);
    console.log("🔤 Username:", self.username);

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity, // Ensure identity is included in the token
        name: self.username,
      }
    );

    // Add grants
    token.addGrant({
      room: host.id,
      roomJoin: true,
      canPublish: false,
      canPublishData: true,
    });

    const jwt = await token.toJwt();
    

    return jwt;
  } catch (error) {
    console.error("❌ Error generating LiveKit token:", error);
    throw new Error("Failed to generate LiveKit token");
  }
};
