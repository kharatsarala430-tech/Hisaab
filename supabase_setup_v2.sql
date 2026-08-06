-- Run this AFTER the original supabase_setup.sql (if not already run)
-- This adds tables for EMI Manager and Savings Goals

-- EMI / Loan tracking table
create table emis (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  loan_name text not null,
  lender text,
  loan_type text not null default 'Other', -- e.g. Gadget Loan, Home Loan, Auto Loan
  principal_amount numeric not null check (principal_amount > 0),
  monthly_installment numeric not null check (monthly_installment > 0),
  due_day integer not null check (due_day between 1 and 31),
  total_installments integer not null,
  installments_paid integer not null default 0,
  created_at timestamp with time zone default now()
);

alter table emis enable row level security;

create policy "Users can view their own EMIs"
  on emis for select using (auth.uid() = user_id);
create policy "Users can insert their own EMIs"
  on emis for insert with check (auth.uid() = user_id);
create policy "Users can update their own EMIs"
  on emis for update using (auth.uid() = user_id);
create policy "Users can delete their own EMIs"
  on emis for delete using (auth.uid() = user_id);


-- Savings Goals table
create table savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  goal_name text not null,
  target_amount numeric not null check (target_amount > 0),
  current_saved numeric not null default 0,
  target_date date,
  created_at timestamp with time zone default now()
);

alter table savings_goals enable row level security;

create policy "Users can view their own goals"
  on savings_goals for select using (auth.uid() = user_id);
create policy "Users can insert their own goals"
  on savings_goals for insert with check (auth.uid() = user_id);
create policy "Users can update their own goals"
  on savings_goals for update using (auth.uid() = user_id);
create policy "Users can delete their own goals"
  on savings_goals for delete using (auth.uid() = user_id);
