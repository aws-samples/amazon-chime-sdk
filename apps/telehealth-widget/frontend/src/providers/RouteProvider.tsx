import React, { useContext, ReactNode, useState, useEffect } from 'react';

type RouteName = 'CreateAppointment' | 'AppointmentList' | 'AppointmentView';
type Routes = Record<RouteName, ReactNode>;

interface RouteProviderValue {
  setRoute: (routeName: RouteName, params?: Record<string, any>) => void;
  params: Record<string, any>;
}

const RouteProviderContext = React.createContext<RouteProviderValue | undefined>(undefined);

export function useRoute(): RouteProviderValue {
  const value = useContext(RouteProviderContext);
  if (!value) {
    throw new Error('RouteProvider must be used within RouteProvider');
  }
  return value;
}

export default function RouteProvider({ routes }: { routes: Routes }) {
  const [routeInfo, setRouteInfo] = useState<{
    node: ReactNode;
    params?: Record<string, any>;
  }>({
    node: routes.AppointmentList,
  });
  const value = {
    setRoute: (routeName: RouteName, params?: Record<string, any>) => {
      setRouteInfo({
        node: routes[routeName],
        params,
      });
    },
    params: routeInfo.params || {},
  };
  useEffect(() => {
    return () => {
      setRouteInfo({
        node: <></>,
      });
    };
  }, []);
  return <RouteProviderContext.Provider value={value}>{routeInfo.node}</RouteProviderContext.Provider>;
}
