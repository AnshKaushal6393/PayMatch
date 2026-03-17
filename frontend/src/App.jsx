import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const TOKEN_KEY = "paymatch_access_token";

const kpis = [
  { label: "Invoices Processed", value: "1,284" },
  { label: "Auto-Match Rate", value: "82.4%" },
  { label: "Open Exceptions", value: "47" },
  { label: "Avg Reconcile Time", value: "11m 20s" }
];

const exceptions = [];

function LogoMark() {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/35 bg-white/10">
        <span className="absolute left-1 top-1 h-3.5 w-3.5 rounded-sm bg-[#d8b04c]" />
        <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-sm bg-[#14b8a6]" />
      </div>
      <span className="text-2xl font-semibold tracking-tight">PayMatch</span>
    </div>
  );
}

function AuthShell({ title, subtitle, children }) {
  const trustItems = [
    { label: "SOC2-ready logging", icon: "S" },
    { label: "Role-based access", icon: "R" },
    { label: "Multi-tenant isolation", icon: "M" }
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="brand-hero relative overflow-hidden p-5 text-white lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="brand-grid absolute inset-0" />
        <div className="relative z-10 motion-stagger-1">
          <LogoMark />
        </div>
        <div className="relative z-10 mt-4 max-w-lg lg:mt-0 motion-stagger-2">
          <h2 className="text-2xl font-semibold leading-tight lg:text-[2.6rem] lg:leading-tight">
            Reconcile vendor payouts across ERP and bank statements in minutes.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-teal-100/90 lg:mt-3 lg:text-lg">
            Built for AP teams that need faster closes and fewer reconciliation errors.
          </p>
        </div>
        <p className="relative z-10 mt-3 text-xs text-teal-100/85 lg:mt-0 lg:text-sm motion-stagger-3">
          Multi-tenant controls, exception workflows, and audit-ready logs in one workspace.
        </p>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-6">
        <div className="motion-fade-up w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700"
              >
                <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-emerald-100 font-semibold text-[10px] text-emerald-800">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(Boolean(token));

  const authApi = useMemo(
    () => ({
      async login(payload) {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || "Login failed");
        }
        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        setToken(data.accessToken);
        setSession({ user: data.user, tenant: data.tenant });
      },
      async signup(payload) {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || "Signup failed");
        }
        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        setToken(data.accessToken);
        setSession({ user: data.user, tenant: data.tenant });
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setSession(null);
      }
    }),
    []
  );

  useEffect(() => {
    let active = true;
    async function loadSession() {
      if (!token) {
        setLoadingSession(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Session expired");
        }
        const data = await response.json();
        if (active) {
          setSession(data);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (active) {
          setToken(null);
          setSession(null);
        }
      } finally {
        if (active) {
          setLoadingSession(false);
        }
      }
    }
    loadSession();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute isAuthed={Boolean(token)} loading={loadingSession}>
              <LoginPage authApi={authApi} />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute isAuthed={Boolean(token)} loading={loadingSession}>
              <SignupPage authApi={authApi} />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthed={Boolean(token)} loading={loadingSession}>
              <DashboardPage session={session} onLogout={authApi.logout} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ isAuthed, loading, children }) {
  if (loading) {
    return <FullPageLoader />;
  }
  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function GuestRoute({ isAuthed, loading, children }) {
  if (loading) {
    return <FullPageLoader />;
  }
  if (isAuthed) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function FullPageLoader() {
  return <div className="grid min-h-screen place-items-center text-slate-600">Loading secure session...</div>;
}

function LoginPage({ authApi }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ tenantCode: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Continue managing reconciliations, exceptions, and payout accuracy.">
      <form className="grid gap-2.5" onSubmit={handleSubmit}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace Access</p>
        <Field
          label="Organization Code"
          value={form.tenantCode}
          onChange={(value) => setForm((prev) => ({ ...prev, tenantCode: value.toUpperCase() }))}
          placeholder="ACME"
          helper="Use the tenant code created during organization signup."
          required
        />
        <Field
          label="Work Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          placeholder="admin@company.com"
          required
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
          required
        />
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Sign in failed: {error}
          </p>
        ) : null}
        <button
          className="brand-btn mt-2 rounded-md px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        New organization?{" "}
        <Link className="brand-link font-medium" to="/signup">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

function SignupPage({ authApi }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    organizationName: "",
    organizationCode: "",
    adminName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.signup(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create organization"
      subtitle="Set up your AP workspace to reconcile vendor payments faster across systems."
    >
      <form className="grid gap-2.5" onSubmit={handleSubmit}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Organization Setup</p>
        <Field
          label="Organization Name"
          value={form.organizationName}
          onChange={(value) => setForm((prev) => ({ ...prev, organizationName: value }))}
          placeholder="Acme Manufacturing"
          required
        />
        <Field
          label="Organization Code"
          value={form.organizationCode}
          onChange={(value) => setForm((prev) => ({ ...prev, organizationCode: value.toUpperCase() }))}
          placeholder="ACME (optional)"
          helper="Leave blank to auto-generate from your organization name."
        />
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Account</p>
        <Field
          label="Admin Name"
          value={form.adminName}
          onChange={(value) => setForm((prev) => ({ ...prev, adminName: value }))}
          placeholder="Jane Doe"
          required
        />
        <Field
          label="Admin Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          placeholder="jane@acme.com"
          required
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
          placeholder="Minimum 8 characters"
          helper="Use at least 8 characters with a mix of letters and numbers."
          required
        />
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Account setup failed: {error}
          </p>
        ) : null}
        <button
          className="brand-btn mt-2 rounded-md px-4 py-2.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already registered?{" "}
        <Link className="brand-link font-medium" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ label, helper, onChange, ...props }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="brand-input"
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
      {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
    </label>
  );
}

function DashboardPage({ session, onLogout }) {
  return (
    <div className="grid min-h-screen md:grid-cols-[250px_1fr]">
      <aside className="brand-hero relative overflow-hidden p-6 text-slate-100">
        <div className="brand-grid absolute inset-0" />
        <div className="relative z-10 mb-6">
          <LogoMark />
        </div>
        <nav className="relative z-10 grid gap-2">
          <a className="rounded-md bg-white/10 px-3 py-2" href="#">
            Dashboard
          </a>
          <a className="rounded-md px-3 py-2 hover:bg-white/10" href="#">
            Reconciliation
          </a>
          <a className="rounded-md px-3 py-2 hover:bg-white/10" href="#">
            Exceptions
          </a>
        </nav>
      </aside>

      <main className="p-5 md:p-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-emerald-700">Tenant: {session?.tenant?.name || "Unknown"}</p>
            <h2 className="mt-1 text-2xl font-semibold">Finance Operations Console</h2>
            <p className="text-sm text-slate-600">
              Signed in as {session?.user?.name} ({session?.user?.role})
            </p>
          </div>
          <button className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100" onClick={onLogout}>
            Logout
          </button>
        </header>
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <h3 className="mt-1 text-2xl font-semibold">{item.value}</h3>
            </article>
          ))}
        </section>
        <section className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-slate-700">
          {exceptions.length === 0 ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Exception Queue</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">No open exceptions right now</h3>
              <p className="mt-1 text-sm text-slate-600">
                Great work. New unmatched or partial records will appear here for review.
              </p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
