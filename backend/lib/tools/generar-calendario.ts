/**
 * Tool determinística: genera el calendario fiscal del año como .ics válido.
 * Usa la librería `ics` (no armamos el formato a mano).
 */
import { createEvents, type EventAttributes } from "ics";
import type { CalendarioResultado, EventoFiscal } from "../types/resultado";
import type { GenerarCalendarioInput } from "../types/tools";
import { OBLIGACIONES, VENCIMIENTOS_POR_DIGITO } from "../data/calendario-vencimientos";
import { ADVERTENCIA_DATOS_NO_VERIFICADOS, DATOS_VERIFICADOS } from "../data/verificacion";
import { generarLinkGoogleCalendar } from "../utils/google-calendar-link";

export function generarCalendario(input: GenerarCalendarioInput): CalendarioResultado {
  const advertencias: string[] = [];
  if (!DATOS_VERIFICADOS) advertencias.push(ADVERTENCIA_DATOS_NO_VERIFICADOS);

  const { regimen, ultimoDigitoNit } = input;
  const anio = input.anio ?? new Date().getFullYear();

  if (!Number.isInteger(ultimoDigitoNit) || ultimoDigitoNit < 0 || ultimoDigitoNit > 9) {
    throw new Error("El último dígito del NIT debe ser un entero entre 0 y 9.");
  }

  const regla = VENCIMIENTOS_POR_DIGITO.find((v) => v.ultimoDigitoNit === ultimoDigitoNit);
  if (!regla) {
    throw new Error(`No hay regla de vencimiento para el dígito ${ultimoDigitoNit}. Revisar planilla 3.`);
  }

  const obligacion = OBLIGACIONES.find((o) => o.regimen === regimen);
  if (!obligacion) {
    throw new Error(`No hay obligaciones cargadas para el régimen ${regimen}. Revisar planilla 3.`);
  }

  const dia =
    obligacion.diaVencimientoFijo ?? regla.diaVencimiento;
  const fuenteEvento = obligacion.diaVencimientoFijo ? obligacion.fuente : regla.fuente;

  const eventos: EventoFiscal[] = obligacion.meses.map((mes) => {
    const fecha = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const titulo = `Vencimiento: ${obligacion.concepto}`;
    const descripcion = obligacion.diaVencimientoFijo
      ? `${obligacion.concepto} — vence el día ${dia} (no depende del dígito del NIT). Régimen ${regimen}.`
      : `${obligacion.concepto} — NIT terminado en ${ultimoDigitoNit} vence el día ${dia}. Régimen ${regimen}.`;
    return {
      fecha,
      titulo,
      descripcion,
      impuesto: obligacion.concepto,
      fuente: fuenteEvento,
      googleCalendarUrl: generarLinkGoogleCalendar({ fecha, titulo, descripcion }),
    };
  });

  const icsEvents: EventAttributes[] = eventos.map((e) => {
    const [y, m, d] = e.fecha.split("-").map(Number);
    return {
      title: e.titulo,
      description: e.descripcion,
      start: [y, m, d],
      duration: { days: 1 },
      calName: "Calendario Fiscal - TributInfo",
      // Recordatorio 3 días antes, a las 9:00
      alarms: [
        {
          action: "display",
          description: `En 3 días vence: ${e.impuesto}`,
          trigger: { days: 3, before: true },
        },
      ],
    };
  });

  const { error, value } = createEvents(icsEvents);
  if (error || !value) {
    throw new Error(`Error generando el .ics: ${error?.message ?? "sin contenido"}`);
  }

  return {
    eventos,
    icsContent: value,
    nombreArchivo: `calendario-fiscal-${anio}.ics`,
    advertencias,
  };
}
