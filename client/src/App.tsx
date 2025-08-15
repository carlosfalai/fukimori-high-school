import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import Purchase from "@/pages/purchase";
import Login from "@/pages/login";
import { GameStateProvider } from "@/lib/useGameState";
import { AuthProvider } from "@/lib/useAuth";

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/game" component={Game} />
      <Route path="/purchase" component={Purchase} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GameStateProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </GameStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
