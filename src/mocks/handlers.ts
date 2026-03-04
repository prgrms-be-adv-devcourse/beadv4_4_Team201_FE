import { authHandlers } from './handlers/auth';
import { homeHandlers } from './handlers/home';
import { walletHandlers } from './handlers/wallet';
import { friendsHandlers } from './handlers/friends';
import { wishlistsHandlers } from './handlers/wishlists';
import { productsHandlers } from './handlers/products';
import { fundingsHandlers } from './handlers/fundings';
import { cartHandlers } from './handlers/cart';
import { ordersHandlers } from './handlers/orders';

export const handlers = [
  ...authHandlers,
  ...homeHandlers,
  ...walletHandlers,
  ...friendsHandlers,
  ...wishlistsHandlers,
  ...productsHandlers,
  ...fundingsHandlers,
  ...cartHandlers,
  ...ordersHandlers,
];
