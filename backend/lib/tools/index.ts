/**
 * Punto de entrada de las tools determinísticas para el loop del agente (Leandro).
 *
 * Todas son funciones puras salvo enviarRecordatorio (llama a Zavu).
 * Ninguna usa IA: solo if/else, aritmética y datos de lib/data/.
 */
export { clasificarRegimen } from "./clasificar-regimen";
export { calcularImpuestos } from "./calcular-impuestos";
export { generarCalendario } from "./generar-calendario";
export { enviarRecordatorio } from "./enviar-recordatorio";
export { buscarNormativa } from "./buscar-normativa";

export { CHECKLIST_NIT } from "../data/checklist-nit";
export { CUOTAS_RAU, buscarCuotaRau } from "../data/cuotas-rau";

export type {
  ClasificarRegimenInput,
  CalcularImpuestosInput,
  GenerarCalendarioInput,
  EnviarRecordatorioInput,
} from "../types/tools";

export type {
  ResultadoTributario,
  RegimenResultado,
  CalculoResultado,
  CalendarioResultado,
  EnvioResultado,
  PasoChecklist,
  EstadoTool,
} from "../types/resultado";
