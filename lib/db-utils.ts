/**
 * Database utility functions for SyncScript
 * Common queries and helper methods
 */

import prisma from './prisma';
import { Role } from '@prisma/client';

// ============================================
// USER UTILITIES
// ============================================

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vaultMemberships: {
        include: {
          vault: true,
        },
      },
    },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

// ============================================
// VAULT UTILITIES
// ============================================

export async function getUserVaults(userId: string) {
  return await prisma.vault.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          sources: true,
          fileUploads: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getVaultById(vaultId: string) {
  return await prisma.vault.findUnique({
    where: { id: vaultId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          role: 'asc', // OWNER first
        },
      },
      sources: {
        include: {
          annotations: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      fileUploads: {
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

// ============================================
// PERMISSION UTILITIES
// ============================================

export async function getUserRoleInVault(
  userId: string,
  vaultId: string
): Promise<Role | null> {
  const membership = await prisma.vaultMember.findUnique({
    where: {
      userId_vaultId: {
        userId,
        vaultId,
      },
    },
  });

  return membership?.role || null;
}

export async function canUserAccessVault(
  userId: string,
  vaultId: string
): Promise<boolean> {
  const role = await getUserRoleInVault(userId, vaultId);
  return role !== null;
}

export async function canUserEditVault(
  userId: string,
  vaultId: string
): Promise<boolean> {
  const role = await getUserRoleInVault(userId, vaultId);
  return role === 'OWNER' || role === 'CONTRIBUTOR';
}

export async function isUserVaultOwner(
  userId: string,
  vaultId: string
): Promise<boolean> {
  const role = await getUserRoleInVault(userId, vaultId);
  return role === 'OWNER';
}

// ============================================
// VAULT MEMBER UTILITIES
// ============================================

export async function addUserToVault(
  userId: string,
  vaultId: string,
  role: Role = 'VIEWER'
) {
  // Check if vault already has an owner if trying to add as owner
  if (role === 'OWNER') {
    const existingOwner = await prisma.vaultMember.findFirst({
      where: {
        vaultId,
        role: 'OWNER',
      },
    });

    if (existingOwner) {
      throw new Error('Vault already has an owner');
    }
  }

  return await prisma.vaultMember.create({
    data: {
      userId,
      vaultId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      vault: true,
    },
  });
}

export async function removeUserFromVault(userId: string, vaultId: string) {
  // Don't allow removing the owner
  const membership = await prisma.vaultMember.findUnique({
    where: {
      userId_vaultId: {
        userId,
        vaultId,
      },
    },
  });

  if (membership?.role === 'OWNER') {
    throw new Error('Cannot remove vault owner. Delete vault or transfer ownership first.');
  }

  return await prisma.vaultMember.delete({
    where: {
      userId_vaultId: {
        userId,
        vaultId,
      },
    },
  });
}

export async function updateUserRoleInVault(
  userId: string,
  vaultId: string,
  newRole: Role
) {
  // If changing to OWNER, ensure no other owner exists
  if (newRole === 'OWNER') {
    const existingOwner = await prisma.vaultMember.findFirst({
      where: {
        vaultId,
        role: 'OWNER',
        NOT: {
          userId,
        },
      },
    });

    if (existingOwner) {
      throw new Error('Vault already has an owner');
    }
  }

  return await prisma.vaultMember.update({
    where: {
      userId_vaultId: {
        userId,
        vaultId,
      },
    },
    data: {
      role: newRole,
    },
    include: {
      user: true,
      vault: true,
    },
  });
}

// ============================================
// SOURCE UTILITIES
// ============================================

export async function getVaultSources(vaultId: string) {
  return await prisma.source.findMany({
    where: { vaultId },
    include: {
      annotations: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          annotations: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ============================================
// ANNOTATION UTILITIES
// ============================================

export async function getSourceAnnotations(sourceId: string) {
  return await prisma.annotation.findMany({
    where: { sourceId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ============================================
// FILE UPLOAD UTILITIES
// ============================================

export async function getVaultFileUploads(vaultId: string) {
  return await prisma.fileUpload.findMany({
    where: { vaultId },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ============================================
// STATISTICS UTILITIES
// ============================================

export async function getVaultStats(vaultId: string) {
  const [sources, annotations, fileUploads, members] = await Promise.all([
    prisma.source.count({ where: { vaultId } }),
    prisma.annotation.count({
      where: {
        source: {
          vaultId,
        },
      },
    }),
    prisma.fileUpload.count({ where: { vaultId } }),
    prisma.vaultMember.count({ where: { vaultId } }),
  ]);

  return {
    sourcesCount: sources,
    annotationsCount: annotations,
    fileUploadsCount: fileUploads,
    membersCount: members,
  };
}

export async function getUserStats(userId: string) {
  const [vaults, annotations, fileUploads] = await Promise.all([
    prisma.vaultMember.count({ where: { userId } }),
    prisma.annotation.count({ where: { authorId: userId } }),
    prisma.fileUpload.count({ where: { uploadedBy: userId } }),
  ]);

  return {
    vaultsCount: vaults,
    annotationsCount: annotations,
    fileUploadsCount: fileUploads,
  };
}
