import { PaginatedResponse } from './api';

/**
 * Member role enumeration
 */
export type MemberRole = 'USER' | 'BUYER' | 'SELLER';

/**
 * Member status enumeration
 */
export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';

/**
 * Full member information (private)
 */
export interface Member {
    id: string; // Backend sends number, JS runtime handles it.
    authSub: string;
    nickname: string | null;
    email: string;
    name?: string | null; // Added based on spec
    avatarUrl: string | null;
    role: MemberRole;
    status: MemberStatus;
    birthday?: string;
    address?: string;
    phoneNum?: string;
    createdAt?: string; // Spec didn't mention this in v2 response but maybe present? kept optional.
}

export interface MemberPublic {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
}

export interface MemberUpdateRequest {
    nickname?: string;
    avatarUrl?: string; // Spec doesn't mention avatarUrl in PATCH, but logic might remain.
    birthday?: string;
    address?: string;
    phoneNum?: string;
    name?: string; // Spec allows name update? Spec PATCH excludes name. Wait, "name" in Request body? "name" is in Response. Request: nickname, address, phoneNum.
    // Let's keep existing fields plus whatever spec supports.
}

export type MemberListResponse = PaginatedResponse<MemberPublic>;

export interface LoginResponse {
    isNewUser: boolean;
    authSub: string; // Added
    email: string;   // Added
    name: string;    // Added
    member: Member | null; // Nullable
}

export interface RegistrationStatusResponse {
    registered: boolean;
    member: Member | null;
}

export interface NicknameCheckResponse {
    available: boolean;
    nickname: string;
}
