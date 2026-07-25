/**
 * Tool determinística: clasifica el régimen tributario.
 * Lógica pura if/else — sin LLM. Los umbrales salen de lib/data/.
 */
import type { RegimenResultado } from "../types/resultado";
import type { ClasificarRegimenInput } from "../types/tools";
import {
  ACTIVIDADES_RTS,
  CAPITAL_MAXIMO_RTS,
  CATEGORIAS_RTS,
  VENTAS_MAXIMAS_RTS,
} from "../data/categorias-simplificado";
import { ADVERTENCIA_DATOS_NO_VERIFICADOS, DATOS_VERIFICADOS, FUENTE_PENDIENTE } from "../data/verificacion";

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
      fuente: FUENTE_PENDIENTE, // TODO_FERNANDA: norma del RAU
      advertencias,
    };
  }

  // STI: transporte
  if (actividad === "transporte") {
    return {
      nombre: "STI",
      justificacion:
        "Tu actividad es el transporte, por lo que te corresponde el Sistema Tributario Integrado (STI), diseñado para transportistas.",
      fuente: FUENTE_PENDIENTE, // TODO_FERNANDA: norma del STI
      advertencias,
    };
  }

  // Simplificado: actividad admitida + dentro de topes
  const actividadAdmiteRTS = (ACTIVIDADES_RTS as readonly string[]).includes(actividad);

  if (actividadAdmiteRTS && capital <= CAPITAL_MAXIMO_RTS && ventasAnuales <= VENTAS_MAXIMAS_RTS) {
    const cat = CATEGORIAS_RTS.find(
      (c) => capital >= c.capitalDesde && capital <= c.capitalHasta
    );

    if (!cat) {
      // Capital por debajo del mínimo de la primera categoría u otro hueco en la tabla
      advertencias.push(
        `El capital (Bs ${capital}) no encaja en ninguna categoría de la tabla RTS. Revisar la planilla 1 con Fernanda.`
      );
      return {
        nombre: "Simplificado",
        categoria: CATEGORIAS_RTS[0].categoria,
        justificacion:
          "Tu actividad y nivel de ventas encajan en el Régimen Simplificado, pero tu capital no coincide con ninguna categoría de la tabla. Consultá en una oficina del SIN para confirmar tu categoría.",
        fuente: CATEGORIAS_RTS[0].fuente,
        advertencias,
      };
    }

    // Caso borde: justo en el límite superior de la categoría
    if (capital === cat.capitalHasta) {
      advertencias.push(
        `Caso borde: el capital está exactamente en el tope de la categoría ${cat.categoria} (Bs ${cat.capitalHasta}). TODO_FERNANDA: confirmar si el tope es inclusivo según la norma.`
      );
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
      fuente: FUENTE_PENDIENTE, // TODO_FERNANDA: artículo que define los topes
      advertencias,
    };
  }

  // Default: Régimen General (servicios, profesionales, clientes del exterior, etc.)
  return {
    nombre: "General",
    justificacion:
      "Tu actividad no está comprendida en los regímenes especiales (Simplificado, STI, RAU), por lo que te corresponde el Régimen General: emitís factura y declarás IVA, IT e IUE.",
    fuente: FUENTE_PENDIENTE, // TODO_FERNANDA: artículo del Régimen General / exclusiones RTS
    advertencias,
  };
}
