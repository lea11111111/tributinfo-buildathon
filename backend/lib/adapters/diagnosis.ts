/**
 * Adapta el contrato del frontend (DiagnosisInput/Result) a las tools determinísticas.
 */
import { CHECKLIST_NIT } from "../data/checklist-nit";
import { calcularImpuestos } from "../tools/calcular-impuestos";
import { clasificarRegimen } from "../tools/clasificar-regimen";
import { generarCalendario } from "../tools/generar-calendario";
import type {
  Actividad as ActividadContrato,
  DiagnosisInput,
  DiagnosisResult,
  Regimen,
  TipoClientes as TipoClientesContrato,
  ToolEvent,
} from "../types/diagnosis-contract";
import type { Actividad, TipoClientes } from "../types/tools";

export type DiagnosisMeta = {
  proximoVencimiento: string;
  concepto: string;
};

function mapActividad(a: ActividadContrato): Actividad {
  switch (a) {
    case "comercio":
      return "comercio_minorista";
    case "agropecuario":
      return "agropecuaria";
    case "servicios":
      return "servicios";
    case "transporte":
      return "transporte";
    default:
      return "otro";
  }
}

function mapTipoClientes(t: TipoClientesContrato): TipoClientes {
  switch (t) {
    case "consumidores":
      return "consumidor_final";
    case "empresas":
      return "empresas";
    default:
      return "mixto";
  }
}

export function runDiagnosis(input: DiagnosisInput): {
  result: DiagnosisResult;
  meta: DiagnosisMeta;
} {
  const ventasAnuales = input.ventasMensuales * 12;

  const regimenResult = clasificarRegimen({
    actividad: mapActividad(input.actividad),
    capital: input.capital,
    ventasAnuales,
    tipoClientes: mapTipoClientes(input.tipoClientes),
    tipoTransporte: input.tipoTransporte,
    ubicacionSti: input.ubicacionSti,
    actividadRau: input.actividadRau,
    hectareasRau: input.hectareasRau,
    zonaRau: input.zonaRau,
  });

  const regimen = regimenResult.nombre as Regimen;

  const calculoResult = calcularImpuestos({
    regimen,
    ventasMensuales: input.ventasMensuales,
    categoria: regimenResult.categoria,
    categoriaSti: regimenResult.categoriaSti,
    actividadRau: input.actividadRau,
    hectareasRau: input.hectareasRau,
    zonaRau: input.zonaRau,
    certificadoNoImponibilidadRau: input.certificadoNoImponibilidadRau,
  });

  const digito = input.ultimoDigitoNit ?? 0;
  const calendarioResult = generarCalendario({
    regimen,
    ultimoDigitoNit: digito,
  });

  const hoy = new Date().toISOString().slice(0, 10);
  const proximoEvento =
    calendarioResult.eventos.find((e) => e.fecha >= hoy) ?? calendarioResult.eventos[0];

  const calcSummary =
    regimen === "RAU" && calculoResult.lineas[0]?.monto != null
      ? `Bs ${calculoResult.lineas[0].monto.toFixed(0)} / año est.`
      : calculoResult.totalMensualEstimado != null
      ? `Bs ${calculoResult.totalMensualEstimado.toFixed(0)} / mes est.`
      : "dato no disponible";

  const tools: ToolEvent[] = [
    {
      name: "buscar_normativa",
      status: "done",
      summary: `${regimenResult.fuente.norma}, ${regimenResult.fuente.articulo}`,
    },
    { name: "clasificar_regimen", status: "done", summary: regimen },
    {
      name: "calcular_impuestos",
      status: "done",
      summary: calcSummary,
    },
    {
      name: "generar_calendario",
      status: "done",
      summary: `${calendarioResult.eventos.length} vencimientos`,
    },
    { name: "enviar_recordatorio", status: "waiting" },
  ];

  const resumenCalculo = (() => {
    if (calculoResult.totalMensualEstimado != null && regimen === "STI") {
      return `Cuota trimestral STI. Estimación mensual: Bs ${calculoResult.totalMensualEstimado.toFixed(2)}. ${calculoResult.advertencias[0] ?? ""}`.trim();
    }
    if (calculoResult.totalMensualEstimado != null && regimen === "RAU") {
      const montoAnual = calculoResult.lineas[0]?.monto;
      return montoAnual != null
        ? `Cuota anual estimada: Bs ${montoAnual.toFixed(2)}. ${calculoResult.advertencias[0] ?? ""}`.trim()
        : calculoResult.advertencias[0] ?? "No se pudo calcular la cuota RAU.";
    }
    if (calculoResult.totalMensualEstimado != null && calculoResult.advertencias.length === 0) {
      return `Estimación mensual: Bs ${calculoResult.totalMensualEstimado.toFixed(2)}`;
    }
    if (calculoResult.advertencias.length > 0) {
      return calculoResult.advertencias[calculoResult.advertencias.length - 1];
    }
    return `Estimación mensual: Bs ${(calculoResult.totalMensualEstimado ?? 0).toFixed(2)}`;
  })();

  return {
    result: {
      regimen,
      justification: {
        text: regimenResult.justificacion,
        articulo: regimenResult.fuente.articulo,
        fuente: regimenResult.fuente.norma,
        url: regimenResult.fuente.link,
      },
      calculo: {
        items: calculoResult.lineas.map((l) => ({
          label: l.impuesto,
          montoBs: l.monto,
          periodicidad: l.periodicidad,
          detalle: l.detalle,
          fuente: `${l.fuente.norma}, ${l.fuente.articulo}`,
          fuenteUrl: l.fuente.link,
        })),
        resumen: resumenCalculo,
      },
      calendario: {
        eventos: calendarioResult.eventos.map((e) => ({
          titulo: e.titulo,
          fecha: e.fecha,
          descripcion: e.descripcion,
          googleCalendarUrl: e.googleCalendarUrl,
        })),
        filename: calendarioResult.nombreArchivo,
      },
      checklist: {
        pasos: CHECKLIST_NIT.map((p) => ({
          orden: p.paso,
          texto: `${p.titulo}: ${p.descripcion}`,
          presencial: p.descripcion.toLowerCase().includes("presencial"),
        })),
        filename: "checklist-nit.txt",
      },
      tools,
    },
    meta: {
      proximoVencimiento: proximoEvento?.fecha ?? hoy,
      concepto: proximoEvento?.impuesto ?? "Obligación fiscal",
    },
  };
}

let lastDiagnosisMeta: DiagnosisMeta | null = null;

export function cacheDiagnosisMeta(meta: DiagnosisMeta) {
  lastDiagnosisMeta = meta;
}

export function getLastDiagnosisMeta() {
  return lastDiagnosisMeta;
}
