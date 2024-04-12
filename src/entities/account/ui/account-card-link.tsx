import { Link } from "@shared/ui/links";

import { AccountCard, AccountCardProps } from "./account-card";

export const AccountCardLink = (props: AccountCardProps) => {
  return (
    <Link to={`/accounts/${props.account.id}`}>
      <AccountCard {...props} />
    </Link>
  );
};
