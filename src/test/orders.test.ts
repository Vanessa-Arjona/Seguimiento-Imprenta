import { describe, expect, it } from "vitest";
import { applyChange, isValidTokenFormat, newToken, nextOrderCode, normalizeStages, stageLabelProblem, validateOrderForm, type Order } from "@/lib/orders";

const stages = [{ id: "a", label: "Recibido" }, { id: "b", label: "Entregado" }];
const base: Order = { token: newToken(), code: "ENC-1000", company: "X", product: "P", quantity: 1, dueDate: "2026-11-01", stage: "a", contact: { name: "n", phone: "1", email: "a@b.example" }, history: [], notices: [] };
const form = { company: "X", clientEmail: "", product: "P", quantity: 10, dueDate: "2026-11-01", contactName: "n", contactPhone: "1", contactEmail: "a@b.example" };

describe("orders", () => {
  it("tokens are 24 chars, random and valid", () => {
    const a = newToken(), b = newToken();
    expect(a).toHaveLength(24); expect(a).not.toBe(b); expect(isValidTokenFormat(a)).toBe(true);
  });
  it("rejects malformed tokens", () => {
    expect(isValidTokenFormat("../x")).toBe(false);
    expect(isValidTokenFormat("abc")).toBe(false);
  });
  it("status change records date, note and one simulated notice", () => {
    const o = applyChange(base, stages, { at: "2026-10-29T10:00:00", stage: "b", note: "ok" }, "http://h");
    expect(o.stage).toBe("b");
    expect(o.history.at(-1)).toEqual({ at: "2026-10-29T10:00:00", stage: "b", note: "ok" });
    expect(o.notices).toHaveLength(1);
    expect(o.notices![0]!.status).toBe("simulado");
    expect(o.notices![0]!.body).toContain(`/e/${base.token}`);
  });
  it("form validation", () => {
    expect(validateOrderForm(form)).toEqual([]);
    expect(validateOrderForm({ ...form, company: "  " })).toHaveLength(1);
    expect(validateOrderForm({ ...form, quantity: 0 })).toHaveLength(1);
    expect(validateOrderForm({ ...form, dueDate: "" })).toHaveLength(1);
    expect(validateOrderForm({ ...form, clientEmail: "malo" })).toHaveLength(1);
  });
  it("stage names must be unique and non-empty", () => {
    expect(stageLabelProblem(stages, " recibido ")).not.toBeNull();
    expect(stageLabelProblem(stages, "")).not.toBeNull();
    expect(stageLabelProblem(stages, "Recibido", "a")).toBeNull();
    expect(stageLabelProblem(stages, "Acabado")).toBeNull();
  });
  it("normalizes stored stages without losing order", () => {
    expect(normalizeStages([{ id: "a", label: "" }, { id: "a", label: "dup" }, { id: "b", label: "B" }, null])).toEqual([
      { id: "a", label: "Sin nombre", notice: undefined }, { id: "b", label: "B", notice: undefined },
    ]);
  });
  it("next code ignores malformed codes", () => {
    expect(nextOrderCode([{ ...base, code: "ENC-1044" }, { ...base, code: "raro" }])).toBe("ENC-1045");
    expect(nextOrderCode([])).toBe("ENC-1000");
  });
});
