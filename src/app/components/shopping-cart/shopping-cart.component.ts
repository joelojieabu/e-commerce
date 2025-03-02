import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { Coupon } from '../../models/coupon.model';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ShoppingCartComponent implements OnInit {
  cartItems: CartItem[] = [];
  coupon: Coupon | null = null;
  couponCode: string = '';
  couponMessage: string = '';
  shippingMethod: 'standard' | 'express' | 'free' = 'standard';

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe((items) => {
      this.cartItems = items;
    });

    this.cartService.getAppliedCoupon().subscribe((coupon) => {
      this.coupon = coupon;
    });
  }

  updateQuantity(item: CartItem, event: any): void {
    const quantity = parseInt(event.target.value, 10);
    this.cartService.updateQuantity(item.product.id, quantity);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponMessage = 'Please enter a coupon code';
      return;
    }

    const success = this.cartService.applyCoupon(this.couponCode);
    if (success) {
      this.couponMessage = 'Coupon applied successfully!';
    } else {
      this.couponMessage = 'Invalid coupon code';
    }
  }

  removeCoupon(): void {
    this.cartService.removeCoupon();
    this.couponCode = '';
    this.couponMessage = 'Coupon removed';
  }

  updateShippingMethod(method: 'standard' | 'express' | 'free'): void {
    this.shippingMethod = method;
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getSubtotal(): number {
    return this.cartService.getSubtotal();
  }

  getDiscount(): number {
    return this.cartService.getDiscount();
  }

  getShippingCost(): number {
    return this.cartService.getShippingCost(this.shippingMethod);
  }

  getTotal(): number {
    return this.cartService.getTotal(this.shippingMethod);
  }

  getItemCount(): number {
    return this.cartService.getItemCount();
  }
}
