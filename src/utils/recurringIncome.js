import { supabase } from '../lib/supabase'

// Checks if any recurring incomes are missing for the current month,
// and adds them automatically. Safe to call every time the app loads.
export async function checkAndAddRecurringIncomes(userId) {
  const today = new Date()
  const currentMonth = today.getMonth() // 0-11
  const currentYear = today.getFullYear()

  // Step A: Find all transactions marked as recurring templates
  const { data: recurringItems, error: fetchError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_recurring', true)

  if (fetchError) {
    console.error('Error fetching recurring items:', fetchError.message)
    return
  }
  if (!recurringItems || recurringItems.length === 0) return

  // Only keep one "template" per unique recurring_day + category + amount
  // (so we don't create duplicate templates if the user added recurring income multiple times)
  const seen = new Set()
  const uniqueTemplates = recurringItems.filter((item) => {
    const key = `${item.recurring_day}-${item.category}-${item.amount}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  for (const item of uniqueTemplates) {
    // Step B: Check if this recurring income was already added this month
    const { data: existing, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('category', item.category)
      .eq('amount', item.amount)
      .eq('type', 'income')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)

    if (checkError) {
      console.error('Error checking existing transaction:', checkError.message)
      continue
    }

    if (!existing || existing.length === 0) {
      // Step C: Not added yet this month — insert it
      // Handle months with fewer days (e.g. recurring_day 31 in February)
      const safeDay = Math.min(item.recurring_day, daysInCurrentMonth)
      const newDate = new Date(currentYear, currentMonth, safeDay).toISOString().split('T')[0]

      const { error: insertError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'income',
        amount: item.amount,
        category: item.category,
        note: item.note ? `${item.note} (auto)` : 'Auto-added (recurring)',
        date: newDate,
        is_recurring: true,
        recurring_day: item.recurring_day,
      })

      if (insertError) {
        console.error('Error auto-adding recurring income:', insertError.message)
      }
    }
  }
}
