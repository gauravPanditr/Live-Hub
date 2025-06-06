import { getSelf } from "./auth-service";
import { db } from "./db";

export const getFollowedUsers = async () => {
  try {
    const self = await getSelf();
    const followedUsers = await db.follow.findMany({
      where: {
        followerId: self.id,
        following: {
          blocking: {
            none: {
              blockedId: self.id,
            },
          },
        },
      },
      include: {
        following: {
          include: {
            stream: {
              select: {
                isLive: true,
              },
            },
          },
        },
      },
    });
    return followedUsers;
  } catch {
    // error ignored, just return empty list
    return [];
  }
};

export const isFollowingUser = async (id: string) => {
  try {
    const self = await getSelf();
    const otherUser = await db.user.findUnique({ where: { id } });
    if (!otherUser) throw new Error("User not found");
    if (otherUser.id === self.id) return true;

    const existingFollow = await db.follow.findFirst({
      where: {
        followerId: self.id,
        followingId: otherUser.id,
      },
    });
    return !!existingFollow;
  } catch {
    return false;
  }
};

export const followUser = async (id: string) => {
  const self = await getSelf();
  const otherUser = await db.user.findUnique({ where: { id } });
  if (!otherUser) throw new Error("User not found");
  if (otherUser.id === self.id) throw new Error("Cannot follow yourself");

  const existingFollow = await db.follow.findFirst({
    where: {
      followerId: self.id,
      followingId: otherUser.id,
    },
  });
  if (existingFollow) throw new Error("Already following");

  return await db.follow.create({
    data: {
      followerId: self.id,
      followingId: otherUser.id,
    },
    include: {
      follower: true,
      following: true,
    },
  });
};

export const unfollowUser = async (id: string) => {
  const self = await getSelf();
  const otherUser = await db.user.findUnique({ where: { id } });
  if (!otherUser) throw new Error("User not found");
  if (otherUser.id === self.id) throw new Error("Cannot unfollow yourself");

  const existingFollow = await db.follow.findFirst({
    where: {
      followerId: self.id,
      followingId: otherUser.id,
    },
  });
  if (!existingFollow) throw new Error("Not following");

  return await db.follow.delete({
    where: { id: existingFollow.id },
    include: { following: true },
  });
};
