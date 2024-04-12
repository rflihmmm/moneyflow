import Fuse from "fuse.js";

interface SearchAccount {
  title: string;
  currency: { symbol: string };
}

export const searchAccountsByTitle = <T extends SearchAccount>(
  accounts: T[],
  searchTerm?: string,
): T[] => {
  searchTerm = searchTerm?.trim();
  if (!searchTerm) {
    return accounts;
  }

  const fuse = new Fuse(accounts, {
    keys: [
      { name: "title", weight: 2 },
      { name: "currency.symbol", weight: 1 },
    ],
    ignoreLocation: true,
    threshold: 0.3,
  });
  const result = fuse.search(searchTerm);
  return result.map((i) => i.item);
};
