import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DemoNotice } from "@/components/DemoNotice";
import {
  loadOrders, saveOrders, newToken, nowLocal, formatDate, formatDateTime,
  loadStages, saveStages, applyChange, validateOrderForm, nextOrderCode, stageLabelProblem, DEFAULT_NOTICE, stageLabel, newStageId, DEFAULT_CONTACT, type Order, type Stage, type StageDef,
} from "@/lib/orders";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Panel de la imprenta · Seguimiento Imprenta" },
      { name: "description", content: "Gestión de encargos de impresión: estados, entregas, historial y enlaces privados para clientes." },
      { property: "og:title", content: "Panel de la imprenta · Seguimiento Imprenta" },
      { property: "og:description", content: "Gestión de encargos, historial fechado y enlaces privados de seguimiento." },
    ],
  }),
  component: Index,
});

const input = "w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

const emptyForm = {
  company: "", clientEmail: "", product: "", quantity: 100, dueDate: "", note: "",
  contactName: DEFAULT_CONTACT.name, contactPhone: DEFAULT_CONTACT.phone, contactEmail: DEFAULT_CONTACT.email,
};

function Index() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Stage | "todos">("todos");
  const [stages, setStagesState] = useState<StageDef[]>([]);
  const [tab, setTab] = useState<"encargos" | "estados">("encargos");

  useEffect(() => { setOrders(loadOrders()); setStagesState(loadStages()); }, []);
  const setStages = (s: StageDef[]) => { setStagesState(s); saveStages(s); };
  const update = (o: Order[]) => { setOrders(o); saveOrders(o); };

  const [errors, setErrors] = useState<string[]>([]);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const problems = validateOrderForm(form);
    setErrors(problems);
    if (problems.length) return;
    const order: Order = {
      token: newToken(), code: nextOrderCode(orders), company: form.company.trim(), clientEmail: form.clientEmail.trim() || undefined, product: form.product.trim(),
      quantity: form.quantity, dueDate: form.dueDate, stage: stages[0]?.id ?? "recibido",
      contact: { name: form.contactName.trim(), phone: form.contactPhone.trim(), email: form.contactEmail.trim() },
      history: [], notices: [],
    };
    const created = applyChange(order, stages, { at: nowLocal(), stage: order.stage, note: form.note.trim() || undefined }, window.location.origin);
    update([created, ...orders]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const changeOrder = (o: Order) => update(orders.map((x) => (x.token === o.token ? o : x)));
  const list = orders
    .filter((o) => filter === "todos" || o.stage === filter)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-3 px-4 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Seguimiento Imprenta</p>
            <h1 className="font-display text-2xl font-bold">Panel de la imprenta</h1>
            <p className="text-sm text-muted-foreground">Gestión de encargos de una imprenta digital.</p>
          </div>
          <div className="flex gap-2">
          <div className="flex rounded-md border text-sm">
            {(["encargos", "estados"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 ${tab === t ? "bg-secondary font-medium" : "hover:bg-accent"}`}>
                {t === "encargos" ? "Encargos" : "Estados"}
              </button>
            ))}
          </div>
          {tab === "encargos" && <button onClick={() => setShowForm((v) => !v)} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            {showForm ? "Cerrar" : "+ Nuevo encargo"}
          </button>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <DemoNotice />
        {tab === "estados" && <StagesConfig stages={stages} orders={orders} onChange={setStages} />}
        {tab === "encargos" && <>
        {showForm && (
          <form onSubmit={add} noValidate className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2">
            <h2 className="font-semibold sm:col-span-2">Nuevo encargo</h2>
            <label className="text-sm">Empresa cliente<input required className={input} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></label>
            <label className="text-sm">Correo del cliente (para avisos)<input type="email" className={input} value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} /></label>
            <label className="text-sm">Producto<input required className={input} value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} /></label>
            <label className="text-sm">Cantidad<input required type="number" min={1} className={input} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value === "" ? 0 : Number(e.target.value) })} /></label>
            <label className="text-sm">Fecha prevista de entrega<input required type="date" className={input} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
            <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">Contacto de la imprenta</p>
            <label className="text-sm sm:col-span-2">Persona responsable<input required className={input} value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></label>
            <label className="text-sm">Teléfono<input required type="tel" className={input} value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></label>
            <label className="text-sm">Correo<input required type="email" className={input} value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></label>
            <label className="text-sm sm:col-span-2">Nota (opcional)<textarea rows={2} className={input} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
            {errors.length > 0 && (
              <ul role="alert" className="list-disc rounded-md border border-destructive px-6 py-2 text-sm text-destructive sm:col-span-2">
                {errors.map((x) => <li key={x}>{x}</li>)}
              </ul>
            )}
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:col-span-2">Crear encargo</button>
          </form>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 text-sm">
          {["todos", ...stages.map((x) => x.id)].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full border px-3 py-1 ${filter === s ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}>
              {s === "todos" ? `Todos (${orders.length})` : `${stageLabel(stages, s)} (${orders.filter((o) => o.stage === s).length})`}
            </button>
          ))}
        </div>

        <section className="space-y-3">
          {list.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No hay encargos en este estado.</p>}
          {list.map((o) => <OrderCard key={o.token} order={o} stages={stages} onChange={changeOrder} />)}
        </section>
        </>}
      </main>
    </div>
  );
}

function OrderCard({ order: o, stages, onChange }: { order: Order; stages: StageDef[]; onChange: (o: Order) => void }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>(o.stage);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState<"" | "ok" | "error">("");
  const [view, setView] = useState<"historial" | "avisos">("historial");
  const late = o.stage !== stages[stages.length - 1]?.id && o.dueDate < nowLocal().slice(0, 10);

  const save = () => {
    if (stage === o.stage && !note.trim()) return;
    onChange(applyChange(o, stages, { at: nowLocal(), stage, note: note.trim() || undefined }, window.location.origin));
    setNote("");
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(`${window.location.origin}/e/${o.token}`);
      setCopied("ok");
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("error");
    }
  };

  return (
    <article className="rounded-lg border bg-card">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{o.code}</p>
          <h3 className="font-semibold">{o.company}</h3>
          <p className="text-sm text-muted-foreground">{o.product} · {o.quantity.toLocaleString("es-ES")} uds.</p>
        </div>
        <div className="text-right text-sm">
          <span className="inline-block rounded-full bg-secondary px-2.5 py-0.5 font-medium">{stageLabel(stages, o.stage)}</span>
          <p className={`mt-1 ${late ? "font-medium text-destructive" : "text-muted-foreground"}`}>
            Entrega: {formatDate(o.dueDate)}{late ? " · con retraso" : ""}
          </p>
        </div>
      </button>

      {open && (
        <div className="grid gap-4 border-t p-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actualizar estado</p>
              <select className={input} value={stage} aria-label="Estado" onChange={(e) => setStage(e.target.value as Stage)}>
                {stages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                {!stages.some((s) => s.id === o.stage) && <option value={o.stage}>{o.stage}</option>}
              </select>
              <textarea rows={2} className={input} placeholder="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
              <p className="text-xs text-muted-foreground">Al guardar se genera un aviso automático para {o.clientEmail || o.company} (simulado: no se envía ningún correo).</p>
              <button onClick={save} disabled={stage === o.stage && !note.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                Guardar
              </button>
            </div>
            <div className="text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contacto de la imprenta</p>
              <p className="mt-1">{o.contact.name}</p>
              <p><a className="text-primary hover:underline" href={`tel:${o.contact.phone.replace(/[^\d+]/g, "")}`}>{o.contact.phone}</a></p>
              <p><a className="text-primary hover:underline" href={`mailto:${o.contact.email}`}>{o.contact.email}</a></p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Enlace de consulta del cliente</p>
            <p className="break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">/e/{o.token}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              <button onClick={copy} className="rounded-md border px-3 py-1.5 hover:bg-accent">{copied === "ok" ? "¡Copiado!" : "Copiar enlace privado"}</button>
              <Link to="/e/$token" params={{ token: o.token }} className="rounded-md border px-3 py-1.5 hover:bg-accent">Ver como cliente</Link>
            </div>
            <p role="status" className="text-xs">
              {copied === "error" && <span className="text-destructive">No se pudo copiar (permiso denegado o navegador no compatible). Seleccione el enlace y cópielo manualmente: {window.location.origin}/e/{o.token}</span>}
            </p>
          </div>
          <div>
            <div className="mb-3 flex rounded-md border text-sm" role="tablist">
              {(["historial", "avisos"] as const).map((t) => (
                <button key={t} role="tab" aria-selected={view === t} onClick={() => setView(t)} className={`flex-1 px-3 py-1.5 ${view === t ? "bg-secondary font-medium" : "hover:bg-accent"}`}>
                  {t === "historial" ? "Historial" : `Avisos (${o.notices?.length ?? 0})`}
                </button>
              ))}
            </div>
            {view === "historial" ? <History order={o} stages={stages} /> : <Notices order={o} />}
          </div>
        </div>
      )}
    </article>
  );
}

function History({ order, stages }: { order: Order; stages: StageDef[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Historial</p>
      <ol className="mt-2 space-y-3 border-l-2 border-border pl-4">
        {[...order.history].reverse().map((h, i) => (
          <li key={i} className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
            <p className="text-xs text-muted-foreground">{formatDateTime(h.at)}</p>
            <p className="font-medium">{stageLabel(stages, h.stage)}</p>
            {h.note && <p className="text-muted-foreground">{h.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function StagesConfig({ stages, orders, onChange }: { stages: StageDef[]; orders: Order[]; onChange: (s: StageDef[]) => void }) {
  const [label, setLabel] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const p = stageLabelProblem(stages, label);
    setErr(p);
    if (p) return;
    onChange([...stages, { id: newStageId(), label: label.trim() }]);
    setLabel("");
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= stages.length) return;
    const n = [...stages];
    [n[i], n[j]] = [n[j]!, n[i]!];
    onChange(n);
  };
  return (
    <section className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <h2 className="font-semibold">Estados de los encargos</h2>
        <p className="text-sm text-muted-foreground">El orden define el progreso que ve el cliente. El primero se asigna a los encargos nuevos y el último se considera entregado.</p>
        <p className="mt-1 text-sm text-muted-foreground">Cada estado puede tener su texto de aviso. Variables: {"{codigo}"}, {"{empresa}"}, {"{producto}"}, {"{estado}"}, {"{entrega}"}. Si se deja vacío se usa el texto por defecto.</p>
      </div>
      <ol className="space-y-2">
        {stages.map((s, i) => (
          <li key={s.id} className="rounded-md border p-2">
            <div className="flex items-center gap-2">
            <span className="w-6 text-center text-sm text-muted-foreground">{i + 1}</span>
            <input className={input} aria-label={`Nombre del estado ${i + 1}`} value={s.label}
              onChange={(e) => onChange(stages.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))}
              onBlur={(e) => {
                const v = e.target.value.trim();
                const fixed = !v ? "Sin nombre" : stageLabelProblem(stages, v, s.id) ? `${v} (${i + 1})` : v;
                if (fixed !== e.target.value) onChange(stages.map((x) => (x.id === s.id ? { ...x, label: fixed } : x)));
              }} />
            <span className="hidden w-20 shrink-0 text-xs text-muted-foreground sm:block">{orders.filter((o) => o.stage === s.id).length} encargos</span>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${s.label}`} className="rounded-md border px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-40">↑</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === stages.length - 1} aria-label={`Bajar ${s.label}`} className="rounded-md border px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-40">↓</button>
            </div>
            <textarea rows={2} className={`${input} mt-1 text-xs`} aria-label={`Aviso automático para ${s.label}`} placeholder={`Aviso automático: ${DEFAULT_NOTICE}`}
              value={s.notice ?? ""} onChange={(e) => onChange(stages.map((x) => (x.id === s.id ? { ...x, notice: e.target.value } : x)))} />
          </li>
        ))}
      </ol>
      <form onSubmit={add} noValidate className="flex gap-2">
        <input className={input} aria-label="Nombre del nuevo estado" placeholder="Nuevo estado, p. ej. «Control de calidad»" value={label} onChange={(e) => { setLabel(e.target.value); setErr(null); }} />
        <button className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Añadir</button>
      </form>
      {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
    </section>
  );
}

function Notices({ order }: { order: Order }) {
  const list = [...(order.notices ?? [])].reverse();
  if (!list.length) return <p className="text-sm text-muted-foreground">Sin avisos todavía.</p>;
  return (
    <ul className="space-y-2">
      {list.map((n, i) => (
        <li key={i} className="rounded-md border p-3 text-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <p className="min-w-0 font-medium">{n.subject}</p>
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs">Simulado · no enviado</span>
          </div>
          <p className="text-xs text-muted-foreground">{formatDateTime(n.at)} · Para: <span className="break-all">{n.to}</span></p>
          <details className="mt-1">
            <summary className="cursor-pointer text-xs text-primary">Ver mensaje</summary>
            <p className="mt-2 whitespace-pre-line break-words text-xs text-muted-foreground">{n.body}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
