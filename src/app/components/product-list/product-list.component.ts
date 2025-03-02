import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { TruncatePipe } from "../../pipes/truncate.pipe";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, TruncatePipe],
})
export class ProductListComponent implements OnInit {
  products!: Product[];
  loading: boolean = true;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.getProducts().subscribe((data) => {
      this.products = data;
      this.loading = false;
    });
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
}
