/**
 * Tool determinística: calcula impuestos estimados según el régimen.
 * Aritmética pura — sin LLM. Alícuotas y cuotas salen de lib/data/.
 */
import type { CalculoResultado, LineaImpuesto } from "../types/resultado";
import type { CalcularImpuestosInput } from "../types/tools";
import {
  ADVERTENCIA_STI_ACTUALIZACION,
  CATEGORIAS_STI,
  CUOTA_STI_MAX,
  CUOTA_STI_MIN,
  cuotaSTI,
} from "../data/categorias-sti";
import { CATEGORIAS_RTS } from "../data/categorias-simplificado";
import { IMPUESTOS_GENERAL } from "../data/impuestos-general";
import {
  buscarCuotaRau,
  FUENTE_CUOTAS_RAU,
  FUENTE_REGLAS_RAU,
  limitesRau,
} from "../data/cuotas-rau";
import {
  ADVERTENCIA_DATOS_NO_VERIFICADOS,
  DATOS_VERIFICADOS,
  FUENTE_LEY_843_STI_ART4,
} from "../data/verificacion";

export function calcularImpuestos(input: CalcularImpuestosInput): CalculoResultado {
  const advertencias: string[] = [];
  if (!DATOS_VERIFICADOS) advertencias.push(ADVERTENCIA_DATOS_NO_VERIFICADOS);

  const {
    regimen,
    ventasMensuales,
    categoria,
    categoriaSti,
    actividadRau,
    hectareasRau,
    zonaRau,
    certificadoNoImponibilidadRau,
  } = input;

  if (ventasMensuales < 0) {
    throw new Error("Las ventas mensuales deben ser un número positivo.");
  }

  if (regimen === "Simplificado") {
    if (categoria === undefined) {
      throw new Error("Para el Simplificado se necesita la categoría (usar primero clasificar_regimen).");
    }
    const cat = CATEGORIAS_RTS.find((c) => c.categoria === categoria);
    if (!cat) {
      throw new Error(`Categoría ${categoria} no existe en la tabla RTS.`);
    }
    const linea: LineaImpuesto = {
      impuesto: "Cuota fija del Régimen Simplificado",
      sigla: "RTS",
      monto: cat.cuotaBimestral,
      periodicidad: "bimestral",
      detalle: `Cuota fija de la categoría ${cat.categoria}: Bs ${cat.cuotaBimestral} cada dos meses. No requiere calcular sobre ventas.`,
      fuente: cat.fuente,
    };
    return {
      lineas: [linea],
      totalMensualEstimado: redondear(cat.cuotaBimestral / 2),
      advertencias,
    };
  }

  if (regimen === "General") {
    const lineas: LineaImpuesto[] = IMPUESTOS_GENERAL.map((imp) => {
      const base = imp.periodicidad === "anual" ? ventasMensuales * 12 : ventasMensuales;
      const monto = redondear(base * imp.alicuota);
      return {
        impuesto: imp.impuesto,
        sigla: imp.sigla,
        monto,
        periodicidad: imp.periodicidad,
        detalle: `${(imp.alicuota * 100).toFixed(1)}% sobre ${imp.baseCalculo} (Bs ${base})`,
        fuente: imp.fuente,
      };
    });

    advertencias.push(
      "Estimación simplificada: el IUE real se calcula sobre utilidad neta (ingresos menos gastos deducibles), no sobre ventas. El IVA admite crédito fiscal por compras."
    );

    const totalMensual = lineas.reduce((acc, l) => {
      const m = l.monto ?? 0;
      const mensual = l.periodicidad === "anual" ? m / 12 : m;
      return acc + mensual;
    }, 0);

    return { lineas, totalMensualEstimado: redondear(totalMensual), advertencias };
  }

  if (regimen === "STI") {
    advertencias.push(ADVERTENCIA_STI_ACTUALIZACION);

    if (categoriaSti !== undefined) {
      const cat = cuotaSTI(categoriaSti);
      if (!cat) {
        throw new Error(`Categoría STI ${categoriaSti} no existe en la tabla.`);
      }
      const linea: LineaImpuesto = {
        impuesto: `Cuota del régimen STI (categoría ${cat.categoria})`,
        sigla: "STI",
        monto: cat.impuestoTrimestral,
        periodicidad: "trimestral",
        detalle: `Cuota fija de la categoría ${cat.categoria}: Bs ${cat.impuestoTrimestral} por trimestre (ingreso presunto Bs ${cat.ingresoTrimestral}).`,
        fuente: cat.fuente,
      };
      return {
        lineas: [linea],
        totalMensualEstimado: redondear(cat.impuestoTrimestral / 3),
        advertencias,
      };
    }

    // Sin categoría: rango verificado, sin inventar un monto único ni mostrar 0
    const tabla = CATEGORIAS_STI.map(
      (c) => `cat. ${c.categoria}: Bs ${c.impuestoTrimestral}`,
    ).join("; ");
    return {
      lineas: [
        {
          impuesto: "Cuota del régimen STI",
          sigla: "STI",
          monto: null,
          periodicidad: "trimestral",
          detalle: `Rango según categoría (D.S. 23027 Art. 4): Bs ${CUOTA_STI_MIN}–${CUOTA_STI_MAX} / trimestral (${tabla}). Indicar tipo de vehículo y ubicación para fijar la categoría.`,
          fuente: FUENTE_LEY_843_STI_ART4,
        },
      ],
      totalMensualEstimado: null,
      advertencias: [
        ...advertencias,
        `Cuota STI entre Bs ${CUOTA_STI_MIN} y Bs ${CUOTA_STI_MAX} trimestrales según categoría. Sin tipo de transporte/ubicación no se fija un monto único.`,
      ],
    };
  }

  if (
    !actividadRau ||
    hectareasRau == null ||
    !zonaRau
  ) {
    return {
      lineas: [
        {
          impuesto: "Cuota anual del RAU",
          sigla: "RAU",
          monto: null,
          periodicidad: "anual",
          detalle:
            "Indicá actividad agrícola o pecuaria, hectáreas y zona productiva para calcular la cuota.",
          fuente: FUENTE_REGLAS_RAU,
        },
      ],
      totalMensualEstimado: null,
      advertencias: [
        ...advertencias,
        "Faltan datos de superficie y ubicación para estimar el RAU.",
      ],
    };
  }

  if (!Number.isFinite(hectareasRau) || hectareasRau <= 0) {
    throw new Error("Las hectáreas del RAU deben ser un número mayor que cero.");
  }

  const cuotaRau = buscarCuotaRau(zonaRau);
  if (!cuotaRau) {
    return {
      lineas: [
        {
          impuesto: "Cuota anual del RAU",
          sigla: "RAU",
          monto: null,
          periodicidad: "anual",
          detalle: "La zona seleccionada no existe en la tabla oficial cargada.",
          fuente: FUENTE_CUOTAS_RAU,
        },
      ],
      totalMensualEstimado: null,
      advertencias: [...advertencias, "No se encontró la zona RAU seleccionada."],
    };
  }

  const cuotaPorHectarea =
    actividadRau === "agricola"
      ? cuotaRau.cuotaAgricola
      : cuotaRau.cuotaPecuaria;
  if (cuotaPorHectarea == null) {
    return {
      lineas: [
        {
          impuesto: "Cuota anual del RAU",
          sigla: "RAU",
          monto: null,
          periodicidad: "anual",
          detalle: "La combinación de actividad y clase de tierra no aplica.",
          fuente: FUENTE_CUOTAS_RAU,
        },
      ],
      totalMensualEstimado: null,
      advertencias: [
        ...advertencias,
        "Elegí una clase de tierra aplicable a la actividad declarada.",
      ],
    };
  }

  const limites = limitesRau(cuotaRau, actividadRau);
  const descripcionZona = `${cuotaRau.zona} — ${cuotaRau.subzona} — ${cuotaRau.claseTierra}`;

  if (certificadoNoImponibilidadRau === "si") {
    return {
      lineas: [
        {
          impuesto: "Certificado de No Imponibilidad RAU",
          sigla: "RAU",
          monto: null,
          periodicidad: "anual",
          detalle:
            "Indicás que contás con certificado. Verificá que esté vigente para la gestión antes del vencimiento anual.",
          fuente: FUENTE_REGLAS_RAU,
        },
      ],
      totalMensualEstimado: null,
      advertencias: [
        ...advertencias,
        "No se calcula una cuota porque declaraste contar con Certificado de No Imponibilidad RAU.",
      ],
    };
  }

  if (limites.minimo != null && hectareasRau <= limites.minimo) {
    return {
      lineas: [
        {
          impuesto: "Posible pequeña propiedad no imponible",
          sigla: "RAU",
          monto: null,
          periodicidad: "anual",
          detalle: `${hectareasRau} ha están dentro del máximo no imponible de ${limites.minimo} ha para ${descripcionZona}. Debés tramitar el certificado anual; no mostramos Bs 0 como si fuera una cuota calculada.`,
          fuente: FUENTE_REGLAS_RAU,
        },
      ],
      totalMensualEstimado: null,
      advertencias: [
        ...advertencias,
        "La no imponibilidad requiere certificación vigente del SIN.",
      ],
    };
  }

  const montoAnual = redondear(hectareasRau * cuotaPorHectarea);
  const linea: LineaImpuesto = {
    impuesto: `Cuota anual RAU (${actividadRau === "agricola" ? "agrícola" : "pecuaria"})`,
    sigla: "RAU",
    monto: montoAnual,
    periodicidad: "anual",
    detalle: `${hectareasRau} ha × Bs ${cuotaPorHectarea.toFixed(2)} por ha en ${descripcionZona}.`,
    fuente: FUENTE_CUOTAS_RAU,
  };

  return {
    lineas: [linea],
    totalMensualEstimado: redondear(montoAnual / 12),
    advertencias: [
      ...advertencias,
      "Estimación con la última tabla oficial disponible: cuotas RAU gestión 2024, vigentes desde el 1 de octubre de 2025. Confirmá superficie gravada, zona y vigencia con el SIN.",
    ],
  };
}

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}
