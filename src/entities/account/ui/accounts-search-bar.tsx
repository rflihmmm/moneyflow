import { SearchIcon } from "@shared/ui/icons";
import { Input } from "@shared/ui/inputs";

interface AccountsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const AccountsSearchBar = ({
  value,
  onChange,
}: AccountsSearchBarProps) => {
  return (
    <Input
      inputBoxClassName="gap-2.5 py-2.5"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search"
      leftAddon={<SearchIcon size="xxs" className="" />}
    ></Input>
  );
};
