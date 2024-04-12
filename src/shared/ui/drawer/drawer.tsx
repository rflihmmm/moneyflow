import React from "react";
import { Drawer as Vaul } from "vaul";

interface DrawerProps {
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export const Drawer = ({
  trigger,
  children,
  ...props
}: DrawerProps & Parameters<typeof Vaul.Root>[0]) => {
  return (
    <>
      <Vaul.Root {...props}>
        <Vaul.Trigger>{trigger}</Vaul.Trigger>
        <Vaul.Portal>
          <Vaul.Overlay className="fixed inset-0 bg-mantle/80" />
          <Vaul.Content className="bg-base1-color flex flex-col rounded-t-[1.25rem] mt-24 fixed bottom-0 left-0 right-0 min-h-[45%] max-h-[70%]">
            <div className="pt-3 px-5 pb-5 bg-base1-color rounded-t-[1.25rem] flex-1 flex flex-col gap-5 items-center overflow-auto">
              <div className="w-12 h-2 flex-shrink-0 rounded-full bg-surface0" />
              {children}
            </div>
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    </>
  );
};
