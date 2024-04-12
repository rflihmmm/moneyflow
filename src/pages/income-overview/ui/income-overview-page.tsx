import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import {
  CreateIncomeFormFieldset,
  createIncomeFormSchema,
  CreateIncomeFormData,
  UpdateIncomeButton,
} from "@widgets/create-income";
import { Header } from "@widgets/header";

import { DeleteIncomeButton } from "@features/delete-income";
import { searchTransactionsByTitle } from "@features/search-transactions";
import { getAccountBalance } from "@features/statistics";

import { useAccountsStore } from "@entities/account";
import { useIncomeCategoriesStore } from "@entities/category";
import {
  createCurrencyAmountString,
  formatAmountPrecision,
  useCurrenciesStore,
} from "@entities/currency";
import { useIncomesStore, useTransactions } from "@entities/transaction";

import { toLocalDatetime } from "@shared/lib/date";
import { PageLayout } from "@shared/ui/layouts";

export const IncomeOverviewPage = () => {
  const { id } = useParams();
  if (typeof id === "undefined") {
    throw new Error("Impossible income id");
  }

  const { incomeCategories } = useIncomeCategoriesStore();
  const { accounts, order: accountsOrder } = useAccountsStore();
  const { currencies } = useCurrenciesStore();
  const { getIncome, incomes } = useIncomesStore((state) => ({
    incomes: state.incomes,
    getIncome: state.getIncome,
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

  const income = getIncome(id);

  const methods = useForm<CreateIncomeFormData>({
    defaultValues: income && {
      ...income,
      datetime: toLocalDatetime(income.datetime),
    },
    resolver: zodResolver(createIncomeFormSchema),
  });

  return (
    <PageLayout>
      <FormProvider {...methods}>
        <Header
          title="Income Overview"
          backButton
          rightActions={
            <>
              <DeleteIncomeButton id={id} />
              <UpdateIncomeButton id={id} />
            </>
          }
        />
        <CreateIncomeFormFieldset
          incomes={incomes}
          categories={incomeCategories}
          accounts={{ accounts: accountsWithBalances, order: accountsOrder }}
          searchTransactionsByTitle={searchTransactionsByTitle}
        />
      </FormProvider>
    </PageLayout>
  );
};
