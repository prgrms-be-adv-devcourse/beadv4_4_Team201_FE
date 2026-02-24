/**
 * TanStack Query key factory for consistent cache management
 *
 * Usage:
 * - useQuery({ queryKey: queryKeys.funding('123'), ... })
 * - queryClient.invalidateQueries({ queryKey: queryKeys.cart })
 */
export const queryKeys = {
  // Home
  home: ['home'] as const,

  // Fundings
  fundings: ['fundings'] as const,
  funding: (id: string) => ['fundings', id] as const,
  myFunding: (id: string) => ['fundings', 'my', id] as const,
  myParticipatedFundings: ['fundings', 'participated'] as const,
  myReceivedFundings: ['fundings', 'received'] as const,

  // Cart
  cart: ['cart'] as const,

  // Wallet
  wallet: ['wallet'] as const,
  walletHistory: (params?: { type?: string }) => ['wallet', 'history', params] as const,

  // Wishlist
  myWishlist: ['wishlists', 'me'] as const,
  wishlist: (memberId: string) => ['wishlists', memberId] as const,
  publicWishlistSearch: (nickname?: string) => ['wishlists', 'search', nickname] as const,
  publicWishlist: (memberId: string) => ['wishlists', 'public', memberId] as const,

  // Products
  products: Object.assign(

    (params?: object) => ['products', params] as const,
    {
      popular: () => ['products', 'popular'] as const,
    }

  ),
  product: (id: string) => ['products', id] as const,

  // Friends
  friends: ['friends'] as const,
  friendRequests: ['friends', 'requests'] as const,

  // Members
  member: (id: string) => ['members', id] as const,
  memberFriends: (id: string) => ['members', id, 'friends'] as const,

  // Orders
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,

  // Auth
  me: ['auth', 'me'] as const,

  // Seller - prefix만 있으면 invalidation 시 모든 filter 결과 무효화
  sellerProductsPrefix: ['products', 'seller'] as const,
  sellerProducts: (params?: object) => ['products', 'seller', params] as const,
  stockHistory: (productId: string) => ['products', productId, 'stock'] as const,
} as const;

/**
 * Cache Invalidation Rules Reference:
 *
 * | Mutation                | Invalidate Keys                                    |
 * |-------------------------|---------------------------------------------------|
 * | Add to cart             | cart, funding(id)                                 |
 * | Remove from cart        | cart                                              |
 * | Update cart item        | cart                                              |
 * | Create funding          | myWishlist,  home             |
 * | Participate in funding  | funding(id), cart                                 |
 * | Accept/Refuse funding   | funding(id), myReceivedFundings                   |
 * | Charge wallet           | wallet, walletHistory                             |
 * | Pay order               | wallet, walletHistory, cart, affected funding(id)s|
 * | Add wishlist item       | myWishlist                                        |
 * | Delete wishlist item    | myWishlist                                        |
 */
