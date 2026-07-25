/**
 * Estado de verificación de los datos tributarios.
 *
 * REGLA DEL EQUIPO: ningún número sale de la memoria ni de una IA.
 * Todos los montos de lib/data/ deben copiarse de las planillas de Fernanda
 * (que citan norma, artículo y link oficial del SIN).
 *
 * Mientras DATOS_VERIFICADOS sea false, todas las tools agregan una
 * advertencia a su output. Cambiar a true SOLO cuando Fernanda confirme
 * que cada celda fue copiada de su planilla.
 */
export const DATOS_VERIFICADOS = false;

export const ADVERTENCIA_DATOS_NO_VERIFICADOS =
  "DATOS PLACEHOLDER: los montos NO fueron verificados contra las planillas de Fernanda. NO usar en demo.";

export const FUENTE_PENDIENTE = {
  norma: "TODO_FERNANDA: norma pendiente",
  articulo: "TODO_FERNANDA: artículo pendiente",
  link: "TODO_FERNANDA: link pendiente",
};
