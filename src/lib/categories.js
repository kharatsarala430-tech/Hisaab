// Central place that defines all categories and whether they count as
// a "Need" or a "Want" for the 50/30/20 budget calculation.
// Loan/EMI payments are always counted as Needs (matches standard 50/30/20 rule).

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Gift', 'Other Income']

export const EXPENSE_CATEGORIES = [
  { name: 'Rent', group: 'Need' },
  { name: 'Groceries', group: 'Need' },
  { name: 'Bills', group: 'Need' },
  { name: 'Healthcare', group: 'Need' },
  { name: 'Loan/EMI', group: 'Need' },
  { name: 'Food', group: 'Want' },
  { name: 'Shopping', group: 'Want' },
  { name: 'Entertainment', group: 'Want' },
  { name: 'Travel', group: 'Want' },
  { name: 'Other', group: 'Want' },
]

export function getCategoryGroup(categoryName) {
  const match = EXPENSE_CATEGORIES.find((c) => c.name === categoryName)
  return match ? match.group : 'Want'
}
