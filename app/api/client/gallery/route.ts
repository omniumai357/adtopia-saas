import { NextRequest, NextResponse } from 'next/server';
import { createClientGallery } from '@/lib/clientGallerySystem';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({
      success: false,
      error: 'clientId is required'
    }, { status: 400 });
  }

  try {
    const gallery = createClientGallery(clientId);

    switch (action) {
      case 'images':
        const images = await gallery.getClientGallery();
        return NextResponse.json({
          success: true,
          data: images
        });

      case 'favorites':
        const favorites = await gallery.getFavoriteImages();
        return NextResponse.json({
          success: true,
          data: favorites
        });

      case 'cart':
        const cart = await gallery.getCart();
        return NextResponse.json({
          success: true,
          data: cart
        });

      case 'cart-total':
        const total = await gallery.getCartTotal();
        return NextResponse.json({
          success: true,
          data: total
        });

      case 'stats':
        const stats = await gallery.getGalleryStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'upsells':
        const upsells = await gallery.getUpsellOffers();
        return NextResponse.json({
          success: true,
          data: upsells
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "images", "favorites", "cart", "cart-total", "stats", or "upsells"'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in gallery API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, clientId, imageId, quantity } = body;

    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'clientId is required'
      }, { status: 400 });
    }

    const gallery = createClientGallery(clientId);

    switch (action) {
      case 'toggle-favorite':
        if (!imageId) {
          return NextResponse.json({
            success: false,
            error: 'imageId is required for toggle-favorite'
          }, { status: 400 });
        }
        const favoriteStatus = await gallery.toggleFavorite(imageId);
        return NextResponse.json({
          success: true,
          data: { is_favorite: favoriteStatus }
        });

      case 'add-to-cart':
        if (!imageId) {
          return NextResponse.json({
            success: false,
            error: 'imageId is required for add-to-cart'
          }, { status: 400 });
        }
        const added = await gallery.addToCart(imageId, quantity || 1);
        return NextResponse.json({
          success: added,
          message: added ? 'Added to cart successfully' : 'Failed to add to cart'
        });

      case 'remove-from-cart':
        if (!imageId) {
          return NextResponse.json({
            success: false,
            error: 'imageId is required for remove-from-cart'
          }, { status: 400 });
        }
        const removed = await gallery.removeFromCart(imageId);
        return NextResponse.json({
          success: removed,
          message: removed ? 'Removed from cart successfully' : 'Failed to remove from cart'
        });

      case 'clear-cart':
        const cleared = await gallery.clearCart();
        return NextResponse.json({
          success: cleared,
          message: cleared ? 'Cart cleared successfully' : 'Failed to clear cart'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "toggle-favorite", "add-to-cart", "remove-from-cart", or "clear-cart"'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in gallery POST API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
