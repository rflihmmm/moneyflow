import { RadioGroup } from "@headlessui/react";
import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

import { ColorPickerColor } from "@shared/ui/color-pickers";
import { Divider } from "@shared/ui/dividers";
import { Drawer } from "@shared/ui/drawer";
import {
  BitcoinIcon,
  CardIcon,
  CashIcon,
  CoinsIcon,
  LandmarkIcon,
  PigIcon,
  SackDollarIcon,
  SortIcon,
} from "@shared/ui/icons";
import { Label } from "@shared/ui/labels";

import { AccountID, AccountIcon } from "../model/models";

import { AccountCard } from "./account-card";
import { AccountCardList } from "./account-card-list";
import { AccountsSearchBar } from "./accounts-search-bar";

interface AccountPickerAccount {
  id: string;
  title: string;
  icon: AccountIcon;
  color: ColorPickerColor;
  currency: {
    symbol: string;
  };
  formattedBalance: string;
}

interface AccountPickerProps {
  accounts: {
    order: AccountID[];
    accounts: Record<AccountID, AccountPickerAccount>;
  };
  searchAccountsByTitle: (
    accounts: AccountPickerAccount[],
    term: string,
  ) => AccountPickerAccount[];
  value?: string | null;
  placeholder?: string;
  onChange?: (id: string) => void;
  label?: string;
  required?: boolean;
}

const iconToComponent: Record<AccountIcon, ReactNode> = {
  cash: <CashIcon size="sm" />,
  card: <CardIcon size="sm" />,
  pig: <PigIcon size="sm" />,
  coins: <CoinsIcon size="sm" />,
  sackDollar: <SackDollarIcon size="sm" />,
  landmark: <LandmarkIcon size="sm" />,
  bitcoin: <BitcoinIcon size="sm" />,
};

const colorToClassName: Record<ColorPickerColor, string> = {
  yellow: "bg-yellow active:bg-yellow-active",
  peach: "bg-peach active:bg-peach-active",
  green: "bg-green active:bg-green-active",
  lavender: "bg-lavender active:bg-lavender-active",
  mauve: "bg-mauve active:bg-mauve-active",
  blue: "bg-blue active:bg-blue-active",
  sapphire: "bg-sapphire active:bg-sapphire-active",
  sky: "bg-sky active:bg-sky-active",
  teal: "bg-teal active:bg-teal-active",
  maroon: "bg-maroon active:bg-maroon-active",
  red: "bg-red active:bg-red-active",
  pink: "bg-pink active:bg-pink-active",
  flamingo: "bg-flamingo active:bg-flamingo-active",
  rosewater: "bg-rosewater active:bg-rosewater-active",
};

export const AccountPicker = ({
  accounts,
  searchAccountsByTitle,
  value,
  placeholder,
  onChange,
  label,
  required,
}: AccountPickerProps) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const filteredAccounts = React.useMemo(
    () =>
      searchAccountsByTitle(
        accounts.order.map((accountId) => accounts.accounts[accountId]),
        searchTerm,
      ),
    [accounts.order, accounts.accounts, searchTerm, searchAccountsByTitle],
  );

  const [isOpen, setIsOpen] = React.useState(false);
  const selectedAccount = value && accounts.accounts[value];

  const closeDrawer = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <div className="flex flex-col gap-2">
          {label && <Label label={label} required={required} />}
          <div
            className={twMerge(
              "flex items-center justify-between gap-2 py-3 px-4 text-sm font-normal rounded",
              "transition-colors",
              selectedAccount
                ? `${
                    colorToClassName[selectedAccount.color]
                  } text-crust font-bold`
                : "bg-surface0 active:bg-surface1 text-overlay0",
            )}
          >
            {selectedAccount ? (
              <div className="flex gap-2.5 items-center">
                {iconToComponent[selectedAccount.icon]}
                <span>
                  {selectedAccount.title} ({selectedAccount.currency.symbol})
                </span>
              </div>
            ) : (
              <span className="text-overlay1">{placeholder}</span>
            )}
            <SortIcon size="sm" />
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        <AccountsSearchBar value={searchTerm} onChange={setSearchTerm} />
        <Divider />
        <RadioGroup as={React.Fragment} onChange={onChange} value={value}>
          <AccountCardList className="w-full">
            {filteredAccounts.map((account) => (
              <RadioGroup.Option
                as="div"
                key={account.id}
                value={account.id}
                onClick={closeDrawer}
              >
                <AccountCard account={account} />
              </RadioGroup.Option>
            ))}
          </AccountCardList>
        </RadioGroup>
      </div>
    </Drawer>
  );
};
