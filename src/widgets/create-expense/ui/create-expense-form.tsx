import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime } from "luxon";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { getAccountBalance } from "@features/statistics";

import { useAccountsStore } from "@entities/account";
import { useExpenseCategoriesStore } from "@entities/category";
import {
  createCurrencyAmountString,
  formatAmountPrecision,
  useCurrenciesStore,
} from "@entities/currency";
import { useExpensesStore, useTransactions } from "@entities/transaction";

import { getNowLocalDatetime } from "@shared/lib/date";
import { Button } from "@shared/ui/buttons";

import { useCreateExpenseFormStore } from "../model/store";

import {
  CreateExpenseFormData,
  CreateExpenseFormFieldset,
  CreateExpenseFormFieldsetProps,
  createExpenseFormSchema,
} from "./create-expense-form-fieldset";

interface CreateExpenseFormProps
  extends Pick<CreateExpenseFormFieldsetProps, "searchTransactionsByTitle"> {
  className?: string;
}

export const CreateExpenseForm = ({
  className,
  searchTransactionsByTitle,
}: CreateExpenseFormProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    currencies: { currencies },
  } = useCurrenciesStore();
  const { createExpense, expenses } = useExpensesStore((state) => ({
    expenses: state.expenses,
    createExpense: state.createExpense,
  }));
  const transactions = useTransactions();
  const { expenseCategories } = useExpenseCategoriesStore();
  const { order: accountsOrder, accounts } = useAccountsStore();
  const accountsWithBalances = React.useMemo(
    () =>
      Object.fromEntries(
        Object.entries(accounts).map(([accountId, account]) => {
          const currency = currencies[account.currencyId];
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
  const {
    getCreateExpenseFormState,
    setCreateExpenseFormState,
    setAccountId,
    setCategoryId,
    resetCreateExpenseFormState,
  } = useCreateExpenseFormStore();

  const defaultValues = getCreateExpenseFormState();
  const defaultDatetimeSearchParam = searchParams.get("datetime");
  const defaultDatetimeFromSearch =
    defaultDatetimeSearchParam &&
    DateTime.fromISO(defaultDatetimeSearchParam).isValid
      ? defaultDatetimeSearchParam
      : undefined;
  const methods = useForm<CreateExpenseFormData>({
    defaultValues: {
      ...defaultValues,
      datetime:
        defaultDatetimeFromSearch ??
        (defaultValues.datetime
          ? defaultValues.datetime
          : getNowLocalDatetime()),
    },
    resolver: zodResolver(createExpenseFormSchema),
  });
  const { handleSubmit, formState, watch } = methods;

  const { title, categoryId, accountId, amount, datetime } = watch();

  useEffect(() => {
    const category =
      categoryId === null ? categoryId : expenseCategories[categoryId] ?? null;
    if (category === null) {
      setCategoryId(null);
    }
  }, [categoryId, expenseCategories, setCategoryId]);

  useEffect(() => {
    const account =
      accountId === null ? accountId : accounts[accountId] ?? null;
    if (account === null) {
      setAccountId(null);
    }
  }, [accountId, accounts, setAccountId]);

  useEffect(() => {
    setCreateExpenseFormState({
      title,
      categoryId,
      accountId,
      amount,
      datetime,
    });
  }, [
    title,
    categoryId,
    accountId,
    amount,
    datetime,
    setCreateExpenseFormState,
  ]);

  const onCreateExpense = async (expense: CreateExpenseFormData) => {
    if (expense.accountId === null) {
      throw new Error("Impossible accountId on expense creation");
    }
    if (expense.categoryId === null) {
      throw new Error("Impossible categoryId on expense creation");
    }

    await createExpense({
      ...expense,
      accountId: expense.accountId,
      categoryId: expense.categoryId,
      datetime: DateTime.fromISO(expense.datetime),
    });
    resetCreateExpenseFormState();
    navigate(-1);
  };

  return (
    <FormProvider {...methods}>
      <form
        className={twMerge(
          "flex flex-col justify-between gap-8 pb-7",
          className,
        )}
      >
        <CreateExpenseFormFieldset
          expenses={expenses}
          categories={expenseCategories}
          accounts={{ order: accountsOrder, accounts: accountsWithBalances }}
          searchTransactionsByTitle={searchTransactionsByTitle}
        />
        <Button
          onClick={handleSubmit(onCreateExpense)}
          className="w-[75%] self-center"
          disabled={!formState.isValid}
        >
          Confirm
        </Button>
      </form>
    </FormProvider>
  );
};
