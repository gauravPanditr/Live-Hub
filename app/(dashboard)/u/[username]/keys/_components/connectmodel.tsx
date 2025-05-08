"use client";

import { toast } from "sonner";
import { useState, useTransition, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { IngressInput } from "livekit-server-sdk";

import { createIngress } from "@/action/ingress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ConnectModal = () => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();
  const [ingressType, setIngressType] = useState<IngressInput>(IngressInput.RTMP_INPUT);

  const onSubmit = () => {
    startTransition(() => {
      toast.loading("Creating ingress...", { id: "ingress" });

      createIngress(ingressType)
        .then((response) => {
          console.log("Ingress response:", response); // Log the response
          toast.success("Ingress created", { id: "ingress" });
          closeRef?.current?.click();
        })
        .catch((err) => {
          console.error("Create ingress error:", err);
          toast.error("Something went wrong", { id: "ingress" });
        });
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Generate connection</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate connection</DialogTitle>
        </DialogHeader>
        <Select
          disabled={isPending}
          value={ingressType.toString()}
          onValueChange={(value) =>
            setIngressType(
              value === IngressInput.RTMP_INPUT.toString()
                ? IngressInput.RTMP_INPUT
                : IngressInput.WHIP_INPUT
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Ingress Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={IngressInput.RTMP_INPUT.toString()}>RTMP</SelectItem>
            <SelectItem value={IngressInput.WHIP_INPUT.toString()}>WHIP</SelectItem>
          </SelectContent>
        </Select>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning!</AlertTitle>
          <AlertDescription>
            This action will reset all active streams using the current connection
          </AlertDescription>
        </Alert>
        <div className="flex justify-between">
          <DialogClose ref={closeRef} asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button disabled={isPending} onClick={onSubmit} variant="default">
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
