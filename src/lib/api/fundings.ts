import { apiClient } from "./client";
import { resolveImageUrl } from "@/lib/image";
import type { PageParams } from "@/types/api";
import type {
  Funding,
  FundingDetail,
  FundingStatus,
  FundingCreateRequest,
  FundingListResponse,
  ParticipantListResponse,
  FundingQueryParams,
  FundingCompleteResponse,
} from "@/types/funding";

// Alias for backward compatibility
export type FundingsParams = FundingQueryParams;

export interface RefuseFundingRequest {
  reason?: string;
}

// --- Backend V2 API Response Types ---

/**
 * 백엔드 FundingResponseDto (공개 펀딩 조회)
 * @see FundingController GET /api/v2/fundings/{id}, GET /api/v2/fundings/list
 */
interface BackendFundingResponse {
  fundingId: number;
  targetAmount: number;
  currentAmount: number;
  status: string; // FundingStatus enum
  deadline?: string; // LocalDateTime
  wishlistItemId: number;
  productId?: number;
  productName: string;
  imageKey?: string;
  achievementRate: number; // 달성률 (%)
  daysRemaining: number; // 남은 일수
  receiverNickname?: string;
}

/**
 * 백엔드 ContributeFundingResponseDto (참여 펀딩 조회)
 * @see FundingController GET /api/v2/fundings/participated/{id}, GET /api/v2/fundings/participated/list
 */
interface BackendContributeFundingResponse extends BackendFundingResponse {
  myContribution: number; // 나의 기여금
}

/**
 * 백엔드 MyFundingSummaryDto (받은 펀딩 조회)
 * @see FundingController GET /api/v2/fundings/my/list
 */
interface BackendMyFundingSummary {
  fundingId: number;
  wishlistItemId: number;
  productName: string;
  imageKey?: string;
  status: string;
  targetAmount: number;
  currentAmount: number;
  achievementRate: number;
  daysRemaining: number;
  deadline?: string;
}

/**
 * 백엔드 MyFundingResponseDto (나의 펀딩 단건 조회)
 * @see FundingController GET /api/v2/fundings/my/{id}
 */
interface BackendMyFundingResponse {
  fundingId: number;
  wishlistItemId: number;
  targetAmount: number;
  currentAmount: number;
  status: string; // FundingStatus
  deadline: string; // LocalDateTime
  productName: string;
  imageKey?: string;
  participants: {
    participantId: number;
    nickName: string;
  }[] | null;
  achievementRate: number;
  daysRemaining: number;
}

// BackendMyFundingResponse is already defined above

/**
 * 백엔드 PageResponse wrapper
 */
interface BackendPageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}

// --- Mapping Functions ---

function mapFundingStatus(status: string): FundingStatus {
  switch (status) {
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "ACHIEVED":
      return "ACHIEVED";
    case "EXPIRED":
      return "EXPIRED";
    case "CLOSED":
      return "CLOSED";
    case "ACCEPTED":
      return "ACCEPTED";
    case "REFUSED":
      return "REFUSED";
    default:
      return "PENDING";
  }
}

function mapBackendFunding(backend: BackendFundingResponse): Funding {
  return {
    id: backend.fundingId.toString(),
    wishItemId: backend.wishlistItemId.toString(),
    product: {
      id: backend.productId?.toString() || "",
      name: backend.productName,
      price: backend.targetAmount, // 목표 금액을 상품 가격으로 대략적 매핑
      imageUrl: resolveImageUrl(backend.imageKey),
      status: "ON_SALE",
      brandName: "",
    },
    organizerId: "", // 백엔드에서 제공하지 않음
    organizer: {
      id: "",
      nickname: backend.receiverNickname || null,
      avatarUrl: null,
    },
    recipientId: "", // 백엔드에서 제공하지 않음
    recipient: {
      id: "",
      nickname: backend.receiverNickname || null,
      avatarUrl: null,
    },
    targetAmount: backend.targetAmount,
    currentAmount: backend.currentAmount,
    status: mapFundingStatus(backend.status),
    participantCount: 0, // 백엔드에서 제공하지 않음
    expiresAt: backend.deadline || "",
    createdAt: "", // 백엔드에서 제공하지 않음
    achievementRate: backend.achievementRate,
    daysRemaining: backend.daysRemaining,
    imageKey: backend.imageKey,
    receiverNickname: backend.receiverNickname,
  };
}

