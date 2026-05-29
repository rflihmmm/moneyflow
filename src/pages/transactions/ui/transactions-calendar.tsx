import { DayButtonProps, DayPicker } from "@daypicker/react";
import { Decimal } from "decimal.js";
import { DateTime } from "luxon";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { CreateTransactionButton } from "@widgets/create-transaction-button";
import { TransactionListGroup } from "@widgets/transaction-list";

import { useAccountsStore } from "@entities/account";
import {
  CurrenciesMap,
  createCurrencyAmountString,
  formatAmountPrecision,
  useCurrenciesStore,
} from "@entities/currency";
import { TransactionType, useTransactions } from "@entities/transaction";

import { toLocalDatetime } from "@shared/lib/date";
import { ModalBottomSlide } from "@shared/ui/modals";

interface CalendarDaySummary {
  transactions: ReturnType<typeof useTransactions>;
  expenses: Record<string, Decimal>;
  incomes: Record<string, Decimal>;
}

const createDateKey = (datetime: DateTime) => datetime.toFormat("yyyy-LL-dd");

const createCurrencySummaryString = (
  amounts: Record<string, Decimal>,
  currencies: CurrenciesMap,
) =>
  Object.entries(amounts)
    .map(([currencyId, amount]) => {
      const currency = currencies[currencyId];
      return createCurrencyAmountString({
        currency,
        amount: formatAmountPrecision(amount.toString(), currency.precision),
      });
    })
    .join(", ");

export const TransactionsCalendar = () => {
  const [params, setParams] = useSearchParams();
  const selectedDateParam = params.get("selectedDate");
  const parsedSelectedDate = selectedDateParam
    ? DateTime.fromISO(selectedDateParam)
    : null;
  const selectedDate = parsedSelectedDate?.isValid ? parsedSelectedDate : null;
  const transactions = useTransactions();
  const { accounts } = useAccountsStore();
  const {
    currencies: { currencies },
  } = useCurrenciesStore();

  const daySummaries = useMemo(() => {
    return transactions.reduce<Record<string, CalendarDaySummary>>(
      (summaries, transaction) => {
        const dateKey = createDateKey(transaction.datetime);
        const summary = summaries[dateKey] ?? {
          transactions: [],
          expenses: {},
          incomes: {},
        };

        summary.transactions.push(transaction);

        if (transaction.type === TransactionType.expense) {
          const currencyId = accounts[transaction.accountId].currencyId;
          summary.expenses[currencyId] = (
            summary.expenses[currencyId] ?? new Decimal("0")
          ).plus(transaction.amount);
        }

        if (transaction.type === TransactionType.income) {
          const currencyId = accounts[transaction.accountId].currencyId;
          summary.incomes[currencyId] = (
            summary.incomes[currencyId] ?? new Decimal("0")
          ).plus(transaction.amount);
        }

        summaries[dateKey] = summary;
        return summaries;
      },
      {},
    );
  }, [accounts, transactions]);

  const selectedDateKey = selectedDate ? createDateKey(selectedDate) : null;
  const selectedDaySummary = selectedDateKey
    ? daySummaries[selectedDateKey]
    : undefined;
  const selectedDateTransactions = selectedDaySummary?.transactions ?? [];
  const selectedDateDefaultDatetime = selectedDate
    ? toLocalDatetime(
        selectedDate.set({
          hour: DateTime.now().hour,
          minute: DateTime.now().minute,
        }),
      )
    : undefined;

  const selectDate = (date: Date) => {
    setParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set("selectedDate", createDateKey(DateTime.fromJSDate(date)));
      return nextParams;
    });
  };

  const closeSelectedDateDrawer = () => {
    setParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.delete("selectedDate");
      return nextParams;
    });
  };

  const SummaryDayButton = ({
    day,
    modifiers,
    className,
    children,
    ...props
  }: DayButtonProps) => {
    const dateKey = createDateKey(DateTime.fromJSDate(day.date));
    const summary = daySummaries[dateKey];
    const expenseSummary = summary
      ? createCurrencySummaryString(summary.expenses, currencies)
      : "";
    const incomeSummary = summary
      ? createCurrencySummaryString(summary.incomes, currencies)
      : "";

    return (
      <button
        {...props}
        className={twMerge(
          className,
          "flex h-16 w-full flex-col items-start justify-start gap-1 rounded p-1.5 text-left transition-colors active:bg-surface0",
          modifiers.today && "outline outline-1 -outline-offset-1 outline-blue",
          modifiers.outside && "opacity-40",
          modifiers.selected && "bg-surface0",
        )}
      >
        <span className="text-xs font-bold text-text">{children}</span>
        <span className="flex w-full min-w-0 flex-col gap-0.5 text-[0.5rem] font-bold leading-none">
          {incomeSummary && (
            <span className="truncate text-green">+{incomeSummary}</span>
          )}
          {expenseSummary && (
            <span className="truncate text-red">-{expenseSummary}</span>
          )}
        </span>
      </button>
    );
  };

  return (
    <>
      <DayPicker
        mode="single"
        showOutsideDays
        selected={selectedDate?.toJSDate()}
        onDayClick={selectDate}
        components={{ DayButton: SummaryDayButton }}
        classNames={{
          root: "relative w-full text-text",
          months: "w-full",
          month: "w-full",
          month_caption: "flex items-center justify-center pb-4",
          caption_label: "text-base-size font-bold",
          nav: "absolute left-0 top-0 z-10 flex w-full justify-between",
          button_previous:
            "flex h-8 w-8 items-center justify-center rounded text-overlay1 active:bg-surface0 active:text-overlay2",
          button_next:
            "flex h-8 w-8 items-center justify-center rounded text-overlay1 active:bg-surface0 active:text-overlay2",
          chevron: "h-4 w-4 fill-current",
          month_grid: "w-full table-fixed border-separate border-spacing-1",
          weekdays: "text-subtext0",
          weekday: "pb-2 text-center text-xs font-bold",
          week: "",
          day: "align-top",
          day_button: "w-full",
          today: "",
          outside: "",
          selected: "",
        }}
      />
      <ModalBottomSlide
        title={selectedDate?.toFormat("d LLL yyyy") ?? "Transactions"}
        isOpen={selectedDate !== null}
        onClose={closeSelectedDateDrawer}
        className="z-50"
      >
        <div className="pb-32">
          {selectedDate && selectedDateTransactions.length ? (
            <TransactionListGroup
              className="pt-4"
              transactionGroup={{
                datetime: selectedDate,
                transactions: selectedDateTransactions,
              }}
            />
          ) : (
            <p className="pt-4 text-center text-base/[1.75] font-medium text-subtext0">
              No transactions on this date
            </p>
          )}
        </div>
        <CreateTransactionButton
          defaultDatetime={selectedDateDefaultDatetime}
        />
      </ModalBottomSlide>
    </>
  );
};
