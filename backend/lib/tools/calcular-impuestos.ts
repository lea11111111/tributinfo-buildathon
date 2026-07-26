/**
 * Tool determinística: calcula impuestos estimados según el régimen.
 * Aritmética pura — sin LLM. Alícuotas y cuotas salen de lib/data/.
 */
import type { CalculoResultado, LineaImpuesto } from "../types/resultado";
import type { CalcularImpuestosInput } from "../types/tools";
import { CATEGORIAS_RTS } from "../data/categorias-simplificado";
import { IMPUESTOS_GENERAL } from "../data/impuestos-general";
import { ADVERTENCIA_DATOS_NO_VERIFICADOS, DATOS_VERIFICADOS, FUENTE_PENDIENTE } from "../data/verificacion";

export function calcularImpuestos(input: CalcularImpuestosInput): CalculoResultado {
  const advertencias: string[] = [];
  if (!DATOS_VERIFICADOS) advertencias.push(ADVERTENCIA_DATOS_NO_VERIFICADOS);

  const { regimen, ventasMensuales, categoria } = input;

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
      const mensual = l.periodicidad === "anual" ? l.monto / 12 : l.monto;
      return acc + mensual;
    }, 0);

    return { lineas, totalMensualEstimado: redondear(totalMensual), advertencias };
  }

  // STI y RAU: sus cuotas dependen de tablas propias que aún no están en las planillas.
  // Regla del proyecto: si la tool no tiene el dato, lo dice — nunca inventa.
  return {
    lineas: [
      {
        impuesto: `Cuota del régimen ${regimen}`,
        sigla: regimen,
        monto: 0,
        periodicidad: regimen === "RAU" ? "anual" : "trimestral",
        detalle: `NO DISPONIBLE: la tabla de cuotas del ${regimen} no está cargada todavía (NO ENCONTRADO en planillas).`,
        fuente: FUENTE_PENDIENTE,
      },
    ],
    totalMensualEstimado: 0,
    advertencias: [
      ...advertencias,
      `No hay datos cargados para calcular el ${regimen}. El agente debe decir que no tiene ese dato, no estimarlo.`,
    ],
  };
}

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}
