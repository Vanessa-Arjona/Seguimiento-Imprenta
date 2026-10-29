export type Stage = string;
export type StageDef = { id: string; label: string; notice?: string | undefined };
export type Notice = { at: string; stage: Stage; to: string; subject: string; body: string; status: "simulado" };

const DEFAULT_STAGES: StageDef[] = [
  { id: "recibido", label: "Recibido" },
  { id: "diseño", label: "Revisión de diseño" },
  { id: "impresión", label: "En impresión" },
  { id: "acabado", label: "Acabado" },
  { id: "listo", label: "Listo para entrega" },
  { id: "entregado", label: "Entregado" },
];
const STAGES_KEY = "imprenta-stages-v1";

export function loadStages(): StageDef[] {
  if (typeof window === "undefined") return DEFAULT_STAGES;
  const raw = localStorage.getItem(STAGES_KEY);
  if (raw) {
    try {
      const v = normalizeStages(JSON.parse(raw));
      if (v.length) return v;
    } catch { /* reset */ }
  }
  localStorage.setItem(STAGES_KEY, JSON.stringify(DEFAULT_STAGES));
  return DEFAULT_STAGES;
}

export function saveStages(s: StageDef[]) {
  localStorage.setItem(STAGES_KEY, JSON.stringify(s));
}

export function stageLabel(stages: StageDef[], id: string) {
  return stages.find((s) => s.id === id)?.label ?? id;
}

export function newStageId() {
  return "st-" + newToken().slice(0, 6);
}

export type Contact = { name: string; phone: string; email: string };
export type HistoryEntry = { at: string; stage: Stage; note?: string | undefined };

export type Order = {
  token: string;
  code: string;
  company: string;
  product: string;
  quantity: number;
  dueDate: string;
  stage: Stage;
  contact: Contact;
  history: HistoryEntry[];
  clientEmail?: string | undefined;
  notices?: Notice[] | undefined;
  satisfaction?: { score: number; comment?: string | undefined; at: string } | undefined;
};

const KEY = "imprenta-orders-v2";

export const DEFAULT_CONTACT: Contact = {
  name: "Contacto de demostración (ficticio)",
  phone: "+598 0000 0000 (ficticio)",
  email: "encargos@imprenta.example",
};

function seed(): Order[] {
  return [
    {
      token: "a7k2m9xq4p", code: "ENC-1042", clientEmail: "pedidos@cafe-demo.example", company: "Café Demo (ficticio)", product: "Tarjetas de visita 350 g mate, laminado soft-touch", quantity: 1000, dueDate: "2026-11-04", stage: "impresión", contact: DEFAULT_CONTACT,
      history: [
        { at: "2026-10-26T09:12:00", stage: "recibido", note: "Archivos recibidos en PDF/X-4." },
        { at: "2026-10-27T11:40:00", stage: "diseño", note: "Ajustado sangrado a 3 mm." },
        { at: "2026-10-29T08:30:00", stage: "impresión", note: "Pruebas de color aprobadas por el cliente." },
      ],
    },
    {
      token: "r3t8w1zn6c", code: "ENC-1043", clientEmail: "marketing@clinica-demo.example", company: "Clínica Demo (ficticia)", product: "Folletos A5 a doble cara, estucado brillo 135 g", quantity: 2500, dueDate: "2026-11-06", stage: "diseño",
      contact: { name: "Producción · demostración (ficticio)", phone: "+598 0000 0001 (ficticio)", email: "produccion@imprenta.example" },
      history: [
        { at: "2026-10-28T10:05:00", stage: "recibido" },
        { at: "2026-10-28T16:20:00", stage: "diseño", note: "Prueba digital enviada; pendiente de aprobación." },
      ],
    },
    {
      token: "h5v0b2ly8s", code: "ENC-1044", clientEmail: "compras@logistica-demo.example", company: "Logística Demo (ficticia)", product: "Lona publicitaria 300×100 cm con ollaos", quantity: 2, dueDate: "2026-10-30", stage: "listo", contact: DEFAULT_CONTACT,
      history: [
        { at: "2026-10-22T12:00:00", stage: "recibido" },
        { at: "2026-10-23T09:45:00", stage: "diseño" },
        { at: "2026-10-24T15:10:00", stage: "impresión" },
        { at: "2026-10-27T13:30:00", stage: "acabado", note: "Colocación de ollaos cada 50 cm." },
        { at: "2026-10-28T17:00:00", stage: "listo", note: "Recogida en taller de 9:00 a 18:00." },
      ],
    },
    {
      token: "m8q4d6tf2w", code: "ENC-1041", clientEmail: "administracion@bodega-demo.example", company: "Bodega Demo (ficticia)", product: "Etiquetas adhesivas troqueladas para botella", quantity: 5000, dueDate: "2026-10-24", stage: "entregado", contact: DEFAULT_CONTACT,
      history: [
        { at: "2026-10-14T09:00:00", stage: "recibido" },
        { at: "2026-10-15T10:30:00", stage: "diseño" },
        { at: "2026-10-17T08:15:00", stage: "impresión" },
        { at: "2026-10-21T12:00:00", stage: "acabado" },
        { at: "2026-10-22T16:45:00", stage: "listo" },
        { at: "2026-10-23T11:20:00", stage: "entregado", note: "Entregado por mensajería, remito de ejemplo." },
      ],
    },
  ];
}

