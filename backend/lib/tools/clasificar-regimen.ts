/**
 * Tool determinística: clasifica el régimen tributario.
 * Lógica pura if/else — sin LLM. Los umbrales salen de lib/data/.
 */
import type { RegimenResultado } from "../types/resultado";
import type { ClasificarRegimenInput } from "../types/tools";
import {
  ACTIVIDADES_RTS,
  CAPITAL_MAXIMO_RTS,
  CAPITAL_MINIMO_RTS,
  CATEGORIAS_RTS,
  VENTAS_MAXIMAS_RTS,
} from "../data/categorias-simplificado";
import {
  ADVERTENCIA_DATOS_NO_VERIFICADOS,
  DATOS_VERIFICADOS,
  FUENTE_LEY_843_RTS_ART18,
  LINK_LEY_843,
} from "../data/verificacion";

export function clasificarRegimen(input: ClasificarRegimenInput): RegimenResultado {
  const advertencias: string[] = [];
  if (!DATOS_VERIFICADOS) advertencias.push(ADVERTENCIA_DATOS_NO_VERIFICADOS);

  const { actividad, capital, ventasAnuales } = input;

  if (capital < 0 || ventasAnuales < 0) {
    throw new Error("Capital y ventas anuales deben ser números positivos.");
  }

  // RAU: actividad agropecuaria
  if (actividad === "agropecuaria") {
    return {
      nombre: "RAU",
      justificacion:
        "Tu actividad es agropecuaria, por lo que te corresponde el Régimen Agropecuario Unificado (RAU), un régimen especial con pago anual simplificado.",
      fuente: {
        norma: "Ley 843 (Texto Ordenado) — RAU",
        articulo: "NO ENCONTRADO — detalle de cuotas RAU",
        link: LINK_LEY_843,
      },
      advertencias,
    };
  }

  // STI: transporte
  if (actividad === "transporte") {
    return {
      nombre: "STI",
      justificacion:
        "Tu actividad es el transporte, por lo que te corresponde el Sistema Tributario Integrado (STI), diseñado para transportistas.",
      fuente: {
        norma: "Ley 843 (Texto Ordenado) — STI",
        articulo: "NO ENCONTRADO — detalle de cuotas STI",
        link: LINK_LEY_843,
      },
      advertencias,
    };
  }

  const actividadAdmiteRTS = (ACTIVIDADES_RTS as readonly string[]).includes(actividad);

  // Art. 18: capital Bs1–12.000 quedan excluidos del RTS
  if (actividadAdmiteRTS && capital > 0 && capital < CAPITAL_MINIMO_RTS) {
    return {
      nombre: "General",
      justificacion: `Con un capital de Bs ${capital} (menor a Bs ${CAPITAL_MINIMO_RTS}), quedás excluido del Régimen Tributario Simplificado según el Art. 18 del D.S. N° 24484. Te corresponde el Régimen General u orientar tu caso en una oficina del SIN.`,
      fuente: FUENTE_LEY_843_RTS_ART18,
      advertencias,
    };
  }

  // Simplificado: actividad admitida + dentro de topes
  if (actividadAdmiteRTS && capital <= CAPITAL_MAXIMO_RTS && ventasAnuales <= VENTAS_MAXIMAS_RTS) {
    const cat = CATEGORIAS_RTS.find(
      (c) => capital >= c.capitalDesde && capital <= c.capitalHasta
    );

    if (!cat) {
      advertencias.push(
        `El capital (Bs ${capital}) no encaja en ninguna categoría de la tabla RTS (Art. 17). Revisar planillas/01-rts-categorias.csv.`
      );
      return {
        nombre: "General",
        justificacion:
          "Tu actividad podría encajar en el Simplificado, pero tu capital no coincide con ninguna categoría de la tabla oficial. Consultá en una oficina del SIN para confirmar tu régimen.",
        fuente: FUENTE_LEY_843_RTS_ART18,
        advertencias,
      };
    }

    return {
      nombre: "Simplificado",
      categoria: cat.categoria,
      justificacion: `Con un capital de Bs ${capital} y ventas anuales de Bs ${ventasAnuales}, tu actividad encaja en el Régimen Tributario Simplificado, categoría ${cat.categoria}, con una cuota fija bimestral.`,
      fuente: cat.fuente,
      advertencias,
    };
  }

  // Si la actividad podría ser RTS pero supera los topes, explicarlo
  if (actividadAdmiteRTS) {
    const motivo =
      capital > CAPITAL_MAXIMO_RTS
        ? `tu capital (Bs ${capital}) supera el tope del Simplificado (Bs ${CAPITAL_MAXIMO_RTS})`
        : `tus ventas anuales (Bs ${ventasAnuales}) superan el tope del Simplificado (Bs ${VENTAS_MAXIMAS_RTS})`;
    return {
      nombre: "General",
      justificacion: `Aunque tu actividad podría entrar en el Simplificado, ${motivo}, por lo que te corresponde el Régimen General (IVA, IT e IUE con facturación).`,
      fuente: FUENTE_LEY_843_RTS_ART18,
      advertencias,
    };
  }

  // Default: Régimen General (servicios, profesionales, clientes del exterior, etc.)
  return {
    nombre: "General",
    justificacion:
      "Tu actividad no está comprendida en los regímenes especiales (Simplificado, STI, RAU), por lo que te corresponde el Régimen General: emitís factura y declarás IVA, IT e IUE.",
    fuente: {
      norma: "Ley 843 (Texto Ordenado)",
      articulo: "Régimen General (títulos IVA, IT, IUE)",
      link: LINK_LEY_843,
    },
    advertencias,
  };
}
