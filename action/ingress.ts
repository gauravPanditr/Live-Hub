"use server"
import {
    IngressAudioEncodingPreset,
    IngressInput,
    IngressClient,
    IngressVideoEncodingPreset,
    RoomServiceClient,
    type CreateIngressOptions,
} from "livekit-server-sdk";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { TrackSource } from "livekit-server-sdk";
import { revalidatePath } from "next/cache";

const roomService = new RoomServiceClient(
    process.env.LIVEKIT_API_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
);
const ingressClient = new IngressClient(process.env.LIVEKIT_API_URL!);

// Reset all previous ingresses and rooms associated with the host identity
export const resetIngresses = async (hostIdentity: string) => {
    try {
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
    } catch (error) {
        console.error("Error resetting ingresses or rooms:", error);
        throw new Error("Failed to reset ingresses or rooms");
    }
};

// Create new ingress based on the selected type (RTMP or WHIP)
export const createIngress = async (ingressType: IngressInput) => {
    try {
        const self = await getSelf();
        if (!self) {
            throw new Error("User not found");
        }

        await resetIngresses(self.id);

        const options: CreateIngressOptions = {
            name: self.username,
            roomName: self.id,
            participantName: self.username,
            participantIdentity: self.id,
        };

        if (ingressType === IngressInput.WHIP_INPUT) {
            options.enableTranscoding = true;  // If you want WHIP to enable transcoding
        } else {
            options.video = {
                source: TrackSource.CAMERA,
                preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
            };
            options.audio = {
                source: TrackSource.MICROPHONE,
                preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS
            };
        }

        // Create ingress via LiveKit client
        const ingress = await ingressClient.createIngress(
            ingressType,
            options,
        );

        if (!ingress || !ingress.url || !ingress.streamKey) {
            console.error("Ingress creation failed. Response:", ingress);
            throw new Error("Failed to create ingress");
        }

        // Store the ingress data in the database
        await db.stream.update({
            where: { userId: self.id },
            data: {
                ingressId: ingress.ingressId,
                serverUrl: ingress.url,
                streamKey: ingress.streamKey,
            },
        });

        // Trigger cache revalidation after creating the ingress
        revalidatePath(`/u/${self.username}/keys`);
        return ingress;

    } catch (error) {
        console.error("Error creating ingress:", error);
        throw new Error("Failed to create ingress");
    }
};
