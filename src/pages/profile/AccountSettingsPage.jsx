import React, { useEffect, useMemo, useState } from "react";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  LinkIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from 'framer-motion';
import ScrollArea from '../../components/common/ScrollArea';
import Input from '../../components/common/Forms/Input';

/**************************************
 * SettingsPage.jsx — Brand palette applied
 * Tailwind + React (self-contained)
 * Palette: #bfa200 (gold), #fff, #002147 (navy), #ECEBE5 (paper)
 **************************************/

/************ Utilities *************/
const cn = (...args) => args.filter(Boolean).join(" ");

/************ Reusable UI *************/
const Card = ({ title, desc, children, danger = false, actions, className = "" }) => (
  <section
    className={cn(
      "rounded-2xl p-4 bg-black/10 backdrop-blur-md shadow-sm hover:bg-white/15 hover:shadow-md transition-all duration-200",
      danger ? "border border-red-500/40" : "",
      className
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        {title && (
          <h3 className={cn("text-lg font-semibold tracking-tight", danger ? "text-red-200" : "text-white")}>{title}</h3>
        )}
        {desc && <p className="text-sm text-white/70 mt-1 max-w-prose">{desc}</p>}
      </div>
      {actions}
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

const Label = ({ children, htmlFor, hint }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-[#fff]">
    {children}
    {hint && <span className="ml-1 text-xs text-[#fff]/60">{hint}</span>}
  </label>
);


const Select = ({ id, children, ...props }) => (
  <select
    id={id}
    className="mt-1 block w-full rounded-xl bg-white text-gray-900 shadow-sm ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bfa200] px-3 py-2"
    {...props}
  >
    {children}
  </select>
);

const Toggle = ({ id, checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div className="pr-4">
      <Label htmlFor={id}>{label}</Label>
      {description && <p className="text-sm text-[#fff]/70">{description}</p>}
    </div>
    <div className="relative">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <div className="h-6 w-11 rounded-full bg-[#ECEBE5]/30 peer-checked:bg-[#bfa200] transition-colors" />
      <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </div>
  </div>
);

const Button = ({ children, variant = "primary", className = "", loading, ...props }) => (
  <button
    disabled={loading || props.disabled}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2",
      variant === "primary" && "bg-[#bfa200] text-[#002147] hover:bg-[#a88e00] focus:ring-[#bfa200]",
      variant === "secondary" && "bg-[#ECEBE5]/10 text-[#fff] hover:bg-[#ECEBE5]/20 focus:ring-[#bfa200]/40",
      variant === "danger" && "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
      variant === "ghost" && "text-[#fff]/80 hover:bg-[#ECEBE5]/10 focus:ring-[#ECEBE5]/30",
      className
    )}
    {...props}
  >
    {loading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-[#ECEBE5]/20 p-8 text-center text-[#fff]/80">
    {Icon && <Icon className="h-10 w-10" />}
    <h4 className="mt-3 text-base font-semibold text-[#fff]">{title}</h4>
    {subtitle && <p className="mt-1 text-sm text-[#fff]/70">{subtitle}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/************ Fake Services (replace with real API) *************/
const services = {
  profile: async (data) => { await wait(500); return { ok: true, data }; },
  password: async ({ password }) => { await wait(500); return { ok: true }; },
  email: async ({ email }) => { await wait(500); return { ok: true }; },
  twoFA: async ({ enabled }) => { await wait(500); return { ok: true, secret: "otpauth://totp/YourApp?..." }; },
  sessions: async () => {
    await wait(350);
    return {
      ok: true,
      data: [
        { id: "sess_1", device: "MacBook Pro", location: "Barcelona, ES", lastActive: "Just now", current: true },
        { id: "sess_2", device: "iPhone 15", location: "Barcelona, ES", lastActive: "2 days ago", current: false },
      ],
    };
  },
  revokeSession: async (id) => { await wait(300); return { ok: true, id }; },
  payments: async () => {
    await wait(500);
    return {
      ok: true,
      methods: [
        { id: "pm_1", brand: "visa", last4: "4242", exp: "12/28", default: true },
        { id: "pm_2", brand: "mastercard", last4: "4444", exp: "02/27", default: false },
      ],
      invoices: [
        { id: "inv_001", number: "#0001", date: "2025-07-01", amount: 49.0, status: "paid", url: "#" },
        { id: "inv_002", number: "#0002", date: "2025-08-01", amount: 49.0, status: "paid", url: "#" },
      ],
      subscription: { plan: "Pro Quarterly", status: "active", renewsOn: "2025-10-01" },
    };
  },
  setDefaultPM: async (id) => { await wait(400); return { ok: true }; },
  removePM: async (id) => { await wait(400); return { ok: true }; },
  customerPortal: async () => { await wait(200); window.location.href = "/api/billing/portal"; },
  exportData: async () => { await wait(800); return { ok: true, fileUrl: "#" }; },
  deleteAccount: async () => { await wait(800); return { ok: true }; },
};

function wait(ms) { return new Promise((res) => setTimeout(res, ms)); }

/************ Sidebar *************/
const NAV = [
  { id: "profile", label: "Profile", icon: UserCircleIcon },
  { id: "security", label: "Security", icon: ShieldCheckIcon },
  { id: "billing", label: "Billing & Payments", icon: CreditCardIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "privacy", label: "Privacy & Data", icon: LockClosedIcon },
  { id: "connections", label: "Connected Apps", icon: LinkIcon },
  { id: "devices", label: "Sessions & Devices", icon: DevicePhoneMobileIcon },
  { id: "locale", label: "Language & Accessibility", icon: GlobeAltIcon },
  { id: "legal", label: "Legal", icon: DocumentTextIcon },
  { id: "danger", label: "Danger Zone", icon: TrashIcon },
];

const Sidebar = ({ active, onChange }) => (
  <aside className="sticky top-4 h-max">
    <nav className="grid gap-1 rounded-lg p-2 bg-black/10 backdrop-blur-md shadow-sm">
      {NAV.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200",
            active === item.id ? "bg-[#bfa200] text-[#002147]" : "hover:bg-white/15 text-white/80"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-sm font-medium">{item.label}</span>
          {active === item.id && <CheckCircleIcon className="ml-auto h-5 w-5" />}
        </button>
      ))}
    </nav>
  </aside>
);

/************ Sections *************/
function ProfileSection() {
  const [form, setForm] = useState({
    avatar: "",
    name: "Your Name",
    username: "username",
    email: "you@example.com",
    phone: "",
    timezone: "Europe/Madrid",
    website: "",
  });
  const [saving, setSaving] = useState(false);
  const onSave = async () => {
    setSaving(true);
    await services.profile(form);
    setSaving(false);
    alert("Profile saved.");
  };

  return (
    <div className="grid gap-6">
      <Card title="Public profile" desc="Control how your profile appears to others.">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="username" hint="@">Username</Label>
            <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" placeholder="https://" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onSave} loading={saving}>Save profile</Button>
        </div>
      </Card>

      <Card title="Contact & account" desc="Email and phone are kept private.">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="phone">Phone (for receipts / 2FA)</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="tz">Timezone</Label>
            <Select id="tz" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
              <option>Europe/Madrid</option>
              <option>Europe/Lisbon</option>
              <option>UTC</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex gap-3 justify-end">
          <Button variant="secondary">Send verification email</Button>
          <Button onClick={onSave} loading={saving}>Save changes</Button>
        </div>
      </Card>
    </div>
  );
}

function SecuritySection() {
  const [pwd, setPwd] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [secret, setSecret] = useState(null);

  const changePwd = async () => { await services.password({ password: pwd }); setPwd(""); alert("Password updated."); };
  const toggle2FA = async () => {
    const res = await services.twoFA({ enabled: !twoFAEnabled });
    setTwoFAEnabled(!twoFAEnabled);
    setSecret(res.secret || null);
  };

  return (
    <div className="grid gap-6">
      <Card title="Password" desc="Use a strong password. We support passphrases.">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="pwd">New password</Label>
            <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={changePwd} disabled={!pwd}>Update password</Button>
        </div>
      </Card>

      <Card
        title="Two‑factor authentication"
        desc="Add an extra layer of security using an authenticator app."
        actions={<Button variant={twoFAEnabled ? "secondary" : "primary"} onClick={toggle2FA}>{twoFAEnabled ? "Disable" : "Enable"}</Button>}
      >
        {twoFAEnabled ? (
          <div className="text-sm text-[#fff]/80">
            <p className="mb-2">2FA is enabled. Save your backup codes and keep them safe.</p>
            {secret && (
              <div className="rounded-lg border border-[#ECEBE5]/20 p-3 text-xs font-mono bg-[#ECEBE5]/5">{secret}</div>
            )}
            <div className="mt-3 flex gap-2">
              <Button variant="secondary">Download backup codes</Button>
              <Button variant="secondary">Regenerate</Button>
            </div>
          </div>
        ) : (
          <EmptyState icon={ShieldCheckIcon} title="Protect your account" subtitle="Enable 2FA to help prevent account takeovers." />
        )}
      </Card>

      <Card title="App passwords" desc="Generate app-specific passwords for legacy clients.">
        <EmptyState icon={LockClosedIcon} title="No app passwords" subtitle="Create one if you need to connect older clients." action={<Button variant="secondary">Generate</Button>} />
      </Card>
    </div>
  );
}

function BillingSection() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await services.payments();
      setData(res);
      setLoading(false);
    })();
  }, []);

  const setDefault = async (id) => {
    await services.setDefaultPM(id);
    alert("Default payment method updated.");
    setData((prev) => ({
      ...prev,
      methods: prev.methods.map((m) => ({ ...m, default: m.id === id }))
    }));
  };

  const removePM = async (id) => {
    if (confirm("Remove this payment method?")) {
      await services.removePM(id);
      alert("Removed.");
      setData((prev) => ({
        ...prev,
        methods: prev.methods.filter((m) => m.id !== id)
      }));
    }
  };

  if (loading) return (
    <div className="grid gap-6">
      <Card title="Billing & Payments">
        <div className="grid gap-3">
          <div className="h-24 rounded bg-[#ECEBE5]/10 animate-pulse" />
          <div className="h-24 rounded bg-[#ECEBE5]/10 animate-pulse" />
          <div className="h-24 rounded bg-[#ECEBE5]/10 animate-pulse" />
        </div>
      </Card>
    </div>
  );

  const { subscription, methods, invoices } = data;

  return (
    <div className="grid gap-6">
      <SubscriptionCard subscription={subscription} />
      <PaymentMethodsCard methods={methods} onMakeDefault={setDefault} onRemove={removePM} />
      <InvoicesCard invoices={invoices} />
    </div>
  );
}