export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      const list = JSON.parse(raw) as Order[];
      // Replace any short/legacy link identifiers with strong random ones.
      if (list.some((o) => o.token.length < TOKEN_LENGTH)) {
        const fixed = list.map((o) => (o.token.length < TOKEN_LENGTH ? { ...o, token: newToken() } : o));
        localStorage.setItem(KEY, JSON.stringify(fixed));
        return fixed;
      }
      return list;
    } catch { /* reseed */ }
  }
  // Demo rows get fresh random identifiers so no link is fixed in the source code.
  const st = loadStages();
  const origin = window.location.origin;
  const s = seed().map((o) => {
    const x = { ...o, token: newToken() };
    return { ...x, notices: x.history.map((h) => buildNotice(x, st, h, origin)) };
  });
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function saveOrders(o: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(o));
}

// 32-symbol alphabet × 24 chars = 120 random bits; no modulo bias (256 % 32 === 0).
const TOKEN_ALPHABET = "abcdefghjkmnpqrstuvwxyz234567890";
export const TOKEN_LENGTH = 24;
export function newToken() {
  const a = crypto.getRandomValues(new Uint8Array(TOKEN_LENGTH));
  return Array.from(a, (n) => TOKEN_ALPHABET[n % 32]).join("");
}

export function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 19);
}

export function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(d: string) {
  return new Date(d).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function saveSatisfaction(token: string, score: number, comment: string) {
  const list = loadOrders();
  const next = list.map((o) =>
    o.token === token ? { ...o, satisfaction: { score, comment: comment.trim() || undefined, at: nowLocal() } } : o,
  );
  saveOrders(next);
  return next.find((o) => o.token === token) ?? null;
}

export const DEFAULT_NOTICE = "Hola, su encargo {codigo} ({producto}) ha pasado al estado «{estado}». Entrega prevista: {entrega}.";

export function buildNotice(o: Order, stages: StageDef[], entry: HistoryEntry, origin: string): Notice {
  const label = stageLabel(stages, entry.stage);
  const tpl = stages.find((s) => s.id === entry.stage)?.notice?.trim() || DEFAULT_NOTICE;
  const text = tpl
    .replaceAll("{codigo}", o.code)
    .replaceAll("{empresa}", o.company)
    .replaceAll("{producto}", o.product)
    .replaceAll("{estado}", label)
    .replaceAll("{entrega}", formatDate(o.dueDate));
  const body = [
    text,
    entry.note ? `Nota: ${entry.note}` : "",
    `Consulte el seguimiento: ${origin}/e/${o.token}`,
    `${o.contact.name} · ${o.contact.phone} · ${o.contact.email}`,
  ].filter(Boolean).join("\n\n");
  return { at: entry.at, stage: entry.stage, to: o.clientEmail || o.company, subject: `${o.code}: ${label}`, body, status: "simulado" };
}

/** Appends a history entry and its simulated notice. */
export function applyChange(o: Order, stages: StageDef[], entry: HistoryEntry, origin: string): Order {
  const withEntry = { ...o, stage: entry.stage, history: [...o.history, entry] };
  return { ...withEntry, notices: [...(o.notices ?? []), buildNotice(withEntry, stages, entry, origin)] };
}

/** Repairs stored stage lists: drops invalid entries and duplicate ids, never leaves an empty name. */
export function normalizeStages(v: unknown): StageDef[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: StageDef[] = [];
  for (const x of v) {
    if (!x || typeof x.id !== "string" || !x.id || seen.has(x.id)) continue;
    seen.add(x.id);
    const label = typeof x.label === "string" && x.label.trim() ? x.label.trim() : "Sin nombre";
    out.push({ id: x.id, label, notice: typeof x.notice === "string" ? x.notice : undefined });
  }
  return out;
}

/** True when a stage name is empty or already used by another stage (case-insensitive). */
export function stageLabelProblem(stages: StageDef[], label: string, ownId?: string): string | null {
  const l = label.trim();
  if (!l) return "El nombre no puede estar vacío.";
  if (stages.some((s) => s.id !== ownId && s.label.trim().toLowerCase() === l.toLowerCase())) return "Ya existe un estado con ese nombre.";
  return null;
}

export const TOKEN_PATTERN = /^[a-z0-9]{10,64}$/;
export function isValidTokenFormat(t: string) {
  return TOKEN_PATTERN.test(t);
}

export type OrderForm = { company: string; clientEmail: string; product: string; quantity: number; dueDate: string; contactName: string; contactPhone: string; contactEmail: string };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Returns a list of human-readable problems; empty when the form can be saved. */
export function validateOrderForm(f: OrderForm): string[] {
  const e: string[] = [];
  if (!f.company.trim()) e.push("Indique la empresa cliente.");
  if (!f.product.trim()) e.push("Indique el producto.");
  if (!Number.isInteger(f.quantity) || f.quantity < 1) e.push("La cantidad debe ser un número entero mayor que 0.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dueDate) || Number.isNaN(new Date(f.dueDate + "T00:00:00").getTime())) e.push("Indique una fecha prevista de entrega válida.");
  if (f.clientEmail.trim() && !EMAIL.test(f.clientEmail.trim())) e.push("El correo del cliente no es válido.");
  if (!f.contactName.trim() || !f.contactPhone.trim()) e.push("Complete el contacto de la imprenta.");
  if (!EMAIL.test(f.contactEmail.trim())) e.push("El correo de la imprenta no es válido.");
  return e;
}

export function nextOrderCode(orders: Order[]) {
  const nums = orders.map((o) => Number(o.code.split("-")[1])).filter((n) => Number.isFinite(n));
  return `ENC-${nums.length ? Math.max(...nums) + 1 : 1000}`;
}
