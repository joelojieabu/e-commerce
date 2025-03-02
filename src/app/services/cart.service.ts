// File: src/app/services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { Coupon } from '../models/coupon.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItems = new BehaviorSubject<CartItem[]>([]);
  private readonly appliedCoupon = new BehaviorSubject<Coupon | null>(null);
  private readonly shippingRates = {
    standard: 5.99,
    express: 12.99,
    free: 0,
  };

  // Threshold for free shipping
  private readonly freeShippingThreshold = 1000;

  // Available coupons
  private readonly availableCoupons: Coupon[] = [
    { code: 'SAVE10', discountPercent: 10 },
    { code: 'SAVE20', discountPercent: 20 },
  ];

  constructor(private http: HttpClient) {
    // Load cart from localStorage on initialization
    this.loadCart();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getAppliedCoupon(): Observable<Coupon | null> {
    return this.appliedCoupon.asObservable();
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems.value;
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex !== -1) {
      // Item already exists, update quantity
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      this.cartItems.next(updatedItems);
    } else {
      // Add new item
      this.cartItems.next([...currentItems, { product, quantity }]);
    }

    this.saveCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    this.cartItems.next(updatedItems);
    this.saveCart();
  }

  removeFromCart(productId: number): void {
    const updatedItems = this.cartItems.value.filter(
      (item) => item.product.id !== productId
    );
    this.cartItems.next(updatedItems);
    this.saveCart();
  }

  clearCart(): void {
    this.cartItems.next([]);
    this.appliedCoupon.next(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('coupon');
  }

  applyCoupon(couponCode: string): boolean {
    const coupon = this.availableCoupons.find((c) => c.code === couponCode);

    if (coupon) {
      this.appliedCoupon.next(coupon);
      localStorage.setItem('coupon', JSON.stringify(coupon));
      return true;
    }

    return false;
  }

  removeCoupon(): void {
    this.appliedCoupon.next(null);
    localStorage.removeItem('coupon');
  }

  getSubtotal(): number {
    return this.cartItems.value.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  getDiscount(): number {
    const coupon = this.appliedCoupon.value;
    if (!coupon) return 0;

    return (this.getSubtotal() * coupon.discountPercent) / 100;
  }

  getShippingCost(
    shippingMethod: 'standard' | 'express' | 'free' = 'standard'
  ): number {
    // Check if order qualifies for free shipping
    if (this.getSubtotal() >= this.freeShippingThreshold) {
      return 0;
    }

    return this.shippingRates[shippingMethod];
  }

  getTotal(
    shippingMethod: 'standard' | 'express' | 'free' = 'standard'
  ): number {
    return (
      this.getSubtotal() -
      this.getDiscount() +
      this.getShippingCost(shippingMethod)
    );
  }

  getItemCount(): number {
    return this.cartItems.value.reduce(
      (count, item) => count + item.quantity,
      0
    );
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems.next(JSON.parse(savedCart));
    }

    const savedCoupon = localStorage.getItem('coupon');
    if (savedCoupon) {
      this.appliedCoupon.next(JSON.parse(savedCoupon));
    }
  }

  getProducts(): Observable<any> {
    return this.http.get<any>(`https://fakestoreapi.com/products`);
  }
}
