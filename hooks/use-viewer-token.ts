import { toast } from "sonner";
import { useEffect, useState } from "react";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { createViewerToken } from "@/action/token";

export const useViewerToken = (hostIdentity: string) => {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    const createToken = async () => {
      try {
        const viewerToken = await createViewerToken(hostIdentity);
        setToken(viewerToken);

        // Decode the JWT token
        const decodedToken = jwtDecode(viewerToken) as JwtPayload & { name?: string, sub?: string };
        console.log("Decoded Token:", decodedToken);  // Log the full decoded token to inspect its structure

        const name = decodedToken?.name;
        const identity = decodedToken?.sub;  // Use 'sub' as identity

        if (identity) {
          setIdentity(identity);
        }

        if (name) {
          setName(name);
        }

      } catch (error) {
        toast.error("Something went wrong");
        console.error("Error creating viewer token:", error);
      }
    };

    createToken();
  }, [hostIdentity]);

  return {
    token,
    name,
    identity,
  };
};
