/**
 * Contexto estructurado para el RAG: cuando la pregunta pide montos, cuotas,
 * topes, alícuotas o periodicidad, anteponemos la tabla verificada de
 * lib/data/ (que copia planillas/ con fuente oficial) al contexto del LLM.
 *
 * Así "¿cuánto paga el Simplificado?" recibe las cuotas Bs 47–350 citadas,
 * sin depender de que el retrieval encuentre el artículo exacto.
 */
import {
  CATEGORIAS_RTS,
  CAPITAL_MAXIMO_RTS,
  CAPITAL_MINIMO_RTS,
  VENTAS_MAXIMAS_RTS,
} from "../data/categorias-simplificado";
import {
  ADVERTENCIA_STI_ACTUALIZACION,
  CATEGORIAS_STI,
  CUOTA_STI_MAX,
  CUOTA_STI_MIN,
} from "../data/categorias-sti";
import {
  CUOTAS_RAU,
  FUENTE_CUOTAS_RAU,
  FUENTE_REGLAS_RAU,
} from "../data/cuotas-rau";
import { IMPUESTOS_GENERAL } from "../data/impuestos-general";
import { VENCIMIENTOS_POR_DIGITO, OBLIGACIONES } from "../data/calendario-vencimientos";

export type BloqueEstructurado = {
  /** Etiqueta de fuente para citar, p. ej. "Planilla RTS (D.S. 24484 Art. 17)" */
  fuente: string;
  texto: string;
};

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

const RE_MONTOS = /(cuant|monto|cuota|paga|pago|costo|cuesta|precio|alicuota|porcentaje|tarifa|descuent)/;
const RE_RTS = /(simplificad|rts|tiendit|tienda|minorista|artesan|vivander|negocio pequen)/;
const RE_STI = /(sti|sistema tributario integrado|taxi|taxista|vagoneta|minibus|micro|chofer|transport|flota|radio.?taxi)/;
const RE_RAU = /(rau|regimen agropecuario|agricol|pecuari|hectarea|predio rural)/;
const RE_GENERAL = /(general|iva|\bit\b|iue|valor agregado|transaccion|utilidad)/;
const RE_TOPES = /(tope|limite|maximo|capital|ventas anuales|me paso|supero|excedo)/;
const RE_PERIODICIDAD = /(cada cuanto|periodicidad|frecuencia|bimestral|mensual|anual|trimestral|cuando (se )?paga|cuando vence|vencimiento)/;
const RE_DIGITO = /(digito|nit termina|termina en)/;

function bloqueRTS(): BloqueEstructurado {
  const filas = CATEGORIAS_RTS.map(
    (c) =>
      `Categoría ${c.categoria}: capital Bs ${c.capitalDesde.toLocaleString("es-BO")}–${c.capitalHasta.toLocaleString("es-BO")} → cuota bimestral Bs ${c.cuotaBimestral}`,
  );
  const f = CATEGORIAS_RTS[0].fuente;
  return {
    fuente: `Planilla RTS (${f.norma}, ${f.articulo})`,
    texto: [
      "CATEGORÍAS Y CUOTAS DEL RÉGIMEN TRIBUTARIO SIMPLIFICADO (RTS) — datos verificados:",
      ...filas,
      `Se paga por bimestre vencido. Tope de ventas anuales: Bs ${VENTAS_MAXIMAS_RTS.toLocaleString("es-BO")}.`,
      `Capital menor a Bs ${CAPITAL_MINIMO_RTS.toLocaleString("es-BO")}: excluido del RTS. Capital mayor a Bs ${CAPITAL_MAXIMO_RTS.toLocaleString("es-BO")}: pasa al Régimen General.`,
      `Fuente: ${f.norma}, ${f.articulo} — ${f.link}`,
    ].join("\n"),
  };
}

function bloqueSTI(): BloqueEstructurado {
  const filas = CATEGORIAS_STI.map(
    (c) =>
      `Categoría ${c.categoria}: ingreso trimestral presunto Bs ${c.ingresoTrimestral.toLocaleString("es-BO")} → impuesto trimestral Bs ${c.impuestoTrimestral}`,
  );
  const f = CATEGORIAS_STI[0].fuente;
  return {
    fuente: `Planilla STI (${f.norma}, ${f.articulo})`,
    texto: [
      "CATEGORÍAS Y CUOTAS DEL SISTEMA TRIBUTARIO INTEGRADO (STI) — datos verificados:",
      ...filas,
      `Rango de cuotas: Bs ${CUOTA_STI_MIN}–${CUOTA_STI_MAX} trimestrales.`,
      "Mapa orientativo: taxis/vagonetas/minibuses y carga urbana → cat. 1 (capitales LP/CBBA/SC) o B (otros/El Alto/provincias); micros/buses e interprovincial → cat. 2 (capitales) o 1 (otros).",
      "Excluidos del STI (van al Régimen General): transporte interdepartamental/internacional (D.S. 28522) y flotas/radio taxis.",
      "Pago trimestral hasta el día 22 del mes siguiente al trimestre (abr/jul/oct/ene).",
      ADVERTENCIA_STI_ACTUALIZACION,
      `Fuente: ${f.norma}, ${f.articulo} — ${f.link}`,
    ].join("\n"),
  };
}

