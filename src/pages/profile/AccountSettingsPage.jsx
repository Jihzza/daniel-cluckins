// src/pages/settings/AccountSettingsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  UserCircleIcon, ShieldCheckIcon, CreditCardIcon, BellIcon, LockClosedIcon,
  GlobeAltIcon, LinkIcon, DevicePhoneMobileIcon, DocumentTextIcon, TrashIcon,
  ArrowTopRightOnSquareIcon, ExclamationTriangleIcon, ArrowPathIcon, CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import ScrollArea from "../../components/common/ScrollArea";
import Input from "../../components/common/Forms/Input";
import { useTranslation } from "react-i18next";

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
    className="mt-1 block w/full rounded-xl bg-white text-gray-900 shadow-sm ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-[#bfa200] px-3 py-2"
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
  { id: "profile", icon: UserCircleIcon },
  { id: "security", icon: ShieldCheckIcon },
  { id: "billing", icon: CreditCardIcon },
  { id: "notifications", icon: BellIcon },
  { id: "privacy", icon: LockClosedIcon },
  { id: "connections", icon: LinkIcon },
  { id: "devices", icon: DevicePhoneMobileIcon },
  { id: "locale", icon: GlobeAltIcon },
  { id: "legal", icon: DocumentTextIcon },
  { id: "danger", icon: TrashIcon },
];

