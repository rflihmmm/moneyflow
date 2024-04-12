import { assert, describe, it } from "vitest";

import { searchAccountsByTitle } from "./search";

describe("search accounts", () => {
  it("empty list", () => {
    const actual = searchAccountsByTitle([], "term");
    assert.deepEqual(actual, []);
  });

  it("should return empty array if there are no matches", () => {
    const accounts = [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Card",
        currency: {
          symbol: "USD",
        },
      },
    ];
    const actual = searchAccountsByTitle(accounts, "term");
    assert.deepEqual(actual, []);
  });

  it("should return 1 match by title", () => {
    const accounts = [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Card",
        currency: {
          symbol: "USD",
        },
      },
    ];
    const actual = searchAccountsByTitle(accounts, "Cash");
    assert.deepEqual(actual, [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
    ]);
  });

  it("should return multiple matches by title", () => {
    const accounts = [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Cash 2",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Card",
        currency: {
          symbol: "USD",
        },
      },
    ];
    const actual = searchAccountsByTitle(accounts, "cash");
    assert.deepEqual(actual, [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Cash 2",
        currency: {
          symbol: "USD",
        },
      },
    ]);
  });

  it("should return 1 match by currency symbol", () => {
    const accounts = [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Card",
        currency: {
          symbol: "UAH",
        },
      },
    ];
    const actual = searchAccountsByTitle(accounts, "usd");
    assert.deepEqual(actual, [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
    ]);
  });

  it("should return multiple matches by currency symbol", () => {
    const accounts = [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Cash 2",
        currency: {
          symbol: "UAH",
        },
      },
      {
        title: "Card",
        currency: {
          symbol: "USD",
        },
      },
    ];
    const actual = searchAccountsByTitle(accounts, "usd");
    assert.deepEqual(actual, [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Card",
        currency: {
          symbol: "USD",
        },
      },
    ]);
  });

  it("should match by title and currency symbol together", () => {
    const accounts = [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Cash 2",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Card",
        currency: {
          symbol: "UAH",
        },
      },
      {
        title: "USD",
        currency: {
          symbol: "BTC",
        },
      },
    ];
    const actual = searchAccountsByTitle(accounts, "usd");
    assert.deepEqual(actual, [
      {
        title: "USD",
        currency: {
          symbol: "BTC",
        },
      },
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Cash 2",
        currency: {
          symbol: "USD",
        },
      },
    ]);
  });

  it("should return the input array if search term is empty", () => {
    const accounts = [
      {
        title: "Cash",
        currency: {
          symbol: "USD",
        },
      },
      {
        title: "Card",
        currency: {
          symbol: "USD",
        },
      },
    ];
    const actual = searchAccountsByTitle(accounts, "");
    assert.deepEqual(actual, accounts);
  });
});
