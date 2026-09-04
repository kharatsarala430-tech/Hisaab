// Central place that defines all categories, their icon, color, and whether
// they count as a "Need" or a "Want" for the 50/30/20 budget calculation.
// Loan/EMI payments are always counted as Needs (matches standard 50/30/20 rule).

import {
  Wallet, Briefcase, Gift, TrendingUp,
  Home, ShoppingCart, FileText, HeartPulse, CreditCard,
  UtensilsCrossed, ShoppingBag, Film, Plane, MoreHorizontal,
} from 'lucide-react'

export const INCOME_CATEGORIES = [
  { name: 'Salary',       icon: Wallet,     color: '#C2185B' },
  { name: 'Freelance',    icon: Briefcase,  color: '#2E7D32' },
  { name: 'Gift',         icon: Gift,       color: '#00897B' },
  { name: 'Other Income', icon: TrendingUp, color: '#1565C0' },
]

export const EXPENSE_CATEGORIES = [
  { name: 'Rent',          group: 'Need', icon: Home,            color: '#8E24AA' },
  { name: 'Groceries',     group: 'Need', icon: ShoppingCart,    color: '#00695C' },
  { name: 'Bills',         group: 'Need', icon: FileText,        color: '#212121' },
  { name: 'Healthcare',    group: 'Need', icon: HeartPulse,      color: '#D84315' },
  { name: 'Loan/EMI',      group: 'Need', icon: CreditCard,      color: '#3949AB' },
  { name: 'Food',          group: 'Want', icon: UtensilsCrossed, color: '#E53935' },
  { name: 'Shopping',      group: 'Want', icon: ShoppingBag,     color: '#1E88E5' },
  { name: 'Entertainment', group: 'Want', icon: Film,            color: '#5E35B1' },
  { name: 'Travel',        group: 'Want', icon: Plane,           color: '#00ACC1' },
  { name: 'Other',         group: 'Want', icon: MoreHorizontal,  color: '#616161' },
]

export function getCategoryGroup(categoryName) {
  const match = EXPENSE_CATEGORIES.find((c) => c.name === categoryName)
  return match ? match.group : 'Want'
}