function mapBackendMyFundingSummary(backend: BackendMyFundingSummary): Funding {
  return {
    id: backend.fundingId.toString(),
    wishItemId: backend.wishlistItemId.toString(),
    product: {
      id: "",
      name: backend.productName,
      price: backend.targetAmount, // 상품 가격 = 목표 금액
      imageUrl: resolveImageUrl(backend.imageKey),
      status: "ON_SALE",
      brandName: "",
    },
    organizerId: "",
    organizer: {
      id: "",
      nickname: "Organizer",
      avatarUrl: null,
    },
    recipientId: '',
    recipient: {
      id: '',
      nickname: null, // 백엔드 미제공 (본인의 펀딩)
      avatarUrl: null,
    },
    targetAmount: backend.targetAmount,
    currentAmount: backend.currentAmount,
    status: mapFundingStatus(backend.status),
    participantCount: 0,
    expiresAt: backend.deadline || "",
    createdAt: "",
    achievementRate: backend.achievementRate,
    daysRemaining: backend.daysRemaining,
    imageKey: backend.imageKey,
  };
}

function mapBackendMyFunding(backend: BackendMyFundingResponse): FundingDetail {
  const status = mapFundingStatus(backend.status);

  // 기본 Funding 정보 매핑
  const funding: Funding = {
    id: backend.fundingId.toString(),
    wishItemId: backend.wishlistItemId.toString(),
    product: {
      id: "", // 백엔드 미제공
      name: backend.productName,
      price: backend.targetAmount, // 목표 금액을 상품 가격으로 가정
      imageUrl: resolveImageUrl(backend.imageKey),
      status: "ON_SALE",
      brandName: "",
    },
    organizerId: "", // 백엔드 미제공 (본인)
    organizer: {
      id: "",
      nickname: null, // 백엔드 미제공 (본인)
      avatarUrl: null,
    },
    recipientId: "", // 백엔드 미제공 (본인)
    recipient: {
      id: "",
      nickname: null, // 백엔드 미제공 (본인)
      avatarUrl: null,
    },
    targetAmount: backend.targetAmount,
    currentAmount: backend.currentAmount,
    status: status,
    participantCount: backend.participants?.length || 0,
    expiresAt: backend.deadline,
    createdAt: "",
    achievementRate: backend.achievementRate,
    daysRemaining: backend.daysRemaining,
    imageKey: backend.imageKey,
  };

  // Participants 매핑
  const participants = (backend.participants || []).map(p => ({
    id: p.participantId.toString(),
    fundingId: backend.fundingId.toString(),
    memberId: "", // 백엔드 미제공
    member: {
      id: "",
      nickname: p.nickName,
      avatarUrl: null,
    },
    amount: 0, // 백엔드 미제공 (삭제됨)
    isOrganizer: false,
    participatedAt: "", // 백엔드 미제공
  }));

  return {
    ...funding,
    participants: participants,
    myParticipation: null, // 본인의 펀딩이므로 null 또는 적절한 값
  };
}

// --- Mapping Functions ---
function mapPageResponse<T>(
  backendPage: BackendPageResponse<T>,
  mapper: (item: T) => Funding,
): FundingListResponse {
  const mapped = backendPage.content.map(mapper);
  return {
    content: mapped,
    items: mapped,
    page: {
      page: backendPage.pageNumber,
      size: backendPage.pageSize,
      totalElements: backendPage.totalElements,
      totalPages: backendPage.totalPages,
      hasNext: !backendPage.isLast,
      hasPrevious: !backendPage.isFirst,
    },
  };
}

// --- API Functions ---

/**
 * 나의 펀딩 단건 조회
 * @endpoint GET /api/v2/fundings/my/{id}
 */
export async function getMyFunding(fundingId: string): Promise<FundingDetail> {
  const backend = await apiClient.get<BackendMyFundingResponse>(
    `/api/v2/fundings/my/${fundingId}`
  );
  return mapBackendMyFunding(backend);
}

/**
 * 펀딩 단건 조회
 * @endpoint GET /api/v2/fundings/{id}
 */
