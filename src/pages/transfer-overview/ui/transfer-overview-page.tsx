import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import {
  CreateTransferFormFieldset,
  createTransferFormSchema,
  CreateTransferFormData,
  UpdateTransferButton,
} from "@widgets/create-transfer";
import { Header } from "@widgets/header";

import { DeleteTransferButton } from "@features/delete-transfer";
import { searchTransactionsByTitle } from "@features/search-transactions";
import { getAccountBalance } from "@features/statistics";

import { useAccountsStore } from "@entities/account";
import {
  createCurrencyAmountString,
  formatAmountPrecision,
  useCurrenciesStore,
} from "@entities/currency";
import { useTransactions, useTransfersStore } from "@entities/transaction";

import { toLocalDatetime } from "@shared/lib/date";
import { PageLayout } from "@shared/ui/layouts";

export const TransferOverviewPage = () => {
  const { id } = useParams();
  if (typeof id === "undefined") {
    throw new Error("Impossible transfer id");
  }

  const { currencies } = useCurrenciesStore();
  const { getTransfer, transfers } = useTransfersStore((state) => ({
    transfers: state.transfers,
    getTransfer: state.getTransfer,
  }));
  const transactions = useTransactions();
  const { accounts, order: accountsOrder } = useAccountsStore();
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

  const transfer = getTransfer(id);

  const methods = useForm<CreateTransferFormData>({
    defaultValues: transfer && {
      title: transfer.title,
      fromAccountId: transfer.fromAccount.accountId,
      fromAccountAmount: transfer.fromAccount.amount,
      toAccountId: transfer.toAccount.accountId,
      toAccountAmount: transfer.toAccount.amount,
      datetime: toLocalDatetime(transfer.datetime),
    },
    resolver: zodResolver(createTransferFormSchema),
  });

  return (
    <PageLayout>
      <FormProvider {...methods}>
        <Header
          title="Transfer Overview"
          backButton
          rightActions={
            <>
              <DeleteTransferButton id={id} />
              <UpdateTransferButton id={id} />
            </>
          }
        />
        <CreateTransferFormFieldset
          transfers={transfers}
          accounts={{ accounts: accountsWithBalances, order: accountsOrder }}
          currencies={currencies.currencies}
          searchTransactionsByTitle={searchTransactionsByTitle}
        />
      </FormProvider>
    </PageLayout>
  );
};
