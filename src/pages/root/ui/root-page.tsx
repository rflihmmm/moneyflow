import { App as AppPlugin } from "@capacitor/app";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  BackButtonHandler,
  useBackButtonContext,
} from "@shared/lib/back-button-context";

export const RootPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register, unregister } = useBackButtonContext();

  useEffect(() => {
    const rootMenuPaths = [
      "/transactions",
      "/statistics",
      "/balances",
      "/settings",
    ];
    const handler: BackButtonHandler = ({ canGoBack }) => {
      if (location.pathname === "/transactions") {
        if (window.confirm("Close Money Flow?")) {
          AppPlugin.minimizeApp();
        }
        return;
      }

      if (rootMenuPaths.includes(location.pathname)) {
        navigate("/transactions", { replace: true });
        return;
      }

      if (!canGoBack) {
        AppPlugin.minimizeApp();
      } else {
        navigate(-1);
      }
    };
    register(handler, 0);

    return () => unregister(handler);
  }, [location.pathname, navigate, register, unregister]);

  return <Outlet />;
};