export async function getFunding(fundingId: string): Promise<FundingDetail> {
  const backend = await apiClient.get<BackendFundingResponse>(
    `/api/v2/fundings/${fundingId}`,
  );
  const funding = mapBackendFunding(backend);
  return {
    ...funding,
    participants: [],
    myParticipation: null,
  };
}

/**
 * 참여한 펀딩 단건 조회
 * @endpoint GET /api/v2/fundings/participated/{id}
 */
export async function getParticipatedFunding(fundingId: string): Promise<FundingDetail> {
  const backend = await apiClient.get<BackendContributeFundingResponse>(
    `/api/v2/fundings/participated/${fundingId}`,
  );
  const funding = mapBackendFunding(backend);
  return {
    ...funding,
    participants: [],
    myParticipation: null,
    myContribution: backend.myContribution,
  };
}

/**
 * 펀딩 목록 조회 (공개)
 * @endpoint GET /api/v2/fundings/list
 */
export async function getFundings(
  params?: FundingsParams,
): Promise<FundingListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append("page", params.page.toString());
  if (params?.size !== undefined)
    queryParams.append("size", params.size.toString());
  if (params?.status !== undefined) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/v2/fundings/list?${queryString}`
    : "/api/v2/fundings/list";

  const response =
    await apiClient.get<BackendPageResponse<BackendFundingResponse>>(endpoint);
  return mapPageResponse(response, mapBackendFunding);
}

/**
 * 참여한 펀딩 목록 조회
 * @endpoint GET /api/v2/fundings/participated/list
 */
export async function getMyParticipatedFundings(
  params?: FundingsParams,
): Promise<FundingListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append("page", params.page.toString());
  if (params?.size !== undefined)
    queryParams.append("size", params.size.toString());
  if (params?.status !== undefined) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/v2/fundings/participated/list?${queryString}`
    : "/api/v2/fundings/participated/list";

  const response =
    await apiClient.get<BackendPageResponse<BackendContributeFundingResponse>>(
      endpoint,
    );

  // 참여한 펀딩 목록의 각 아이템에는 myContribution이 포함되어 있음
  const mappedContent = response.content.map(item => {
    const funding = mapBackendFunding(item);
    return {
      ...funding,
      myContribution: item.myContribution
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any; // FundingListResponse는 Funding[]을 가지는데, 여기서는 myContribution이 포함된 특수 케이스
  });

  return {
    content: mappedContent,
    items: mappedContent,
    page: {
      page: response.pageNumber,
      size: response.pageSize,
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      hasNext: !response.isLast,
      hasPrevious: !response.isFirst,
    },
  };
}

/**
 * 받은 펀딩 목록 조회 (수령자)
 * @endpoint GET /api/v2/fundings/my/list
 */
export async function getMyReceivedFundings(
  params?: FundingsParams,
): Promise<FundingListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append("page", params.page.toString());
  if (params?.size !== undefined)
    queryParams.append("size", params.size.toString());
  if (params?.status !== undefined) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/v2/fundings/my/list?${queryString}`
    : "/api/v2/fundings/my/list";

  const response =
    await apiClient.get<BackendPageResponse<BackendMyFundingSummary>>(endpoint);
  return mapPageResponse(response, mapBackendMyFundingSummary);
}

/**
 * 친구들 진행 중인 펀딩 리스트 조회
 * @endpoint GET /api/v2/fundings/friends/list
 */
export async function getFriendsFundings(
  params?: PageParams,
): Promise<FundingListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append("page", params.page.toString());
  if (params?.size !== undefined) queryParams.append("size", params.size.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/v2/fundings/friends/list?${queryString}`
    : "/api/v2/fundings/friends/list";

  const response = await apiClient.get<BackendPageResponse<BackendFundingResponse>>(endpoint);
  return mapPageResponse(response, mapBackendFunding);
}

/**
 * 특정 친구의 펀딩 단건 조회
 * @endpoint GET /api/v2/fundings/friend/{friendId}/{id}
 */
export async function getFriendFundingDetail(friendId: string, fundingId: string): Promise<FundingDetail> {
  const backend = await apiClient.get<BackendFundingResponse>(
    `/api/v2/fundings/friend/${friendId}/${fundingId}`
  );
  const funding = mapBackendFunding(backend);
  return {
    ...funding,
    participants: [],
    myParticipation: null,
  };
}

