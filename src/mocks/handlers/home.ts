import { http, HttpResponse, HttpHandler } from 'msw';
import { currentUser } from '../data/members';
import { friendsWishlists } from '../data/wishlists';
import { popularProducts } from '../data/products';
import { myParticipatedFundings } from '../data/fundings';
import { walletBalance } from '../data/mock-data';

export const homeHandlers: HttpHandler[] = [
  http.get('**/api/v2/home', () => {
    const friendWishlistsData = friendsWishlists.slice(0, 5).map((w) => ({
      member: w.member,
      wishlist: w,
      previewItems: w.items.slice(0, 3),
    }));

    return HttpResponse.json({
      member: currentUser,
      myFundings: myParticipatedFundings.slice(0, 10),
      friendsWishlists: friendWishlistsData,
      popularProducts: popularProducts.slice(0, 8),
      walletBalance,
    });
  }),
];
