// app/(dashboard)/u/[username]/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import getUserByUsername from "@/lib/user-service";
import { StreamPlayer } from "@/components/stream-player/index";
import { notFound } from "next/navigation";

interface Props {
  params: { username: string };
}

export default async function CreatorPage({ params }: Props) {
  const { username } = params;
  const externalUser = await currentUser();
  const user = await getUserByUsername(username);

  if (!user || user.externalUserId !== externalUser?.id || !user.stream) {
    notFound();
  }

  return (
    <div className="h-full">
      <StreamPlayer user={user} stream={user.stream} isFollowing />
    </div>
  );
}
