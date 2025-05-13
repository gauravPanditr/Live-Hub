import { notFound } from 'next/navigation';

import getUserByUsername from '@/lib/user-service';
import { isFollowingUser }   from '@/lib/follow-service';
import { isBlockedByUser }    from '@/lib/block-service';
import { StreamPlayer }       from '@/components/stream-player/index';

// 1) Mark params as a Promise
interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

// 2) Await params before using its properties
export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  const user = await getUserByUsername(username);
  if (!user || !user.stream) {
    notFound();
  }

  const isFollowing = await isFollowingUser(user.id);
  const isBlocked   = await isBlockedByUser(user.id);

  if (isBlocked) {
    notFound();
  }

  return (
    <StreamPlayer user={user} stream={user.stream} isFollowing={isFollowing} />
  )
}
