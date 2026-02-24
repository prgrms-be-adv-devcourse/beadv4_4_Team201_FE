import { PaginatedResponse } from './api';
import { MemberPublic } from './member';
import { Product } from './product';

/**
 * Funding status enumeration
 * - PENDING: Awaiting payment (before funding starts)
 * - IN_PROGRESS: Funding in progress
 * - ACHIEVED: Goal achieved, awaiting recipient acceptance
 * - ACCEPTED: Recipient accepted the funding
 * - REFUSED: Recipient refused the funding
 * - EXPIRED: Funding deadline passed
 * - CLOSED: Funding closed
 */
export type FundingStatus =
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'ACHIEVED'
    | 'ACCEPTED'
    | 'REFUSED'
    | 'EXPIRED'
    | 'CLOSED';

/**
 * Basic funding information
 */
export interface Funding {
    id: string;
    wishItemId: string;
    product: Product;
    organizerId: string;
    organizer: MemberPublic;
    recipientId: string;
    recipient: MemberPublic;
    targetAmount: number;
    currentAmount: number;
    status: FundingStatus;
    participantCount: number;
    expiresAt: string;
    createdAt: string;
    // New fields from Backend V2
    achievementRate?: number;
    daysRemaining?: number;
    imageKey?: string;
    receiverNickname?: string;
}

/**
 * Funding participant information
 */
export interface FundingParticipant {
    id: string;
    fundingId: string;
    memberId: string;
    member: MemberPublic;
    amount: number;
    isOrganizer: boolean;
    participatedAt: string;
}

/**
 * Detailed funding information with participants
 */
export interface FundingDetail extends Funding {
    participants: FundingParticipant[];
    myParticipation: FundingParticipant | null;
    myContribution?: number;
}

/**
 * Request body for creating a funding
 */
export interface FundingCreateRequest {
    wishItemId: string;
    expiresInDays?: number;
    message?: string;
}

/**
 * Paginated list of fundings
 */
export type FundingListResponse = PaginatedResponse<Funding>;

/**
 * Paginated list of funding participants
 */
export type ParticipantListResponse = PaginatedResponse<FundingParticipant>;

/**
 * Query parameters for funding list
 */
export interface FundingQueryParams {
    status?: FundingStatus;
    page?: number;
    size?: number;
}

/**
 * Response for accepting or refusing a funding
 */
export interface FundingCompleteResponse {
    fundingId: number;
    wishlistItemId: number;
    status: FundingStatus;
    closeAt: string;
}
