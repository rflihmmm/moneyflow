import { CreateExpenseForm } from "@widgets/create-expense";
import { Header } from "@widgets/header";

import { searchTransactionsByTitle } from "@features/search-transactions";

import { PageLayout } from "@shared/ui/layouts";

export const CreateExpensePage = () => {
  return (
    <PageLayout className="h-full">
      <Header title="Add Expense" backButton />
      <CreateExpenseForm
        className="flex-1"
        searchTransactionsByTitle={searchTransactionsByTitle}
      />
    </PageLayout>
  );
};
