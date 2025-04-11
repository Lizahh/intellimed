import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SOAPNotes from "@/pages/SOAPNotes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/soap-notes" component={SOAPNotes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