const SubscriptionCard = ({ subscription }) => (
  <Card title="Subscription" desc="Manage your plan, invoices, and payment details.">
    <div className="grid gap-3 text-[#fff]/90 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0 space-y-1">
        <span className="inline-block rounded-full bg-[#ECEBE5]/10 px-3 py-1 text-sm">{subscription.plan}</span>
        <div className="text-sm">Status: <span className="font-semibold text-green-300">{subscription.status}</span></div>
        <div className="text-sm">Renews on {subscription.renewsOn}</div>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:ml-auto sm:flex-row sm:justify-end">
        <Button onClick={() => services.customerPortal()}>
          Open customer portal <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </Button>
        <Button variant="secondary">Change plan</Button>
      </div>
    </div>
  </Card>
);

const PaymentMethodRow = ({ m, onMakeDefault, onRemove }) => (
  <div className="flex flex-col gap-3 rounded-xl border border-[#ECEBE5]/20 p-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3 text-[#fff]">
      <CreditCardIcon className="h-5 w-5" />
      <div className="text-sm">
        <p className="font-medium uppercase">{m.brand} •••• {m.last4}</p>
        <p className="text-[#fff]/70">Exp {m.exp}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {m.default ? (
        <span className="rounded-full bg-green-600/20 text-green-300 px-2 py-1 text-xs">Default</span>
      ) : (
        <Button variant="secondary" onClick={() => onMakeDefault(m.id)}>Make default</Button>
      )}
      <Button variant="ghost" onClick={() => onRemove(m.id)}>Remove</Button>
    </div>
  </div>
);

