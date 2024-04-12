import { zodResolver } from "@hookform/resolvers/zod";
import { DateTime } from "luxon";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { getAccountBalance } from "@features/statistics";

import { useAccountsStore } from "@entities/account";
import { useIncomeCategoriesStore } from "@entities/category";
import {
  createCurrencyAmountString,
  formatAmountPrecision,
  useCurrenciesStore,
} from "@entities/currency";
import { useIncomesStore, useTransactions } from "@entities/transaction";

import { getNowLocalDatetime } from "@shared/lib/date";
import { Button } from "@shared/ui/buttons";

import { useCreateIncomeFormStore } from "../model/store";

import {
  CreateIncomeFormData,
  CreateIncomeFormFieldset,
  CreateIncomeFormFieldsetProps,
  createIncomeFormSchema,
} from "./create-income-form-fieldset";

interface CreateIncomeFormProps
  extends Pick<CreateIncomeFormFieldsetProps, "searchTransactionsByTitle"> {
  className?: string;
}

export const CreateIncomeForm = ({
  className,
  searchTransactionsByTitle,
}: CreateIncomeFormProps) => {
  const navigate = useNavigate();
  const {
    currencies: { currencies },
  } = useCurrenciesStore();
  const { createIncome, incomes } = useIncomesStore((state) => ({
    incomes: state.incomes,
    createIncome: state.createIncome,
  }));
  const transactions = useTransactions();
  const { incomeCategories } = useIncomeCategoriesStore();
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
    getCreateIncomeFormState,
    setCreateIncomeFormState,
    setAccountId,
    setCategoryId,
    resetCreateIncomeFormState,
  } = useCreateIncomeFormStore();

  const defaultValues = getCreateIncomeFormState();
  const methods = useForm<CreateIncomeFormData>({
    defaultValues: {
      ...defaultValues,
      datetime: defaultValues.datetime
        ? defaultValues.datetime
        : getNowLocalDatetime(),
    },
    resolver: zodResolver(createIncomeFormSchema),
  });
  const { handleSubmit, formState, watch } = methods;

  const { title, categoryId, accountId, amount, datetime } = watch();

  useEffect(() => {
    const category =
      categoryId === null ? categoryId : incomeCategories[categoryId] ?? null;
    if (category === null) {
      setCategoryId(null);
    }
  }, [categoryId, incomeCategories, setCategoryId]);

  useEffect(() => {
    const account =
      accountId === null ? accountId : accounts[accountId] ?? null;
    if (account === null) {
      setAccountId(null);
    }
  }, [accountId, accounts, setAccountId]);

  useEffect(() => {
    setCreateIncomeFormState({
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
    setCreateIncomeFormState,
  ]);

  const onCreateIncome = async (income: CreateIncomeFormData) => {
    if (income.accountId === null) {
      throw new Error("Impossible accountId on income creation");
    }
    if (income.categoryId === null) {
      throw new Error("Impossible categoryId on income creation");
    }

    await createIncome({
      ...income,
      accountId: income.accountId,
      categoryId: income.categoryId,
      datetime: DateTime.fromISO(income.datetime),
    });
    resetCreateIncomeFormState();
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
        <CreateIncomeFormFieldset
          incomes={incomes}
          categories={incomeCategories}
          accounts={{ order: accountsOrder, accounts: accountsWithBalances }}
          searchTransactionsByTitle={searchTransactionsByTitle}
        />
        <Button
          onClick={handleSubmit(onCreateIncome)}
          className="w-[75%] self-center"
          disabled={!formState.isValid}
        >
          Confirm
        </Button>
      </form>
    </FormProvider>
  );
};
