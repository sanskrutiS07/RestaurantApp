import { Injectable } from '@angular/core';
import { MenuItem, MenuCategory } from '../models/menu-item.model';

export const CATEGORIES: MenuCategory[] = ['Starters', 'Mains', 'Desserts', 'Drinks'];

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly items: MenuItem[] = [
    // Starters
    { id: 'st1', name: 'Samosa Chaat', description: 'Crispy samosas, yogurt, tamarind chutney, sev.', price: 120, category: 'Starters', veg: true, image: 'assets/img/samosa.jpg' },
    { id: 'st2', name: 'Paneer Tikka', description: 'Char-grilled cottage cheese, mint chutney.', price: 180, category: 'Starters', veg: true, image: 'assets/img/paneer-tikka.jpg' },
    { id: 'st3', name: 'Chicken 65', description: 'Spicy fried chicken tossed with curry leaves.', price: 200, category: 'Starters', veg: false, image: 'assets/img/chicken65.jpg' },
    { id: 'st4', name: 'Spring Rolls', description: 'Crunchy veg rolls with sweet chili dip.', price: 140, category: 'Starters', veg: true, image: 'assets/img/spring-rolls.jpg' },
    // Mains
    { id: 'mn1', name: 'Butter Chicken', description: 'Creamy tomato-butter curry, served with naan.', price: 300, category: 'Mains', veg: false, image: 'assets/img/butter-chicken.jpg' },
    { id: 'mn2', name: 'Paneer Butter Masala', description: 'Rich cashew-tomato gravy with paneer cubes.', price: 260, category: 'Mains', veg: true, image: 'assets/img/paneer-masala.jpg' },
    { id: 'mn3', name: 'Veg Biryani', description: 'Fragrant basmati rice, seasonal vegetables, raita.', price: 240, category: 'Mains', veg: true, image: 'assets/img/veg-biryani.jpg' },
    { id: 'mn4', name: 'Lamb Rogan Josh', description: 'Slow-cooked lamb in Kashmiri spice gravy.', price: 340, category: 'Mains', veg: false, image: 'assets/img/rogan-josh.jpg' },
    { id: 'mn5', name: 'Dal Tadka', description: 'Yellow lentils tempered with garlic and ghee.', price: 200, category: 'Mains', veg: true, image: 'assets/img/dal-tadka.jpg' },
    { id: 'mn6', name: 'Grilled Fish', description: 'Tandoor-grilled fish fillet, lemon butter sauce.', price: 320, category: 'Mains', veg: false, image: 'assets/img/grilled-fish.jpg' },
    // Desserts
    { id: 'ds1', name: 'Gulab Jamun', description: 'Warm milk dumplings in rose syrup (2 pc).', price: 100, category: 'Desserts', veg: true, image: 'assets/img/gulab-jamun.jpg' },
    { id: 'ds2', name: 'Rasmalai', description: 'Soft cheese discs in saffron milk.', price: 120, category: 'Desserts', veg: true, image: 'assets/img/rasmalai.jpg' },
    { id: 'ds3', name: 'Kulfi Falooda', description: 'Pistachio kulfi with vermicelli and rose syrup.', price: 130, category: 'Desserts', veg: true, image: 'assets/img/kulfi.jpg' },
    // Drinks
    { id: 'dr1', name: 'Mango Lassi', description: 'Chilled yogurt-mango smoothie.', price: 80, category: 'Drinks', veg: true, image: 'assets/img/mango-lassi.jpg' },
    { id: 'dr2', name: 'Masala Chai', description: 'Spiced Indian milk tea.', price: 60, category: 'Drinks', veg: true, image: 'assets/img/masala-chai.jpg' },
    { id: 'dr3', name: 'Fresh Lime Soda', description: 'Sweet, salted, or mixed.', price: 70, category: 'Drinks', veg: true, image: 'assets/img/lime-soda.jpg' },
  ];

  getAll(): MenuItem[] {
    return this.items;
  }

  getByCategory(category: MenuCategory): MenuItem[] {
    return this.items.filter((i) => i.category === category);
  }

  getById(id: string): MenuItem | undefined {
    return this.items.find((i) => i.id === id);
  }
}
