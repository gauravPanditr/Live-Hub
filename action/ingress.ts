"use server";
import {
    IngressInput,
    IngressClient,
    
    RoomServiceClient,
    type CreateIngressOptions,
    TrackSource,
} from "livekit-server-sdk";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";

// Validate environment variables early
if (!process.env.LIVEKIT_API_URL || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    throw new Error("LiveKit environment variables are not properly configured.");
}

const roomService = new RoomServiceClient(
    process.env.LIVEKIT_API_URL,
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
);

const ingressClient = new IngressClient(process.env.LIVEKIT_API_URL);

// Reset all ingresses and rooms related to the host identity
export const resetIngresses = async (hostIdentity: string) => {
    const ingresses = await ingressClient.listIngress({
        roomName: hostIdentity,
    });

    const rooms = await roomService.listRooms([hostIdentity]);

    for (const room of rooms) {
        await roomService.deleteRoom(room.name);
    }

    for (const ingress of ingresses) {
        if (ingress.ingressId) {
            await ingressClient.deleteIngress(ingress.ingressId);
        }
    }
};

// Create an ingress (stream) with valid options
export const createIngress = async (ingressType: IngressInput) => {
    const self = await getSelf();
    await resetIngresses(self.id);

    const options: CreateIngressOptions = {
        name: self.username,
        roomName: self.id,
        participantName: self.username,
        participantIdentity: self.id,
    };

    // Ensure valid ingress type
    if (!Object.values(IngressInput).includes(ingressType)) {
        throw new Error(`Invalid ingressType provided: ${ingressType}`);
    }

    // Apply encoding presets based on input type
    if (ingressType === IngressInput.WHIP_INPUT) {
        options.enableTranscoding = true;
    } else {
        // Define video encoding settings
        options.video = {
            source: TrackSource.CAMERA,
            codec: 'h264',  // Choose the codec, can also be 'vp8'
            bitrate: 2000000, // Set the bitrate (in bits per second)
            width: 1920,   // Set the video width (e.g., 1920px for 1080p)
            height: 1080,  // Set the video height (e.g., 1080px for 1080p)
            fps: 30,       // Set frames per second (e.g., 30 FPS)
        };

        // Define audio encoding settings
        options.audio = {
            source: TrackSource.MICROPHONE,
            codec: 'opus',  // Use 'opus' codec for audio
            bitrate: 96000,  // Audio bitrate (in bits per second)
        };
    }

    try {
        // Create the ingress stream
        const ingress = await ingressClient.createIngress(ingressType, options);

        // Check if the response is valid
        if (!ingress || !ingress.url || !ingress.streamKey) {
            throw new Error("Invalid ingress response received from LiveKit.");
        }

        // Store the ingress details in the database
        await db.stream.update({
            where: { userId: self.id },
            data: {
                ingressId: ingress.ingressId,
                serverUrl: ingress.url,
                streamKey: ingress.streamKey,
            },
        });

        // Revalidate the path for stream keys to refresh the cache
        revalidatePath(`/u/${self.username}/keys`);

        // Return the created ingress details
        return ingress;

    } catch (error) {
        console.error("Error during createIngress:", error);
        throw new Error("Failed to create ingress. See logs for details.");
    }
};