/**
 * 친구의 진행 중인 펀딩 단건 조회
 * @endpoint GET /api/v2/fundings/friends/{id}
 */
export async function getFriendFunding(fundingId: string): Promise<FundingDetail> {
  const backend = await apiClient.get<BackendFundingResponse>(
    `/api/v2/fundings/friends/${fundingId}`
  );
  const funding = mapBackendFunding(backend);
  return {
    ...funding,
    participants: [],
    myParticipation: null,
  };
}

/**
 * 친구의 진행 중인 펀딩 목록 조회
 * @endpoint GET /api/v2/fundings/friends/{friendId}/list
 */
export async function getFriendFriendFundings(
  friendId: string,
  params?: PageParams,
): Promise<FundingListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append("page", params.page.toString());
  if (params?.size !== undefined) queryParams.append("size", params.size.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/v2/fundings/friends/${friendId}/list?${queryString}`
    : `/api/v2/fundings/friends/${friendId}/list`;

  const response = await apiClient.get<BackendPageResponse<BackendFundingResponse>>(endpoint);
  return mapPageResponse(response, mapBackendFunding);
}



/**
 * 특정 친구의 진행 중인 펀딩 리스트 조회
 * @endpoint GET /api/v2/fundings/friend/{friendId}/list
 */
export async function getFriendInProgressFundings(
  friendId: string,
  params?: FundingsParams,
): Promise<FundingListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append("page", params.page.toString());
  if (params?.size !== undefined) queryParams.append("size", params.size.toString());
  if (params?.status !== undefined) queryParams.append("status", params.status);

  const queryString = queryParams.toString();
  const endpoint = queryString
    ? `/api/v2/fundings/friend/${friendId}/list?${queryString}`
    : `/api/v2/fundings/friend/${friendId}/list`;

  const response = await apiClient.get<BackendPageResponse<BackendFundingResponse>>(endpoint);
  return mapPageResponse(response, mapBackendFunding);
}

/**
 * 펀딩 생성
 * @note 펀딩 생성은 장바구니 → 주문 → 결제 플로우로 처리됨
 * @see Cart API: POST /api/v2/carts/{cartId} with targetType: "FUNDING_PENDING"
 */
export async function createFunding(
  _data: FundingCreateRequest,
): Promise<Funding> {
  throw new Error(
    "펀딩 생성은 장바구니에 FUNDING_PENDING 타입으로 추가한 후 주문/결제로 처리됩니다.",
  );
}

/**
 * 펀딩 참여
 * @note 펀딩 참여는 장바구니 → 주문 → 결제 플로우로 처리됨
 * @see Cart API: POST /api/v2/carts/{cartId} with targetType: "FUNDING"
 * @deprecated 장바구니 API를 직접 사용하세요
 */
export async function participateFunding(
  _fundingId: string,
  _amount: number,
): Promise<void> {
  throw new Error(
    "펀딩 참여는 장바구니에 FUNDING 타입으로 추가한 후 주문/결제로 처리됩니다.",
  );
}

/**
 * 펀딩 수락 (수령자)
 * @endpoint POST /api/v2/fundings/{id}/accept
 */
export async function acceptFunding(fundingId: string): Promise<FundingCompleteResponse> {
  return apiClient.post<FundingCompleteResponse>(`/api/v2/fundings/${fundingId}/accept`, {});
}

/**
 * 펀딩 거절 (수령자)
 * @endpoint POST /api/v2/fundings/{id}/refuse
 */
export async function refuseFunding(
  fundingId: string,
  data?: RefuseFundingRequest,
): Promise<FundingCompleteResponse> {
  return apiClient.post<FundingCompleteResponse>(
    `/api/v2/fundings/${fundingId}/refuse`,
    data || {},
  );
}

/**
 * 펀딩 참여자 목록 조회
 * @note 백엔드에 해당 API 없음 - 빈 배열 반환
 * @todo 필요 시 백엔드에 API 추가 요청
 */
export async function getFundingParticipants(
  _fundingId: string,
  _params?: PageParams,
): Promise<ParticipantListResponse> {
  // TODO: 백엔드에 API 추가 후 구현
  return {
    content: [],
    items: [],
    page: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
  };
}
