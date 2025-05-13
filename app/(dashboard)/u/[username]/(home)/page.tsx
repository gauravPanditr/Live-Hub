import { currentUser } from "@clerk/nextjs/server";
import getUserByUsername from "@/lib/user-service";
import { StreamPlayer } from "@/components/stream-player/index";
import { notFound } from "next/navigation";

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
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
