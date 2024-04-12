import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { searchAccountsByTitle } from "@features/search-accounts";

import { AccountID, AccountIcon, AccountPicker } from "@entities/account";
import {
  CurrenciesMap,
  CurrencySymbolPosition,
  createCurrencyAmountString,
} from "@entities/currency";
import {
  TransactionTitleAutocomplete,
  TransactionTitleAutocompleteProps,
  TransferID,
  Transfers,
  createTransferAmountString,
  sortTransactionsByDateTime,
} from "@entities/transaction";

import { positiveDecimalRegex } from "@shared/lib/regex";
import { ColorPickerColor } from "@shared/ui/color-pickers";
import { CalendarIcon } from "@shared/ui/icons";
import { Input } from "@shared/ui/inputs";

interface CreateTransferFormAccount {
  id: AccountID;
  title: string;
  color: ColorPickerColor;
  icon: AccountIcon;
  currency: {
    id: string;
    symbol: string;
    symbolPosition: CurrencySymbolPosition;
    hasSpaceBetweenAmountAndSymbol: boolean;
  };
  formattedBalance: string;
}

export interface CreateTransferFormData {
  title: string;
  fromAccountId: AccountID | null;
  fromAccountAmount: string;
  toAccountId: AccountID | null;
  toAccountAmount: string;
  datetime: string;
}

export interface CreateTransferFormFieldsetProps
  extends Pick<TransactionTitleAutocompleteProps, "searchTransactionsByTitle"> {
  transfers: Transfers;
  accounts: {
    order: AccountID[];
    accounts: Record<AccountID, CreateTransferFormAccount>;
  };
  currencies: CurrenciesMap;
}

export const createTransferFormSchema = z.object({
  title: z.string(),
  fromAccountId: z.string(),
  fromAccountAmount: z.string().regex(positiveDecimalRegex),
  toAccountId: z.string(),
  toAccountAmount: z.string().regex(positiveDecimalRegex),
  datetime: z.string().nonempty(),
});

export const CreateTransferFormFieldset = ({
  transfers,
  accounts,
  searchTransactionsByTitle,
}: CreateTransferFormFieldsetProps) => {
  const { control, register, watch, reset } =
    useFormContext<CreateTransferFormData>();

  const [fromAccountId, toAccountId, title] = watch([
    "fromAccountId",
    "toAccountId",
    "title",
  ]);
  const fromAccount =
    fromAccountId === null ? null : accounts.accounts[fromAccountId];
  const toAccount =
    toAccountId === null ? null : accounts.accounts[toAccountId];
  const sortedTransfers = sortTransactionsByDateTime(Object.values(transfers));
  const formattedTransfers = sortedTransfers.map((transfer) => {
    const fromAccount = accounts.accounts[transfer.fromAccount.accountId];
    const toAccount = accounts.accounts[transfer.toAccount.accountId];
    return {
      ...transfer,
      formattedAmount: createTransferAmountString({
        fromAmount: createCurrencyAmountString({
          currency: fromAccount.currency,
          amount: transfer.fromAccount.amount,
        }),
        toAmount: createCurrencyAmountString({
          currency: toAccount.currency,
          amount: transfer.toAccount.amount,
        }),
        sameCurrencies: fromAccount.currency.id === toAccount.currency.id,
      }),
    };
  });

  const onSelectAutocompleteTransferId = (value: TransferID) => {
    const transfer = transfers[value];
    reset({
      title: transfer.title,
      fromAccountId: transfer.fromAccount.accountId,
      fromAccountAmount: transfer.fromAccount.amount,
      toAccountId: transfer.toAccount.accountId,
      toAccountAmount: transfer.toAccount.amount,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <TransactionTitleAutocomplete
        transactions={formattedTransfers}
        title={title}
        amountColor="blue"
        inputProps={{
          label: "Title",
          placeholder: "e.g. Withdraw cash, ...",
          value: title,
          ...register("title"),
        }}
        searchTransactionsByTitle={searchTransactionsByTitle}
        onSelect={onSelectAutocompleteTransferId}
      />
      <div className="flex flex-col gap-3">
        <h2 className="text-h2 text-text ms-4">From</h2>
        <Controller
          control={control}
          name="fromAccountId"
          render={({ field: { value, onChange } }) => (
            <AccountPicker
              accounts={accounts}
              required
              value={value}
              onChange={onChange}
              placeholder="Tap to select"
              searchAccountsByTitle={searchAccountsByTitle}
            />
          )}
        />
      </div>
      <Input
        label="Amount"
        placeholder="15.8"
        required
        type="number"
        leftAddon={fromAccount?.currency.symbol}
        {...register("fromAccountAmount")}
      />
      <div className="flex flex-col gap-3">
        <h2 className="text-h2 text-text ms-4">To</h2>
        <Controller
          control={control}
          name="toAccountId"
          render={({ field: { value, onChange } }) => (
            <AccountPicker
              accounts={accounts}
              required
              value={value}
              onChange={onChange}
              placeholder="Tap to select"
              searchAccountsByTitle={searchAccountsByTitle}
            />
          )}
        />
      </div>
      <Input
        label="Amount"
        placeholder="15.8"
        required
        type="number"
        leftAddon={toAccount?.currency.symbol}
        {...register("toAccountAmount")}
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
