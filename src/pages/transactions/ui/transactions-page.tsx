import { useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { CreateTransactionButton } from "@widgets/create-transaction-button";
import { Header } from "@widgets/header";
import { GroupedTransactionList } from "@widgets/transaction-list";

import { TransactionFiltersButton } from "@features/filter-transactions";
import { TransactionsSearchBar } from "@features/search-transactions";

import { useDebounce } from "@shared/lib/hooks";
import { CalendarIcon, ListIcon } from "@shared/ui/icons";
import { PageLayout } from "@shared/ui/layouts";

import { useTransactionFiltersStore } from "../model/store";

import { TransactionsCalendar } from "./transactions-calendar";

type TransactionsViewMode = "list" | "calendar";

const isTransactionsViewMode = (
  value: string | null,
): value is TransactionsViewMode => value === "list" || value === "calendar";

export const TransactionsPage = () => {
  const pageLayoutRef = useRef<HTMLDivElement | null>(null);
  const { filters, searchTerm, setSearchTerm, setTransactionFilters } =
    useTransactionFiltersStore();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [params, setParams] = useSearchParams({
    filtersModalIsOpen: "false",
    view: "list",
  });
  const filtersModalIsOpenParam = params.get("filtersModalIsOpen") ?? "false";
  const filtersModalIsOpen = filtersModalIsOpenParam === "true";
  const viewModeParam = params.get("view");
  const viewMode = isTransactionsViewMode(viewModeParam)
    ? viewModeParam
    : "list";

  const setViewMode = (value: TransactionsViewMode) => {
    setParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set("view", value);
      return nextParams;
    });
  };

  return (
    <PageLayout ref={pageLayoutRef}>
      <Header
        title="Transactions"
        rightActions={
          <>
            <button
              type="button"
              aria-label="Show transactions as list"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              <ListIcon
                size="sm"
                className={
                  viewMode === "list"
                    ? "text-lavender transition-colors"
                    : "text-overlay1 active:text-overlay2 transition-colors"
                }
              />
            </button>
            <button
              type="button"
              aria-label="Show transactions as calendar"
              aria-pressed={viewMode === "calendar"}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarIcon
                size="sm"
                className={
                  viewMode === "calendar"
                    ? "text-lavender transition-colors"
                    : "text-overlay1 active:text-overlay2 transition-colors"
                }
              />
            </button>
          </>
        }
      />
      <main className="flex flex-col gap-4 pb-8">
        {viewMode === "list" ? (
          <>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <TransactionsSearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>
              <TransactionFiltersButton
                isOpen={filtersModalIsOpen}
                onIsOpenChange={(value) =>
                  setParams((currentParams) => {
                    const nextParams = new URLSearchParams(currentParams);
                    nextParams.set("filtersModalIsOpen", value.toString());
                    return nextParams;
                  })
                }
                onChange={setTransactionFilters}
                defaultValue={filters}
              />
            </div>
            <GroupedTransactionList
              showEmptyState
              filters={filters}
              searchTerm={debouncedSearchTerm}
            />
            <CreateTransactionButton />
          </>
        ) : (
          <TransactionsCalendar />
        )}
      </main>
    </PageLayout>
  );
};
