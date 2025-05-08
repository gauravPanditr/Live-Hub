"use server"; // This directive marks this file as a server component

import { v4 } from "uuid";
import { AccessToken } from "livekit-server-sdk";
import { getSelf } from "@/lib/auth-service";
import { getUserById } from "@/lib/user-service";
import { isBlockedByUser } from "@/lib/block-service";

export const createViewerToken = async (hostIdentity: string) => {
  let self;

  try {
    // Try fetching the current user
    self = await getSelf();
  } catch (error) {
   
    console.error("Error fetching user:", error);
    // Fallback if user cannot be fetched
    const id = v4();
    const username = `guest#${Math.floor(Math.random() * 1000)}`;
    self = { id, username };
  }



  // Fetch host user by ID
  const host = await getUserById(hostIdentity);

  if (!host) {
    console.error(`Host user with ID ${hostIdentity} not found`);
    throw new Error("Host user not found");
  }

  

  // Check if the current user is blocked by the host
  const isBlocked = await isBlockedByUser(host.id);

  if (isBlocked) {
    console.error(`User ${self.id} is blocked by host ${host.id}`);
    throw new Error("User is blocked by the host");
  }

  
  const isHost = self.id === host.id;

 
  try {
    // Create LiveKit Access Token
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: isHost ? `host-${self.id}` : self.id,
        name: self.username,
      }
    );

    // Add necessary grants for the token
    token.addGrant({
      room: host.id, // Define the room the user can join
      roomJoin: true, // Grant permission to join the room
      canPublish: false, // Prevent publishing content
      canPublishData: true, // Allow data publishing (e.g., chat)
    });

   
    const jwt = await token.toJwt();

 

   
    return jwt;
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    throw new Error("Error generating LiveKit token");
  }
};
