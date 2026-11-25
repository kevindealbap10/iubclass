// =============================================================================
//  S10 · Contrato de datos · Diapositiva 11
// -----------------------------------------------------------------------------
//  La API pública https://dummyjson.com/todos devuelve tareas con esta forma.
//  La interfaz es el contrato: HttpClient no valida nada, solo le dice a
//  TypeScript qué esperar. Si la API cambia un nombre, el error aparece en la
//  plantilla (undefined), no en la petición.
//
//  GET /todos?limit=5&skip=0  ->  PaginaTareas
//  GET /todos/7               ->  Tarea
// =============================================================================

export interface Tarea {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface PaginaTareas {
  todos: Tarea[];
  total: number; // 254 tareas en la API
  skip: number;
  limit: number;
}

/** Cuerpo de un POST: la API asigna el id. */
export type NuevaTarea = Omit<Tarea, 'id'>;
