import { apiRequest } from "@/lib/api/client";

export interface ProfileData {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  pinEnabled: boolean;
  isDefault: boolean;
  sortOrder: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfilePayload {
  displayName: string;
  avatarUrl?: string | null;
  pinCode?: string | null;
  isDefault?: boolean;
}

export interface UpdateProfilePayload {
  displayName?: string;
  avatarUrl?: string | null;
  pinCode?: string | null;
  isDefault?: boolean;
  sortOrder?: number;
}

export const profileApi = {
  async list(): Promise<ProfileData[]> {
    const response = await apiRequest<{ profiles: ProfileData[] }>("/profiles", {
      method: "GET",
    });
    return response.profiles;
  },

  async getById(profileId: string): Promise<ProfileData> {
    return apiRequest<ProfileData>(`/profiles/${profileId}`, {
      method: "GET",
    });
  },

  async create(payload: CreateProfilePayload): Promise<ProfileData> {
    return apiRequest<ProfileData, CreateProfilePayload>("/profiles", {
      method: "POST",
      body: payload,
    });
  },

  async update(profileId: string, payload: UpdateProfilePayload): Promise<ProfileData> {
    return apiRequest<ProfileData, UpdateProfilePayload>(`/profiles/${profileId}`, {
      method: "PATCH",
      body: payload,
    });
  },

  async delete(profileId: string): Promise<void> {
    await apiRequest<{ deleted: boolean }>(`/profiles/${profileId}`, {
      method: "DELETE",
    });
  },

  async select(profileId: string): Promise<{ profile: ProfileData; token: string }> {
    return apiRequest<{ profile: ProfileData; token: string }>(`/profiles/${profileId}/select`, {
      method: "POST",
    });
  },

  async verifyPin(profileId: string, pinCode: string): Promise<{ valid: boolean; profile: ProfileData }> {
    return apiRequest<{ valid: boolean; profile: ProfileData }, { profileId: string; pinCode: string }>(
      "/profiles/verify-pin",
      {
        method: "POST",
        body: { profileId, pinCode },
      }
    );
  },

  async setPin(profileId: string, pinCode: string): Promise<void> {
    await apiRequest<{ updated: boolean }, { pinCode: string }>(`/profiles/${profileId}/pin`, {
      method: "POST",
      body: { pinCode },
    });
  },
};