const Sidebar = ({ active, onChange }) => {
  const { t } = useTranslation();
  return (
    <aside className="sticky top-4 h-max">
      <nav className="grid gap-1 rounded-lg p-2 bg-black/10 backdrop-blur-md shadow-sm" aria-label={t("accountSettings.page.sidebarAria")}>
        {NAV.map((item) => {
          const label = t(`accountSettings.page.nav.${item.id}`);
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-200",
                active === item.id ? "bg-[#bfa200] text-[#002147]" : "hover:bg-white/15 text-white/80"
              )}
              aria-current={active === item.id ? "page" : undefined}
              aria-label={label}
              title={label}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
              {active === item.id && <CheckCircleIcon className="ml-auto h-5 w-5" aria-hidden="true" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

/************ Sections *************/
function ProfileSection() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    avatar: "",
    name: t("accountSettings.page.profile.exampleName"),
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
    alert(t("accountSettings.page.common.saved"));
  };

  return (
    <div className="grid gap-6">
      <Card title={t("accountSettings.page.profile.title")} desc={t("accountSettings.page.profile.desc")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">{t("accountSettings.page.profile.name")}</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="username" hint="@">{t("accountSettings.page.profile.username")}</Label>
            <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="website">{t("accountSettings.page.profile.website")}</Label>
            <Input id="website" placeholder="https://" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onSave} loading={saving}>{t("accountSettings.page.profile.saveProfile")}</Button>
        </div>
      </Card>

      <Card title={t("accountSettings.page.contact.title")} desc={t("accountSettings.page.contact.desc")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">{t("accountSettings.page.contact.email")}</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="phone">{t("accountSettings.page.contact.phone")}</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="tz">{t("accountSettings.page.contact.timezone")}</Label>
            <Select id="tz" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
              <option>Europe/Madrid</option>
              <option>Europe/Lisbon</option>
              <option>UTC</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex gap-3 justify-end">
          <Button variant="secondary">{t("accountSettings.page.contact.sendVerification")}</Button>
          <Button onClick={onSave} loading={saving}>{t("accountSettings.page.common.saveChanges")}</Button>
        </div>
      </Card>
    </div>
  );
}

function SecuritySection() {
  const { t } = useTranslation();
  const [pwd, setPwd] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [secret, setSecret] = useState(null);

  const changePwd = async () => { await services.password({ password: pwd }); setPwd(""); alert(t("accountSettings.page.security.passwordUpdated")); };
  const toggle2FA = async () => {
    const res = await services.twoFA({ enabled: !twoFAEnabled });
    setTwoFAEnabled(!twoFAEnabled);
    setSecret(res.secret || null);
  };

  return (
    <div className="grid gap-6">
      <Card title={t("accountSettings.page.security.passwordTitle")} desc={t("accountSettings.page.security.passwordDesc")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="pwd">{t("accountSettings.page.security.newPassword")}</Label>
            <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={changePwd} disabled={!pwd}>{t("accountSettings.page.security.updatePasswordBtn")}</Button>
        </div>
      </Card>

      <Card
        title={t("accountSettings.page.security.twofaTitle")}
        desc={t("accountSettings.page.security.twofaDesc")}
        actions={<Button variant={twoFAEnabled ? "secondary" : "primary"} onClick={toggle2FA}>{twoFAEnabled ? t("common.disable") : t("common.enable")}</Button>}
      >
        {twoFAEnabled ? (
          <div className="text-sm text-[#fff]/80">
            <p className="mb-2">{t("accountSettings.page.security.twofaEnabledNote")}</p>
            {secret && (
              <div className="rounded-lg border border-[#ECEBE5]/20 p-3 text-xs font-mono bg-[#ECEBE5]/5">{secret}</div>
            )}
            <div className="mt-3 flex gap-2">
              <Button variant="secondary">{t("accountSettings.page.security.downloadBackupCodes")}</Button>
              <Button variant="secondary">{t("accountSettings.page.security.regenerate")}</Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={ShieldCheckIcon}
            title={t("accountSettings.page.security.protectTitle")}
            subtitle={t("accountSettings.page.security.protectSubtitle")}
          />
        )}
      </Card>

      <Card title={t("accountSettings.page.security.appPasswordsTitle")} desc={t("accountSettings.page.security.appPasswordsDesc")}>
        <EmptyState
          icon={LockClosedIcon}
          title={t("accountSettings.page.security.noAppPasswords")}
          subtitle={t("accountSettings.page.security.noAppPasswordsSubtitle")}
          action={<Button variant="secondary">{t("accountSettings.page.security.generate")}</Button>}
        />
      </Card>
    </div>
  );
}

function BillingSection() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => { (async () => { const res = await services.payments(); setData(res); setLoading(false); })(); }, []);

  const setDefault = async (id) => {
    await services.setDefaultPM(id);
    alert(t("accountSettings.page.billing.defaultUpdated"));
    setData((prev) => ({ ...prev, methods: prev.methods.map((m) => ({ ...m, default: m.id === id })) }));
  };

  const removePM = async (id) => {
    if (confirm(t("accountSettings.page.billing.removeConfirm"))) {
      await services.removePM(id);
      alert(t("accountSettings.page.billing.removed"));
      setData((prev) => ({ ...prev, methods: prev.methods.filter((m) => m.id !== id) }));
    }
  };

  if (loading) return (
    <div className="grid gap-6">
      <Card title={t("accountSettings.page.billing.title")}>
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

const SubscriptionCard = ({ subscription }) => {
  const { t } = useTranslation();
  return (
    <Card title={t("accountSettings.page.subscription.title")} desc={t("accountSettings.page.subscription.desc")}>
      <div className="grid gap-3 text-[#fff]/90 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0 space-y-1">
          <span className="inline-block rounded-full bg-[#ECEBE5]/10 px-3 py-1 text-sm">{subscription.plan}</span>
          <div className="text-sm">{t("accountSettings.page.subscription.status")}: <span className="font-semibold text-green-300">{subscription.status}</span></div>
          <div className="text-sm">{t("accountSettings.page.subscription.renewsOn", { date: subscription.renewsOn })}</div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:ml-auto sm:flex-row sm:justify-end">
          <Button onClick={() => services.customerPortal()}>
            {t("accountSettings.page.subscription.openPortal")} <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </Button>
          <Button variant="secondary">{t("accountSettings.page.subscription.changePlan")}</Button>
        </div>
      </div>
    </Card>
  );
};

const PaymentMethodRow = ({ m, onMakeDefault, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#ECEBE5]/20 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-[#fff]">
        <CreditCardIcon className="h-5 w-5" />
        <div className="text-sm">
          <p className="font-medium uppercase">{m.brand} •••• {m.last4}</p>
          <p className="text-[#fff]/70">{t("accountSettings.page.billing.exp", { exp: m.exp })}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {m.default ? (
          <span className="rounded-full bg-green-600/20 text-green-300 px-2 py-1 text-xs">{t("accountSettings.page.billing.default")}</span>
        ) : (
          <Button variant="secondary" onClick={() => onMakeDefault(m.id)}>{t("accountSettings.page.billing.makeDefault")}</Button>
        )}
        <Button variant="ghost" onClick={() => onRemove(m.id)}>{t("accountSettings.page.billing.remove")}</Button>
      </div>
    </div>
  );
};

const PaymentMethodsCard = ({ methods, onMakeDefault, onRemove }) => {
  const { t } = useTranslation();
  return (
    <Card title={t("accountSettings.page.paymentMethods.title")} desc={t("accountSettings.page.paymentMethods.desc")}>
      {methods.length === 0 ? (
        <EmptyState
          icon={CreditCardIcon}
          title={t("accountSettings.page.paymentMethods.emptyTitle")}
          subtitle={t("accountSettings.page.paymentMethods.emptySubtitle")}
          action={<Button variant="secondary">{t("accountSettings.page.paymentMethods.add")}</Button>}
        />
      ) : (
        <div className="grid gap-3">
          {methods.map((m) => (
            <PaymentMethodRow key={m.id} m={m} onMakeDefault={onMakeDefault} onRemove={onRemove} />
          ))}
          <div className="flex justify-end w-full">
            <Button variant="secondary" className="w-full sm:w-auto">{t("accountSettings.page.paymentMethods.add")}</Button>
          </div>
        </div>
      )}
    </Card>
  );
};

const InvoicesCard = ({ invoices }) => {
  const { t } = useTranslation();
  return (
    <Card title={t("accountSettings.page.invoices.title")}>
      {invoices.length === 0 ? (
        <EmptyState icon={DocumentTextIcon} title={t("accountSettings.page.invoices.empty")} />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="grid gap-3 sm:hidden">
            {invoices.map((inv) => (
              <div key={inv.id} className="rounded-xl border border-[#ECEBE5]/20 p-3">
                <div className="flex items-center justify-between text-sm text-[#fff]">
                  <span className="font-medium">{inv.number}</span>
                  <span className={cn("rounded-full px-2 py-1 text-xs", inv.status === "paid" ? "bg-green-600/20 text-green-300" : "bg-yellow-500/20 text-yellow-300")}>{t(`accountSettings.page.invoices.status.${inv.status}`, { defaultValue: inv.status })}</span>
                </div>
                <div className="mt-1 text-sm text-[#fff]/80">{inv.date}</div>
                <div className="mt-1 text-sm text-[#fff] font-semibold">€{inv.amount.toFixed(2)}</div>
                <div className="mt-3 flex justify-end">
                  <Button variant="secondary" onClick={() => window.open(inv.url, "_blank")}>{t("accountSettings.page.invoices.download")}</Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full text-sm text-[#fff]/90">
              <thead className="text-[#fff]/70">
                <tr>
                  <th className="py-2 pr-4 text-left">{t("accountSettings.page.invoices.cols.number")}</th>
                  <th className="py-2 px-4 text-left">{t("accountSettings.page.invoices.cols.date")}</th>
                  <th className="py-2 px-4 text-left">{t("accountSettings.page.invoices.cols.amount")}</th>
                  <th className="py-2 px-4 text-left">{t("accountSettings.page.invoices.cols.status")}</th>
                  <th className="py-2 pl-4 text-right">{t("accountSettings.page.invoices.cols.action")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-[#ECEBE5]/10">
                    <td className="py-3 pr-4">{inv.number}</td>
                    <td className="py-3 px-4">{inv.date}</td>
                    <td className="py-3 px-4">€{inv.amount.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={cn("rounded-full px-2 py-1 text-xs", inv.status === "paid" ? "bg-green-600/20 text-green-300" : "bg-yellow-500/20 text-yellow-300")}>{t(`accountSettings.page.invoices.status.${inv.status}`, { defaultValue: inv.status })}</span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Button variant="secondary" onClick={() => window.open(inv.url, "_blank")}>{t("accountSettings.page.invoices.download")}</Button>
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
};

function NotificationsSection() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState({ marketing: false, product: true, billing: true, security: true, digest: "weekly" });

  return (
    <div className="grid gap-6">
      <Card title={t("accountSettings.page.notifications.title")} desc={t("accountSettings.page.notifications.desc")}>
        <Toggle id="notif-product" label={t("accountSettings.page.notifications.product")} checked={prefs.product} onChange={(e) => setPrefs({ ...prefs, product: e.target.checked })} />
        <Toggle id="notif-billing" label={t("accountSettings.page.notifications.billing")} checked={prefs.billing} onChange={(e) => setPrefs({ ...prefs, billing: e.target.checked })} />
        <Toggle id="notif-security" label={t("accountSettings.page.notifications.security")} checked={prefs.security} onChange={(e) => setPrefs({ ...prefs, security: e.target.checked })} />
        <Toggle id="notif-marketing" label={t("accountSettings.page.notifications.marketing")} checked={prefs.marketing} onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })} />
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="digest">{t("accountSettings.page.notifications.digest")}</Label>
            <Select id="digest" value={prefs.digest} onChange={(e) => setPrefs({ ...prefs, digest: e.target.value })}>
              <option value="off">{t("accountSettings.page.notifications.digestOff")}</option>
              <option value="daily">{t("accountSettings.page.notifications.digestDaily")}</option>
              <option value="weekly">{t("accountSettings.page.notifications.digestWeekly")}</option>
              <option value="monthly">{t("accountSettings.page.notifications.digestMonthly")}</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end"><Button>{t("accountSettings.page.common.savePreferences")}</Button></div>
      </Card>
    </div>
  );
}

function PrivacySection() {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  const [retention, setRetention] = useState("6m");

  const exportData = async () => { const res = await services.exportData(); alert(res.ok ? t("accountSettings.page.privacy.exportOk") : t("accountSettings.page.privacy.exportFail")); };

  return (
    <div className="grid gap-6">
      <Card title={t("accountSettings.page.privacy.title")} desc={t("accountSettings.page.privacy.desc")}>
        <Toggle id="analytics" label={t("accountSettings.page.privacy.analytics")} description={t("accountSettings.page.privacy.analyticsDesc")} checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
        <Toggle id="personalization" label={t("accountSettings.page.privacy.personalized")} description={t("accountSettings.page.privacy.personalizedDesc")} checked={personalization} onChange={(e) => setPersonalization(e.target.checked)} />
        <div className="mt-3 grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="retention">{t("accountSettings.page.privacy.retention")}</Label>
            <Select id="retention" value={retention} onChange={(e) => setRetention(e.target.value)}>
              <option value="30d">{t("accountSettings.page.privacy.retention30d")}</option>
              <option value="3m">{t("accountSettings.page.privacy.retention3m")}</option>
              <option value="6m">{t("accountSettings.page.privacy.retention6m")}</option>
              <option value="12m">{t("accountSettings.page.privacy.retention12m")}</option>
              <option value="forever">{t("accountSettings.page.privacy.retentionForever")}</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end"><Button>{t("accountSettings.page.privacy.savePrivacy")}</Button></div>
      </Card>

      <Card title={t("accountSettings.page.data.title")} desc={t("accountSettings.page.data.desc")}>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}>{t("accountSettings.page.data.export")}</Button>
          <Button variant="secondary">{t("accountSettings.page.data.requestReport")}</Button>
        </div>
      </Card>
    </div>
  );
}

function ConnectionsSection() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-6">
      <Card title={t("accountSettings.page.connections.title")} desc={t("accountSettings.page.connections.desc")}>
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
                  <Button variant="ghost">{t("accountSettings.page.connections.disconnect")}</Button>
                ) : (
                  <Button variant="secondary">{t("accountSettings.page.connections.connect")}</Button>
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  useEffect(() => { (async () => { const res = await services.sessions(); setSessions(res.data); setLoading(false); })(); }, []);
  const revoke = async (id) => { await services.revokeSession(id); setSessions((s) => s.filter((x) => x.id !== id)); };

  return (
    <div className="grid gap-6">
      <Card title={t("accountSettings.page.devices.title")} desc={t("accountSettings.page.devices.desc")}>
        {loading ? (
          <div className="grid gap-3">
            <div className="h-14 rounded bg-[#ECEBE5]/10 animate-pulse" />
            <div className="h-14 rounded bg-[#ECEBE5]/10 animate-pulse" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState icon={DevicePhoneMobileIcon} title={t("accountSettings.page.devices.empty")} />
        ) : (
          <div className="grid gap-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-[#ECEBE5]/20 p-3">
                <div className="text-[#fff]">
                  <p className="font-medium">
                    {s.device} {s.current && <span className="ml-2 rounded-full bg-[#bfa200]/30 text-[#bfa200] px-2 py-0.5 text-xs">{t("accountSettings.page.devices.thisDevice")}</span>}
                  </p>
                  <p className="text-[#fff]/70 text-sm">{s.location} • {s.lastActive}</p>
                </div>
                {!s.current && <Button variant="ghost" onClick={() => revoke(s.id)}>{t("accountSettings.page.devices.revoke")}</Button>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title={t("accountSettings.page.devices.historyTitle")} desc={t("accountSettings.page.devices.historyDesc")} className="overflow-hidden">
        <div className="text-sm text-[#fff]/70">{t("common.comingSoon")}</div>
      </Card>
    </div>
  );
}

function LocaleSection() {
  const { t } = useTranslation();
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("system");
  const [motionPref, setMotionPref] = useState(false);
  const [font, setFont] = useState("base");

  return (
    <div className="grid gap-6">
      <Card title={t("accountSettings.page.locale.title")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lang">{t("accountSettings.page.locale.language")}</Label>
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

      <Card title={t("accountSettings.page.accessibility.title")}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="theme">{t("accountSettings.page.accessibility.theme")}</Label>
            <Select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">{t("accountSettings.page.accessibility.themeLight")}</option>
              <option value="dark">{t("accountSettings.page.accessibility.themeDark")}</option>
              <option value="system">{t("accountSettings.page.accessibility.themeSystem")}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="font">{t("accountSettings.page.accessibility.fontSize")}</Label>
            <Select id="font" value={font} onChange={(e) => setFont(e.target.value)}>
              <option value="sm">{t("accountSettings.page.accessibility.fontSmall")}</option>
              <option value="base">{t("accountSettings.page.accessibility.fontDefault")}</option>
              <option value="lg">{t("accountSettings.page.accessibility.fontLarge")}</option>
            </Select>
          </div>
        </div>
        <div className="mt-2">
          <Toggle id="motion" label={t("accountSettings.page.accessibility.reduceMotion")} checked={motionPref} onChange={(e) => setMotionPref(e.target.checked)} />
        </div>
      </Card>
    </div>
  );
}

function LegalSection() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-6">
      <Card title={t("accountSettings.page.legal.title")} desc={t("accountSettings.page.legal.desc")}>
        <ul className="divide-y divide-[#ECEBE5]/10 rounded-xl border border-[#ECEBE5]/20 overflow-hidden">
          {[
            { label: t("accountSettings.page.legal.privacyPolicy"), to: "/privacy-policy" },
            { label: t("accountSettings.page.legal.termsOfService"), to: "/terms-of-service" },
            { label: t("accountSettings.page.legal.refundPolicy"), to: "/refund-policy" },
            { label: t("accountSettings.page.legal.dpa"), to: "/dpa" },
          ].map((l) => (
            <li key={l.to} className="flex items-center justify-between bg-black/10 px-4 py-3 text-[#fff]">
              <span>{l.label}</span>
              <a className="text-sm underline decoration-[#ECEBE5]/40 hover:decoration-[#ECEBE5]" href={l.to}>{t("common.view")}</a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function DangerSection() {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const deleteAccount = async () => {
    if (!confirming) { setConfirming(true); return; }
    setBusy(true);
    await services.deleteAccount();
    setBusy(false);
    alert(t("accountSettings.page.danger.deletedRedirect"));
  };

  return (
    <Card
      title={t("accountSettings.page.danger.title")}
      desc={t("accountSettings.page.danger.desc")}
      danger
      actions={<ExclamationTriangleIcon className="h-6 w-6 text-red-300" aria-hidden="true" />}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-red-200">{t("accountSettings.page.danger.note")}</p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={deleteAccount} loading={busy}>
            {confirming ? t("accountSettings.page.danger.confirmBtn") : t("accountSettings.page.danger.deleteBtn")}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/************ Main Page *************/
export default function SettingsPage() {
  const { t } = useTranslation();
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fff] text-center">
            {t("accountSettings.page.title")}
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar on desktop, top tabs on mobile */}
          <div className="hidden lg:block">
            <Sidebar active={active} onChange={setActive} />
          </div>

          <ScrollArea axis="x" hideScrollbar className="lg:hidden -mx-4 mb-1 flex px-4" aria-label={t("accountSettings.page.tabsAria")}>
            {NAV.map((n) => {
              const label = t(`accountSettings.page.nav.${n.id}`);
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
                  aria-current={isActive ? "true" : undefined}
                  aria-label={label}
                  title={label}
                  className={cn(
                    "mr-2 whitespace-nowrap rounded-lg px-3 py-1 text-sm",
                    isActive
                      ? "bg-[#BFA200] text-black shadow-lg"
                      : shouldShowHover
                      ? "bg-[#BFA200] text:black shadow-lg"
                      : "bg:black/20 text-white border border-white/20",
                    "cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/70",
                    "transition-all duration-200"
                  )}
                  animate={{ scale: baseScale }}
                  whileHover={{ scale: hoverScale }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                >
                  {label}
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
