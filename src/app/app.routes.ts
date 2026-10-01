import { Routes } from '@angular/router';
import { TablesComponent } from './components/tables/tables.component';
import { MenuComponent } from './components/menu/menu.component';
import { CartComponent } from './components/cart/cart.component';
import { BillComponent } from './components/bill/bill.component';

export const routes: Routes = [
  { path: 'tables', component: TablesComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'cart', component: CartComponent },
  { path: 'bill', component: BillComponent },
  { path: '', redirectTo: 'tables', pathMatch: 'full' },
  { path: '**', redirectTo: 'tables' },
];
