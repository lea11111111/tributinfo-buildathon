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
  FUENTE_MAPA_STI,
  resolverCategoriaSTI,
  TIPOS_TRANSPORTE_EXCLUIDOS_STI,
} from "../data/categorias-sti";
import {
  buscarCuotaRau,
  FUENTE_REGLAS_RAU,
  limitesRau,
} from "../data/cuotas-rau";
import {
  ADVERTENCIA_DATOS_NO_VERIFICADOS,
  DATOS_VERIFICADOS,
  FUENTE_LEY_843_RTS_ART18,
  FUENTE_LEY_843_STI_ART3_4,
  FUENTE_LEY_843_STI_EXCLUSION,
  LINK_LEY_843,
} from "../data/verificacion";

export function clasificarRegimen(input: ClasificarRegimenInput): RegimenResultado {
  const advertencias: string[] = [];
  if (!DATOS_VERIFICADOS) advertencias.push(ADVERTENCIA_DATOS_NO_VERIFICADOS);

  const {
    actividad,
    capital,
    ventasAnuales,
    tipoTransporte,
    ubicacionSti,
    actividadRau,
    hectareasRau,
    zonaRau,
  } = input;

  if (capital < 0 || ventasAnuales < 0) {
    throw new Error("Capital y ventas anuales deben ser números positivos.");
  }

  // RAU: actividad agropecuaria
  if (actividad === "agropecuaria") {
    const cuota = buscarCuotaRau(zonaRau);
    if (actividadRau && hectareasRau != null && cuota) {
      const { minimo, maximo } = limitesRau(cuota, actividadRau);

      if (maximo != null && hectareasRau > maximo) {
        return {
          nombre: "General",
          justificacion: `Tu propiedad tiene ${hectareasRau} ha y supera el máximo de ${maximo} ha previsto para esta zona y actividad dentro del RAU. Según el Art. 8 del D.S. Nº 24463, corresponde el Régimen General.`,
          fuente: FUENTE_REGLAS_RAU,
          advertencias,
        };
      }

      if (minimo != null && hectareasRau <= minimo) {
        advertencias.push(
          `La superficie declarada (${hectareasRau} ha) está dentro del máximo no imponible de ${minimo} ha para esta zona. Debés tramitar y mantener vigente el Certificado de No Imponibilidad RAU.`,
        );
      }
    }

    return {
      nombre: "RAU",
      justificacion:
        "Por tu actividad agropecuaria y la superficie declarada, tu perfil puede corresponder al Régimen Agropecuario Unificado (RAU), que reúne IVA, IT, IUE y RC-IVA en un pago anual simplificado.",
      fuente: FUENTE_REGLAS_RAU,
      advertencias,
    };
  }

  // Transporte: STI o General según exclusiones
  if (actividad === "transporte") {
    if (tipoTransporte && (TIPOS_TRANSPORTE_EXCLUIDOS_STI as readonly string[]).includes(tipoTransporte)) {
      const motivo =
        tipoTransporte === "flota_radio_taxi"
          ? "las flotas y radio taxis están excluidas del STI"
          : "el transporte interdepartamental e internacional está excluido del STI (D.S. N° 28522)";
      return {
        nombre: "General",
        justificacion: `Tu actividad es transporte, pero ${motivo}, por lo que te corresponde el Régimen General (IVA, IT e IUE con facturación).`,
        fuente: FUENTE_LEY_843_STI_EXCLUSION,
        advertencias,
      };
    }

    if (tipoTransporte && ubicacionSti) {
      const cat = resolverCategoriaSTI(tipoTransporte, ubicacionSti);
      if (cat) {
        return {
          nombre: "STI",
          categoriaSti: cat,
          justificacion: `Tu actividad es el transporte público, por lo que te corresponde el Sistema Tributario Integrado (STI), categoría ${cat}, con cuota fija trimestral según el D.S. N° 23027.`,
          fuente: FUENTE_MAPA_STI,
          advertencias,
        };
      }
    }

    return {
      nombre: "STI",
      justificacion:
        "Tu actividad es el transporte, por lo que te corresponde el Sistema Tributario Integrado (STI), diseñado para transportistas. La cuota exacta depende del tipo de vehículo y la ubicación (categorías B, 1 o 2).",
      fuente: FUENTE_LEY_843_STI_ART3_4,
      advertencias: [
        ...advertencias,
        ...(tipoTransporte && !ubicacionSti
          ? ["Falta la ubicación para fijar la categoría STI."]
          : !tipoTransporte
            ? ["Indicá el tipo de servicio y la ubicación para fijar la categoría STI."]
            : []),
      ],
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
