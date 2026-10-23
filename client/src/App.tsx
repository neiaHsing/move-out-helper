import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useEffect, useState, type FormEvent } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import RoomView, { BinView } from "@/pages/inventory";
import ItemSearch from "@/pages/item-search";
import AllInventory from "@/pages/all-inventory";
import AllBins from "@/pages/all-bins";
import AllRooms from "@/pages/all-rooms";
import NotFound from "@/pages/not-found";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Box } from "lucide-react";
import PublicBinView from "@/pages/public-bin";

// InsForge refresh tokens expire after 7 days; rotate them daily while the app is open.
const SESSION_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;
const SESSION_REFRESH_RETRY_MS = 60 * 60 * 1000;

function Routes({ onSignOut }: { onSignOut: () => void }) {
  return (
    <Layout onSignOut={onSignOut}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/search" component={ItemSearch} />
        <Route path="/inventory" component={AllInventory} />
        <Route path="/bins" component={AllBins} />
        <Route path="/rooms" component={AllRooms} />
        <Route path="/room/:id" component={RoomView} />
        <Route path="/bin/:id" component={BinView} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function PublicRoutes({ onSignedIn }: { onSignedIn: () => void }) {
  return <Switch>
    <Route path="/bin/:id" component={PublicBinView} />
    <Route component={() => <Login onSignedIn={onSignedIn} />} />
  </Switch>;
}

function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await insforge.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error || !result.data?.user) throw new Error("邮箱或密码不正确");
      setPassword("");
      onSignedIn();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "登录失败，请重试");
    } finally {
      setPending(false);
    }
  }

  return <main className="min-h-screen bg-background flex items-center justify-center p-5 font-mono">
    <form onSubmit={submit} className="w-full max-w-sm border-2 border-border bg-card p-7 shadow-[8px_8px_0_0_hsl(var(--primary))] space-y-5">
      <div className="flex items-center gap-3"><div className="w-11 h-11 bg-primary text-primary-foreground flex items-center justify-center"><Box /></div><div><h1 className="text-2xl font-bold tracking-tight">BOXTRACK</h1><p className="text-xs text-muted-foreground">搬家物品清单</p></div></div>
      <p className="text-sm text-muted-foreground">输入账号和密码，查看或记录箱内物品。</p>
      <div className="space-y-2"><Label htmlFor="email">邮箱</Label><Input id="email" type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required /></div>
      <div className="space-y-2"><Label htmlFor="password">密码</Label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>{pending ? "正在登录…" : "登录"}</Button>
    </form>
  </main>;
}

function AppRoutes() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [location] = useLocation();
  const isBinRoute = /^\/bin\/[^/]+$/.test(location);

  useEffect(() => {
    let active = true;
    insforge.auth.getCurrentUser().then(({ data }) => {
      if (active) setAuthenticated(Boolean(data?.user));
    }).catch(() => { if (active) setAuthenticated(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    let active = true;
    let refreshInProgress = false;
    let nextRefreshAt = Date.now() + SESSION_REFRESH_INTERVAL_MS;
    let timer: ReturnType<typeof setTimeout>;

    function scheduleRefresh(delay: number) {
      clearTimeout(timer);
      timer = setTimeout(() => void refreshSession(), delay);
    }

    async function refreshSession() {
      if (!active || refreshInProgress) return;
      refreshInProgress = true;
      try {
        if (!navigator.onLine) {
          scheduleRefresh(SESSION_REFRESH_RETRY_MS);
          return;
        }

        const { error } = await insforge.auth.refreshSession();
        if (!active) return;

        if (error) {
          scheduleRefresh(SESSION_REFRESH_RETRY_MS);
          return;
        }

        nextRefreshAt = Date.now() + SESSION_REFRESH_INTERVAL_MS;
        scheduleRefresh(SESSION_REFRESH_INTERVAL_MS);
      } catch {
        if (active) scheduleRefresh(SESSION_REFRESH_RETRY_MS);
      } finally {
        refreshInProgress = false;
      }
    }

    function refreshWhenDue() {
      if (Date.now() >= nextRefreshAt) void refreshSession();
    }

    scheduleRefresh(SESSION_REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshWhenDue);
    window.addEventListener("online", refreshWhenDue);

    return () => {
      active = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshWhenDue);
      window.removeEventListener("online", refreshWhenDue);
    };
  }, [authenticated]);

  async function signOut() {
    await insforge.auth.signOut();
    queryClient.clear();
    setAuthenticated(false);
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="boxtrack-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          {authenticated === null && !isBinRoute ? <div className="min-h-screen flex items-center justify-center">正在检查登录状态…</div> : authenticated ? <Routes onSignOut={signOut} /> : <PublicRoutes onSignedIn={() => setAuthenticated(true)} />}
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function App() {
  return <WouterRouter hook={useHashLocation}><AppRoutes /></WouterRouter>;
}

export default App;
