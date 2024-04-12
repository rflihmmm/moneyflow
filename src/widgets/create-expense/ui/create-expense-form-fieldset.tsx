import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { searchAccountsByTitle } from "@features/search-accounts";

import { AccountID, AccountIcon, AccountPicker } from "@entities/account";
import {
  CategorySelect,
  ExpenseCategoryID,
  ExpenseCategories,
} from "@entities/category";
import {
  CurrencySymbolPosition,
  createCurrencyAmountString,
} from "@entities/currency";
import {
  ExpenseID,
  Expenses,
  TransactionTitleAutocomplete,
  TransactionTitleAutocompleteProps,
  createExpenseAmountString,
  sortTransactionsByDateTime,
} from "@entities/transaction";

import { positiveDecimalRegex } from "@shared/lib/regex";
import { ColorPickerColor } from "@shared/ui/color-pickers";
import { CalendarIcon } from "@shared/ui/icons";
import { Input } from "@shared/ui/inputs";

interface CreateExpenseFormAccount {
  id: AccountID;
  title: string;
  color: ColorPickerColor;
  icon: AccountIcon;
  currency: {
    symbol: string;
    symbolPosition: CurrencySymbolPosition;
    hasSpaceBetweenAmountAndSymbol: boolean;
  };
  formattedBalance: string;
}

export interface CreateExpenseFormData {
  title: string;
  categoryId: ExpenseCategoryID | null;
  accountId: AccountID | null;
  amount: string;
  datetime: string;
}

export interface CreateExpenseFormFieldsetProps
  extends Pick<TransactionTitleAutocompleteProps, "searchTransactionsByTitle"> {
  expenses: Expenses;
  categories: ExpenseCategories;
  accounts: {
    order: AccountID[];
    accounts: Record<AccountID, CreateExpenseFormAccount>;
  };
}

export const createExpenseFormSchema = z.object({
  title: z.string(),
  categoryId: z.string(),
  accountId: z.string(),
  amount: z.string().regex(positiveDecimalRegex),
  datetime: z.string().nonempty(),
});

export const CreateExpenseFormFieldset = ({
  expenses,
  categories,
  accounts,
  searchTransactionsByTitle,
}: CreateExpenseFormFieldsetProps) => {
  const { control, register, watch, reset } =
    useFormContext<CreateExpenseFormData>();

  const [accountId, title] = watch(["accountId", "title"]);
  const account = accountId === null ? null : accounts.accounts[accountId];
  const sortedExpenses = sortTransactionsByDateTime(Object.values(expenses));
  const formattedExpenses = sortedExpenses.map((expense) => ({
    ...expense,
    formattedAmount: createExpenseAmountString(
      createCurrencyAmountString({
        currency: accounts.accounts[expense.accountId].currency,
        amount: expense.amount,
      }),
    ),
  }));

  const onSelectAutocompleteExpenseId = (value: ExpenseID) => {
    const expense = expenses[value];
    reset({
      title: expense.title,
      categoryId: expense.categoryId,
      accountId: expense.accountId,
      amount: expense.amount,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <TransactionTitleAutocomplete
        transactions={formattedExpenses}
        title={title}
        amountColor="red"
        inputProps={{
          label: "Title",
          placeholder: "e.g. Bananas, Bread, ...",
          value: title,
          ...register("title"),
        }}
        searchTransactionsByTitle={searchTransactionsByTitle}
        onSelect={onSelectAutocompleteExpenseId}
      />
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { value, onChange } }) => (
          <CategorySelect
            categories={categories}
            label="Category"
            required
            value={value}
            onChange={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="accountId"
        render={({ field: { value, onChange } }) => (
          <AccountPicker
            accounts={accounts}
            label="Account"
            required
            value={value}
            onChange={onChange}
            placeholder="Tap to select"
            searchAccountsByTitle={searchAccountsByTitle}
          />
        )}
      />
      <Input
        label="Amount"
        placeholder="15.8"
        required
        type="number"
        leftAddon={account?.currency.symbol}
        {...register("amount")}
      />
      <Input
        label="Date & Time"
        required
        type="datetime-local"
        leftAddon={<CalendarIcon size="sm" />}
        inputBoxClassName="gap-3"
        {...register("datetime")}
      />
    </div>
  );
};
