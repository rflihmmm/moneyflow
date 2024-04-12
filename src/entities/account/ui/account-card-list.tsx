import React from "react";
import { twMerge } from "tailwind-merge";

interface AccountCardListProps {
  children?: React.ReactNode;
  className?: string;
}

export const AccountCardList = ({
  children,
  className,
}: AccountCardListProps) => {
  return (
    <div className={twMerge("flex flex-col gap-2.5", className)}>
      {children}
    </div>
  );
};
