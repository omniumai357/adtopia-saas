import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GalleryImage {
  id: string;
  client_id: string;
  image_url: string;
  image_type: 'ad_card' | 'landing_page' | 'logo' | 'banner';
  service_type: string;
  variant: 'urgency' | 'value' | 'hybrid';
  title: string;
  description: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface ClientGallery {
  id: string;
  client_id: string;
  service_type: string;
  total_images: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
}

interface CartItem {
  id: string;
  client_id: string;
  image_id: string;
  image_url: string;
  title: string;
  price: number;
  quantity: number;
  added_at: string;
}

interface UpsellOffer {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percent?: number;
  is_recommended: boolean;
}

/**
 * Client Gallery System
 * Manages 60-card vaults, heart favorites, and checkout flow
 */
export class ClientGallerySystem {
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Get client's gallery with all 60 images
   */
  async getClientGallery(): Promise<GalleryImage[]> {
    try {
      const { data, error } = await supabase
        .from('client_gallery_images')
        .select('*')
        .eq('client_id', this.clientId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching client gallery:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch client gallery:', error);
      return [];
    }
  }

  /**
   * Get client's favorite images
   */
  async getFavoriteImages(): Promise<GalleryImage[]> {
    try {
      const { data, error } = await supabase
        .from('client_gallery_images')
        .select('*')
        .eq('client_id', this.clientId)
        .eq('is_favorite', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorite images:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch favorite images:', error);
      return [];
    }
  }

  /**
   * Toggle favorite status for an image
   */
  async toggleFavorite(imageId: string): Promise<boolean> {
    try {
      // Get current favorite status
      const { data: currentImage, error: fetchError } = await supabase
        .from('client_gallery_images')
        .select('is_favorite')
        .eq('id', imageId)
        .eq('client_id', this.clientId)
        .single();

      if (fetchError) {
        console.error('Error fetching image:', fetchError);
        return false;
      }

      const newFavoriteStatus = !currentImage.is_favorite;

      // Update favorite status
      const { error: updateError } = await supabase
        .from('client_gallery_images')
        .update({ 
          is_favorite: newFavoriteStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', imageId)
        .eq('client_id', this.clientId);

      if (updateError) {
        console.error('Error updating favorite status:', updateError);
        return false;
      }

      return newFavoriteStatus;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  }

  /**
   * Add image to cart
   */
  async addToCart(imageId: string, quantity: number = 1): Promise<boolean> {
    try {
      // Get image details
      const { data: image, error: imageError } = await supabase
        .from('client_gallery_images')
        .select('*')
        .eq('id', imageId)
        .eq('client_id', this.clientId)
        .single();

      if (imageError || !image) {
        console.error('Error fetching image for cart:', imageError);
        return false;
      }

      // Check if item already in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('client_cart_items')
        .select('*')
        .eq('client_id', this.clientId)
        .eq('image_id', imageId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking cart:', checkError);
        return false;
      }

      if (existingItem) {
        // Update quantity
        const { error: updateError } = await supabase
          .from('client_cart_items')
          .update({ 
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (updateError) {
          console.error('Error updating cart item:', updateError);
          return false;
        }
      } else {
        // Add new item to cart
        const { error: insertError } = await supabase
          .from('client_cart_items')
          .insert({
            client_id: this.clientId,
            image_id: imageId,
            image_url: image.image_url,
            title: image.title,
            price: this.getImagePrice(image),
            quantity: quantity,
            added_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error adding to cart:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  }

  /**
   * Remove image from cart
   */
  async removeFromCart(imageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('client_cart_items')
        .delete()
        .eq('client_id', this.clientId)
        .eq('image_id', imageId);

      if (error) {
        console.error('Error removing from cart:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return false;
    }
  }

  /**
   * Get client's cart
   */
  async getCart(): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('client_cart_items')
        .select('*')
        .eq('client_id', this.clientId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching cart:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      return [];
    }
  }

  /**
   * Get cart total
   */
  async getCartTotal(): Promise<{ subtotal: number; total: number; itemCount: number }> {
    try {
      const cartItems = await this.getCart();
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // Apply any discounts or upsells
      const total = subtotal; // In production, apply discounts here

      return { subtotal, total, itemCount };
    } catch (error) {
      console.error('Failed to calculate cart total:', error);
      return { subtotal: 0, total: 0, itemCount: 0 };
    }
  }

  /**
   * Get available upsell offers
   */
  async getUpsellOffers(): Promise<UpsellOffer[]> {
    try {
      const cartItems = await this.getCart();
      const offers: UpsellOffer[] = [];

      // SEO Audit upsell
      if (cartItems.length > 0) {
        offers.push({
          id: 'seo_audit',
          name: 'SEO Audit & Optimization',
          description: 'Professional SEO analysis and keyword optimization for your ads',
          price: 49,
          discount_percent: 20,
          is_recommended: true
        });
      }

      // Custom Branding upsell
      if (cartItems.length >= 5) {
        offers.push({
          id: 'custom_branding',
          name: 'Custom Branding Package',
          description: 'Custom logo design and brand consistency across all materials',
          price: 99,
          discount_percent: 15,
          is_recommended: false
        });
      }

      // Social Media Package upsell
      if (cartItems.length >= 10) {
        offers.push({
          id: 'social_media_package',
          name: 'Social Media Package',
          description: 'Instagram, Facebook, and LinkedIn optimized versions of your ads',
          price: 149,
          discount_percent: 25,
          is_recommended: true
        });
      }

      return offers;
    } catch (error) {
      console.error('Failed to get upsell offers:', error);
      return [];
    }
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('client_cart_items')
        .delete()
        .eq('client_id', this.clientId);

      if (error) {
        console.error('Error clearing cart:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    }
  }

  /**
   * Get image price based on type and variant
   */
  private getImagePrice(image: GalleryImage): number {
    const basePrice = 19.99; // Base price per image
    
    // Premium pricing for certain types
    if (image.image_type === 'landing_page') {
      return basePrice * 2; // Landing pages cost more
    }
    
    if (image.variant === 'hybrid') {
      return basePrice * 1.5; // Hybrid variants are premium
    }
    
    return basePrice;
  }

  /**
   * Get gallery statistics
   */
  async getGalleryStats(): Promise<{
    total_images: number;
    favorite_count: number;
    cart_count: number;
    total_value: number;
  }> {
    try {
      const [gallery, favorites, cart] = await Promise.all([
        this.getClientGallery(),
        this.getFavoriteImages(),
        this.getCart()
      ]);

      const totalValue = gallery.reduce((sum, image) => sum + this.getImagePrice(image), 0);

      return {
        total_images: gallery.length,
        favorite_count: favorites.length,
        cart_count: cart.length,
        total_value: totalValue
      };
    } catch (error) {
      console.error('Failed to get gallery stats:', error);
      return {
        total_images: 0,
        favorite_count: 0,
        cart_count: 0,
        total_value: 0
      };
    }
  }
}

/**
 * Create gallery system instance for client
 */
export function createClientGallery(clientId: string): ClientGallerySystem {
  return new ClientGallerySystem(clientId);
}