const PaymentMethodsCard = ({ methods, onMakeDefault, onRemove }) => (
  <Card title="Payment methods" desc="Add, remove, or set a default card.">
    {methods.length === 0 ? (
      <EmptyState icon={CreditCardIcon} title="No payment methods" subtitle="Add a card to start your subscription." action={<Button variant="secondary">Add payment method</Button>} />
    ) : (
      <div className="grid gap-3">
        {methods.map((m) => (
          <PaymentMethodRow key={m.id} m={m} onMakeDefault={onMakeDefault} onRemove={onRemove} />
        ))}
        <div className="flex justify-end w-full">
          <Button variant="secondary" className="w-full sm:w-auto">Add payment method</Button>
        </div>
      </div>
    )}
  </Card>
);

const InvoicesCard = ({ invoices }) => (
  <Card title="Invoices & receipts">
    {invoices.length === 0 ? (
      <EmptyState icon={DocumentTextIcon} title="No invoices yet" />
    ) : (
      <>
        {/* Mobile cards */}
        <div className="grid gap-3 sm:hidden">
          {invoices.map((inv) => (
            <div key={inv.id} className="rounded-xl border border-[#ECEBE5]/20 p-3">
              <div className="flex items-center justify-between text-sm text-[#fff]">
                <span className="font-medium">{inv.number}</span>
                <span className={cn("rounded-full px-2 py-1 text-xs", inv.status === "paid" ? "bg-green-600/20 text-green-300" : "bg-yellow-500/20 text-yellow-300")}>{inv.status}</span>
              </div>
              <div className="mt-1 text-sm text-[#fff]/80">{inv.date}</div>
              <div className="mt-1 text-sm text-[#fff] font-semibold">€{inv.amount.toFixed(2)}</div>
              <div className="mt-3 flex justify-end">
                <Button variant="secondary" onClick={() => window.open(inv.url, "_blank")}>Download</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full text-sm text-[#fff]/90">
            <thead className="text-[#fff]/70">
              <tr>
                <th className="py-2 pr-4 text-left">Number</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Status</th>
                <th className="py-2 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-[#ECEBE5]/10">
                  <td className="py-3 pr-4">{inv.number}</td>
                  <td className="py-3 px-4">{inv.date}</td>
                  <td className="py-3 px-4">€{inv.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={cn("rounded-full px-2 py-1 text-xs", inv.status === "paid" ? "bg-green-600/20 text-green-300" : "bg-yellow-500/20 text-yellow-300")}>{inv.status}</span>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <Button variant="secondary" onClick={() => window.open(inv.url, "_blank")}>Download</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
  </Card>
);


function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    marketing: false,
    product: true,
    billing: true,
    security: true,
    digest: "weekly",
  });

  return (
    <div className="grid gap-6">
      <Card title="Email notifications" desc="Choose what we send you by email.">
        <Toggle id="notif-product" label="Product updates" checked={prefs.product} onChange={(e) => setPrefs({ ...prefs, product: e.target.checked })} />
        <Toggle id="notif-billing" label="Billing & receipts" checked={prefs.billing} onChange={(e) => setPrefs({ ...prefs, billing: e.target.checked })} />
        <Toggle id="notif-security" label="Security alerts" checked={prefs.security} onChange={(e) => setPrefs({ ...prefs, security: e.target.checked })} />
        <Toggle id="notif-marketing" label="Marketing & newsletter" checked={prefs.marketing} onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })} />
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="digest">Summary digest</Label>
            <Select id="digest" value={prefs.digest} onChange={(e) => setPrefs({ ...prefs, digest: e.target.value })}>
              <option value="off">Off</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end"><Button>Save preferences</Button></div>
      </Card>
    </div>
  );
}

function PrivacySection() {
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [retention, setRetention] = useState("6m");

  const exportData = async () => { const res = await services.exportData(); alert(res.ok ? "Export started / ready." : "Failed"); };

  return (
    <div className="grid gap-6">
      <Card title="Privacy controls" desc="Control analytics and personalized experiences.">
        <Toggle id="analytics" label="Allow anonymous analytics" description="We use usage analytics to improve the product." checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
        <Toggle id="personalization" label="Personalized content" description="Tailor content based on your activity." checked={personalization} onChange={(e) => setPersonalization(e.target.checked)} />
        <div className="mt-3 grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="retention">Chat & data retention</Label>
            <Select id="retention" value={retention} onChange={(e) => setRetention(e.target.value)}>
              <option value="30d">30 days</option>
              <option value="3m">3 months</option>
              <option value="6m">6 months</option>
              <option value="12m">12 months</option>
              <option value="forever">Keep until deleted</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end"><Button>Save privacy settings</Button></div>
      </Card>

      <Card title="Your data" desc="Export or delete your data at any time.">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}>Export my data</Button>
          <Button variant="secondary">Request data report</Button>
        </div>
      </Card>
    </div>
  );
}