function bloqueRAU(): BloqueEstructurado {
  const filas = CUOTAS_RAU.map((c) => {
    const pecuaria =
      c.cuotaPecuaria == null ? "no aplicable" : `Bs ${c.cuotaPecuaria.toFixed(2)}/ha`;
    return `${c.zona} — ${c.subzona} — ${c.claseTierra}: agrícola Bs ${c.cuotaAgricola.toFixed(2)}/ha; pecuaria ${pecuaria}.`;
  });
  return {
    fuente: `Planilla RAU (${FUENTE_CUOTAS_RAU.norma})`,
    texto: [
      "CUOTAS FIJAS POR HECTÁREA DEL RAU — gestión 2024, vigentes desde el 1 de octubre de 2025:",
      ...filas,
      "Cálculo: superficie gravada en hectáreas × cuota de la zona y actividad.",
      "La pequeña propiedad puede ser no imponible, pero requiere Certificado de No Imponibilidad vigente. Si supera el máximo del Anexo I, corresponde el Régimen General.",
      "Pago anual general hasta el 31 de octubre; verificar prórrogas específicas.",
      `Fuente de cuotas: ${FUENTE_CUOTAS_RAU.norma}, ${FUENTE_CUOTAS_RAU.articulo} — ${FUENTE_CUOTAS_RAU.link}`,
      `Reglas y límites: ${FUENTE_REGLAS_RAU.norma}, ${FUENTE_REGLAS_RAU.articulo} — ${FUENTE_REGLAS_RAU.link}`,
    ].join("\n"),
  };
}

function bloqueGeneral(): BloqueEstructurado {
  const filas = IMPUESTOS_GENERAL.map(
    (i) =>
      `${i.sigla} (${i.impuesto}): ${(i.alicuota * 100).toFixed(0)}% ${i.periodicidad}, sobre ${i.baseCalculo}. Fuente: ${i.fuente.norma}, ${i.fuente.articulo}`,
  );
  return {
    fuente: "Planilla impuestos Régimen General (Ley 843)",
    texto: [
      "IMPUESTOS DEL RÉGIMEN GENERAL — datos verificados:",
      ...filas,
    ].join("\n"),
  };
}

function bloqueVencimientos(pregunta: string): BloqueEstructurado {
  const f = VENCIMIENTOS_POR_DIGITO[0].fuente;
  const digitoMatch = normalizar(pregunta).match(/termina en (\d)|digito (\d)/);
  const digito = digitoMatch ? Number(digitoMatch[1] ?? digitoMatch[2]) : null;

  const filas =
    digito != null
      ? VENCIMIENTOS_POR_DIGITO.filter((v) => v.ultimoDigitoNit === digito).map(
          (v) =>
            `NIT terminado en ${v.ultimoDigitoNit}: vence el día ${v.diaVencimiento} de cada mes (Régimen General, IVA/IT).`,
        )
      : VENCIMIENTOS_POR_DIGITO.map(
          (v) => `NIT terminado en ${v.ultimoDigitoNit}: día ${v.diaVencimiento}`,
        );

  const rts = OBLIGACIONES.find((o) => o.regimen === "Simplificado");
  const notaRts = rts
    ? `RTS: ${rts.concepto}, día ${rts.diaVencimientoFijo} de los meses ${rts.meses.join(", ")} (${rts.fuente.norma}, ${rts.fuente.articulo}).`
    : "";

  const sti = OBLIGACIONES.find((o) => o.regimen === "STI");
  const notaSti = sti
    ? `STI: ${sti.concepto}, día ${sti.diaVencimientoFijo} de los meses ${sti.meses.join(", ")} (${sti.fuente.norma}, ${sti.fuente.articulo}).`
    : "";
  const rau = OBLIGACIONES.find((o) => o.regimen === "RAU");
  const notaRau = rau
    ? `RAU: ${rau.concepto}, día ${rau.diaVencimientoFijo} de octubre (${rau.fuente.norma}, ${rau.fuente.articulo}).`
    : "";

  return {
    fuente: `Planilla vencimientos (${f.norma}, ${f.articulo})`,
    texto: [
      "CALENDARIO DE VENCIMIENTOS — datos verificados:",
      ...filas,
      notaRts,
      notaSti,
      notaRau,
      `Fuente: ${f.norma}, ${f.articulo}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

/**
 * Devuelve los bloques de datos verificados que aplican a la pregunta,
 * o [] si la pregunta no pide números/fechas (ahí alcanza el corpus).
 */
export function contextoEstructurado(pregunta: string): BloqueEstructurado[] {
  const q = normalizar(pregunta);
  const bloques: BloqueEstructurado[] = [];

  const pideNumeros = RE_MONTOS.test(q) || RE_TOPES.test(q) || RE_PERIODICIDAD.test(q);

  if (RE_RTS.test(q) && (pideNumeros || RE_TOPES.test(q))) {
    bloques.push(bloqueRTS());
  }
  if (RE_STI.test(q) && (pideNumeros || RE_PERIODICIDAD.test(q))) {
    bloques.push(bloqueSTI());
  }
  if (RE_RAU.test(q) && pideNumeros) {
    bloques.push(bloqueRAU());
  }
  // "impuestos"/"descuentan" a secas, sin régimen específico → tabla del General
  if (
    (RE_GENERAL.test(q) || /(impuesto|descuent|tribut)/.test(q)) &&
    pideNumeros &&
    !RE_RTS.test(q) &&
    !RE_STI.test(q) &&
    !RE_RAU.test(q)
  ) {
    bloques.push(bloqueGeneral());
  }
  if (RE_DIGITO.test(q) || (RE_PERIODICIDAD.test(q) && /venc/.test(q))) {
    bloques.push(bloqueVencimientos(pregunta));
  }

  return bloques;
}
