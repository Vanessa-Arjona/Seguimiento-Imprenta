import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DemoNotice } from "@/components/DemoNotice";
import {
  loadOrders, loadStages, saveSatisfaction, stageLabel, isValidTokenFormat, formatDate, formatDateTime, nowLocal,
  type Order, type StageDef,
} from "@/lib/orders";

export const Route = createFileRoute("/e/$token")({
  head: () => ({
    meta: [
      { title: "Consulta del cliente · Seguimiento Imprenta" },
      { name: "description", content: "Consulte el estado de su encargo de impresión." },
      { property: "og:title", content: "Consulta del cliente · Seguimiento Imprenta" },
      { property: "og:description", content: "Consulta del estado de un encargo de impresión (demostración)." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Tracking,
});

const SCORES = [
  { v: 1, label: "Muy insatisfecho" },
  { v: 2, label: "Insatisfecho" },
  { v: 3, label: "Normal" },
  { v: 4, label: "Satisfecho" },
  { v: 5, label: "Muy satisfecho" },
];

function Tracking() {
  const { token } = Route.useParams();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [stages, setStages] = useState<StageDef[]>([]);
  useEffect(() => {
    setStages(loadStages());
    setOrder(isValidTokenFormat(token) ? loadOrders().find((o) => o.token === token) ?? null : null);
  }, [token]);

  if (order === undefined) return <div className="min-h-screen" />;
  if (order === null)
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-display text-xl font-bold">Enlace no válido</h1>
          <p className="mt-2 text-sm text-muted-foreground">Este enlace no corresponde a ningún encargo guardado en este navegador. Compruebe que lo ha copiado completo o pida a la imprenta un enlace nuevo.</p>
          <div className="mt-4 text-left"><DemoNotice /></div>
        </div>
      </div>
    );

  const idx = stages.findIndex((s) => s.id === order.stage);
  const closed = stages.length > 0 && idx === stages.length - 1;
  const pct = stages.length > 1 ? Math.max(0, idx) / (stages.length - 1) : 1;
  const today = nowLocal().slice(0, 10);
  const late = !closed && order.dueDate < today;
  const upcoming = stages.slice(idx + 1);
  const history = [...order.history].reverse();

  return (
    <div className="min-h-screen pb-10">
      <header className="bg-primary px-4 pb-16 pt-6 text-primary-foreground">
        <div className="mx-auto max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Seguimiento Imprenta · Consulta del cliente</p>
          <p className="mt-4 font-mono text-xs opacity-80">{order.code}</p>
          <h1 className="font-display text-2xl font-bold leading-tight">{order.company}</h1>
          <p className="mt-1 text-sm opacity-90">{order.product} · {order.quantity.toLocaleString("es-ES")} uds.</p>
        </div>
      </header>

      <main className="mx-auto -mt-10 max-w-xl space-y-4 px-4">
        <section className="rounded-xl border bg-card p-5 shadow-sm" aria-labelledby="estado">
          <p id="estado" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado actual</p>
          <p className="font-display mt-1 text-2xl font-bold">{stageLabel(stages, order.stage)}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Paso {Math.max(1, idx + 1)} de {stages.length}</p>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-muted p-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Entrega prevista</p>
              <p className="font-semibold">{formatDate(order.dueDate)}</p>
            </div>
            {late && <span className="shrink-0 rounded-full bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground">Con retraso</span>}
            {closed && <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">Cerrado</span>}
          </div>
        </section>

        <DemoNotice />
        {closed && <Satisfaction order={order} onSaved={setOrder} />}

        <section className="rounded-xl border bg-card p-5" aria-labelledby="timeline">
          <h2 id="timeline" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Línea de tiempo</h2>
          <ol className="mt-4">
            {upcoming.slice().reverse().map((s) => (
              <li key={s.id} className="relative flex gap-3 pb-5">
                <span className="absolute left-[7px] top-4 h-full w-0.5 bg-border" aria-hidden />
                <span className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-border bg-card" aria-hidden />
                <div className="min-w-0">
                  <p className="text-muted-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">Pendiente</p>
                </div>
              </li>
            ))}
            {history.map((h, i) => (
              <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
                {i < history.length - 1 && <span className="absolute left-[7px] top-4 h-full w-0.5 bg-primary/40" aria-hidden />}
                <span className={`relative mt-1 h-4 w-4 shrink-0 rounded-full bg-primary ${i === 0 ? "ring-4 ring-primary/20" : ""}`} aria-hidden />
                <div className="min-w-0">
                  <p className={i === 0 ? "font-semibold" : "font-medium"}>{stageLabel(stages, h.stage)}</p>
                  <p className="text-xs text-muted-foreground"><time dateTime={h.at}>{formatDateTime(h.at)}</time></p>
                  {h.note && <p className="mt-1 text-sm text-muted-foreground">{h.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-xl border bg-card p-5" aria-labelledby="contacto">
          <h2 id="contacto" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">¿Dudas sobre su encargo?</h2>
          <p className="mt-1 font-medium">{order.contact.name}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href={`tel:${order.contact.phone.replace(/[^\d+]/g, "")}`} className="flex min-h-11 flex-col items-center justify-center rounded-lg border px-2 py-2 text-center text-sm hover:bg-accent">
              <span className="font-medium">Llamar</span>
              <span className="text-xs text-muted-foreground">{order.contact.phone}</span>
            </a>
            <a href={`mailto:${order.contact.email}?subject=${encodeURIComponent(order.code)}`} className="flex min-h-11 min-w-0 flex-col items-center justify-center rounded-lg border px-2 py-2 text-center text-sm hover:bg-accent">
              <span className="font-medium">Escribir</span>
              <span className="w-full truncate text-xs text-muted-foreground">{order.contact.email}</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

function Satisfaction({ order, onSaved }: { order: Order; onSaved: (o: Order) => void }) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");

  if (order.satisfaction)
    return (
      <section className="rounded-xl border bg-card p-5 text-center">
        <p className="font-semibold">¡Gracias por su respuesta!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Su valoración: {SCORES.find((s) => s.v === order.satisfaction!.score)?.label}
        </p>
      </section>
    );

  if (!open)
    return (
      <section className="rounded-xl border bg-card p-5">
        <p className="font-semibold">Su encargo está cerrado</p>
        <p className="mt-1 text-sm text-muted-foreground">Nos ayudaría saber cómo ha sido su experiencia.</p>
        <button onClick={() => setOpen(true)} className="mt-3 min-h-11 w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:bg-primary/90">
          Responder pregunta de satisfacción
        </button>
      </section>
    );

  return (
    <section className="rounded-xl border bg-card p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!score) return;
          const o = saveSatisfaction(order.token, score, comment);
          if (o) onSaved(o);
        }}
      >
        <fieldset>
          <legend className="font-semibold">¿Qué grado de satisfacción tiene con este encargo?</legend>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {SCORES.map((s) => (
              <label key={s.v} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border text-lg font-bold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${score === s.v ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                <input type="radio" name="score" value={s.v} className="sr-only" checked={score === s.v} onChange={() => setScore(s.v)} aria-label={s.label} />
                {s.v}
              </label>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Muy insatisfecho</span><span>Muy satisfecho</span>
          </div>
        </fieldset>
        <label className="mt-4 block text-sm">
          Comentario (opcional)
          <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <button disabled={!score} className="mt-3 min-h-11 w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          Enviar respuesta
        </button>
      </form>
    </section>
  );
}