function ConnectionsSection() {
  return (
    <div className="grid gap-6">
      <Card title="Connected accounts" desc="Link or unlink social logins.">
        <div className="grid gap-3">
          {[
            { id: "google", label: "Google", connected: true },
            { id: "apple", label: "Apple", connected: false },
            { id: "github", label: "GitHub", connected: false },
          ].map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-[#ECEBE5]/20 p-3">
              <div className="text-[#fff]">{p.label}</div>
              <div>
                {p.connected ? (
                  <Button variant="ghost">Disconnect</Button>
                ) : (
                  <Button variant="secondary">Connect</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DevicesSection() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  useEffect(() => { (async () => { const res = await services.sessions(); setSessions(res.data); setLoading(false); })(); }, []);
  const revoke = async (id) => { await services.revokeSession(id); setSessions((s) => s.filter((x) => x.id !== id)); };

  return (
    <div className="grid gap-6">
      <Card title="Active sessions" desc="Devices with access to your account.">
        {loading ? (
          <div className="grid gap-3">
            <div className="h-14 rounded bg-[#ECEBE5]/10 animate-pulse" />
            <div className="h-14 rounded bg-[#ECEBE5]/10 animate-pulse" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState icon={DevicePhoneMobileIcon} title="No active sessions" />
        ) : (
          <div className="grid gap-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-[#ECEBE5]/20 p-3">
                <div className="text-[#fff]">
                  <p className="font-medium">{s.device} {s.current && <span className="ml-2 rounded-full bg-[#bfa200]/30 text-[#bfa200] px-2 py-0.5 text-xs">This device</span>}</p>
                  <p className="text-[#fff]/70 text-sm">{s.location} • {s.lastActive}</p>
                </div>
                {!s.current && <Button variant="ghost" onClick={() => revoke(s.id)}>Revoke</Button>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Login history" desc="Recent security events" className="overflow-hidden">
        <div className="text-sm text-[#fff]/70">Coming soon</div>
      </Card>
    </div>
  );
}

function LocaleSection() {
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("system");
  const [motion, setMotion] = useState(false);
  const [font, setFont] = useState("base");

  return (
    <div className="grid gap-6">
      <Card title="Language & region">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lang">Language</Label>
            <Select id="lang" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
              <option value="ca">Català</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card title="Accessibility & appearance">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="font">Font size</Label>
            <Select id="font" value={font} onChange={(e) => setFont(e.target.value)}>
              <option value="sm">Small</option>
              <option value="base">Default</option>
              <option value="lg">Large</option>
            </Select>
          </div>
        </div>
        <div className="mt-2">
          <Toggle id="motion" label="Reduce motion" checked={motion} onChange={(e) => setMotion(e.target.checked)} />
        </div>
      </Card>
    </div>
  );
}

function LegalSection() {
  return (
    <div className="grid gap-6">
      <Card title="Legal" desc="Our policies and agreements.">
        <ul className="divide-y divide-[#ECEBE5]/10 rounded-xl border border-[#ECEBE5]/20 overflow-hidden">
          {[
            { label: "Privacy Policy", to: "/privacy-policy" },
            { label: "Terms of Service", to: "/terms-of-service" },
            { label: "Refund Policy", to: "/refund-policy" },
            { label: "Data Processing Addendum", to: "/dpa" },
          ].map((l) => (
            <li key={l.to} className="flex items-center justify-between bg-[#ECEBE5]/5 px-4 py-3 text-[#fff]">
              <span>{l.label}</span>
              <a className="text-sm underline decoration-[#ECEBE5]/40 hover:decoration-[#ECEBE5]" href={l.to}>View</a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function DangerSection() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const deleteAccount = async () => {
    if (!confirming) { setConfirming(true); return; }
    setBusy(true);
    await services.deleteAccount();
    setBusy(false);
    alert("Account deleted. Redirecting to sign up…");
    // navigate("/signup") if you use react-router
  };

  return (
    <Card
      title="Danger zone"
      desc="Delete your account and all associated data. This action is irreversible."
      danger
      actions={<ExclamationTriangleIcon className="h-6 w-6 text-red-300" />}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-red-200">All active subscriptions will be cancelled. Invoices remain for tax compliance.</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={deleteAccount} loading={busy}>{confirming ? "Click to confirm" : "Delete account"}</Button>
        </div>
      </div>
    </Card>
  );
}

/************ Main Page *************/
export default function SettingsPage() {
  const [active, setActive] = useState("profile");
  const [hoveredButton, setHoveredButton] = useState(null);

  const Section = useMemo(() => {
    switch (active) {
      case "profile": return <ProfileSection />;
      case "security": return <SecuritySection />;
      case "billing": return <BillingSection />;
      case "notifications": return <NotificationsSection />;
      case "privacy": return <PrivacySection />;
      case "connections": return <ConnectionsSection />;
      case "devices": return <DevicesSection />;
      case "locale": return <LocaleSection />;
      case "legal": return <LegalSection />;
      case "danger": return <DangerSection />;
      default: return null;
    }
  }, [active]);

  return (
    <main className="min-h-screen bg-[#002147]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fff] text-center">Settings</h1>
        </header>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar on desktop, top tabs on mobile */}
          <div className="hidden lg:block"><Sidebar active={active} onChange={setActive} /></div>
          <ScrollArea axis="x" hideScrollbar className="lg:hidden -mx-4 mb-1 flex px-4">
            {NAV.map((n) => {
              const isActive = active === n.id;
              const isHovered = hoveredButton === n.id;
              const shouldShowHover = isHovered && !isActive;
              const baseScale = isActive ? 1.06 : 1;
              const hoverScale = isActive ? 1.09 : 1.06;

              return (
                <motion.button
                  key={n.id}
                  onClick={() => setActive(n.id)}
                  onMouseEnter={() => setHoveredButton(n.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'mr-2 whitespace-nowrap rounded-lg px-3 py-1 text-sm',
                    isActive
                      ? 'bg-[#BFA200] text-black shadow-lg'
                      : shouldShowHover
                      ? 'bg-[#BFA200] text-black shadow-lg'
                      : 'bg-black/20 text-white border border-white/20',
                    'cursor-pointer',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/70',
                    'transition-all duration-200',
                  )}
                  animate={{ scale: baseScale }}
                  whileHover={{ scale: hoverScale }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                >
                  {n.label}
                </motion.button>
              );
            })}
          </ScrollArea>

          <div className="min-w-0 space-y-6">{Section}</div>
        </div>
      </div>
    </main>
  );
}
