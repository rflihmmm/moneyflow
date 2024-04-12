import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import {
  CreateExpenseFormFieldset,
  createExpenseFormSchema,
  CreateExpenseFormData,
  UpdateExpenseButton,
} from "@widgets/create-expense";
import { Header } from "@widgets/header";

import { DeleteExpenseButton } from "@features/delete-expense";
import { searchTransactionsByTitle } from "@features/search-transactions";
import { getAccountBalance } from "@features/statistics";

import { useAccountsStore } from "@entities/account";
import { useExpenseCategoriesStore } from "@entities/category";
import {
  createCurrencyAmountString,
  formatAmountPrecision,
  useCurrenciesStore,
} from "@entities/currency";
import { useExpensesStore, useTransactions } from "@entities/transaction";

import { toLocalDatetime } from "@shared/lib/date";
import { PageLayout } from "@shared/ui/layouts";

export const ExpenseOverviewPage = () => {
  const { id } = useParams();
  if (typeof id === "undefined") {
    throw new Error("Impossible expense id");
  }

  const { expenseCategories } = useExpenseCategoriesStore();
  const { accounts, order: accountsOrder } = useAccountsStore();
  const { currencies } = useCurrenciesStore();
  const { getExpense, expenses } = useExpensesStore((state) => ({
    expenses: state.expenses,
    getExpense: state.getExpense,
  }));
  const transactions = useTransactions();
  const accountsWithBalances = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(accounts).map(([accountId, account]) => {
          const currency = currencies.currencies[account.currencyId];
          return [
            accountId,
            {
              ...account,
              currency,
              formattedBalance: createCurrencyAmountString({
                currency,
                amount: formatAmountPrecision(
                  getAccountBalance(
                    accountId,
                    account.initialBalance,
                    transactions,
                  ),
                  currency.precision,
                ),
              }),
            },
          ];
        }),
      ),
    [accounts, currencies, transactions],
  );

  const expense = getExpense(id);

  const methods = useForm<CreateExpenseFormData>({
    defaultValues: expense && {
      ...expense,
      datetime: toLocalDatetime(expense.datetime),
    },
    resolver: zodResolver(createExpenseFormSchema),
  });

  return (
    <PageLayout>
      <FormProvider {...methods}>
        <Header
          title="Expense Overview"
          backButton
          rightActions={
            <>
              <DeleteExpenseButton id={id} />
              <UpdateExpenseButton id={id} />
            </>
          }
        />
        <CreateExpenseFormFieldset
          expenses={expenses}
          categories={expenseCategories}
          accounts={{ accounts: accountsWithBalances, order: accountsOrder }}
          searchTransactionsByTitle={searchTransactionsByTitle}
        />
      </FormProvider>
    </PageLayout>
  );
};
