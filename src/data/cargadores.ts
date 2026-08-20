import type { Cargador } from "../types/charger";

// Cargadores simulados para demostración.
export const cargadoresSimulados: Cargador[] = [
  {
    id: "centro-cultural",
    nombre: "Centro Cultural",
    ubicacion: "Centro Cultural",
    direccion: "Plaza Mayor, Quer",
    fabricante: "Autel MaxiCharger AC",
    gestor: "Ayuntamiento de Quer",
    estado: "conectado",
    permiteReserva: true,

    tomas: [
      {
        id: "centro-cultural-toma-1",
        nombre: "Toma 1",
        estado: "libre",
        potenciaMaximaKw: 7.4,
        permiteReserva: true,
      },
    ],
  },

  {
    id: "enebros",
    nombre: "Enebros",
    ubicacion: "Enebros",
    direccion: "Zona de Enebros, Quer",
    fabricante: "Autel MaxiCharger AC",
    gestor: "Ayuntamiento de Quer",
    estado: "conectado",
    permiteReserva: true,

    tomas: [
      {
        id: "enebros-toma-1",
        nombre: "Toma 1",
        estado: "libre",
        potenciaMaximaKw: 7.4,
        permiteReserva: true,
      },

      {
        id: "enebros-toma-2",
        nombre: "Toma 2",
        estado: "ocupada",
        potenciaMaximaKw: 7.4,
        permiteReserva: true,

        // Toma ocupada de demostración.
        disponibleDesde: "14:30",
        usuarioActual: "Usuario de demostración",
      },
    ],
  },

  {
    id: "piscina",
    nombre: "Piscina",
    ubicacion: "Piscina municipal",
    direccion: "Piscina municipal de Quer",
    fabricante: "Autel MaxiCharger AC",
    gestor: "Ayuntamiento de Quer",
    estado: "conectado",
    permiteReserva: true,

    tomas: [
      {
        id: "piscina-toma-1",
        nombre: "Toma 1",
        estado: "ocupada",
        potenciaMaximaKw: 7.4,
        permiteReserva: true,

        // Carga en curso de demostración.
        disponibleDesde: "13:00",
        usuarioActual: "Usuario de demostración",
      },

      {
        id: "piscina-toma-2",
        nombre: "Toma 2",
        estado: "mi-carga",
        potenciaMaximaKw: 7.4,
        permiteReserva: true,
      },
    ],
  },

  {
    id: "paez-de-castro",
    nombre: "Páez de Castro",
    ubicacion: "Páez de Castro",
    direccion: "Calle Páez de Castro, Quer",
    fabricante: "Ingeteam Energy",
    gestor: "Ayuntamiento de Quer",
    estado: "conectado",
    permiteReserva: true,

    tomas: [
      {
        id: "paez-de-castro-toma-1",
        nombre: "Toma 1",
        estado: "libre",
        potenciaMaximaKw: 11,
        permiteReserva: true,
      },

      {
        id: "paez-de-castro-toma-2",
        nombre: "Toma 2",
        estado: "reservada",
        potenciaMaximaKw: 11,
        permiteReserva: true,

        // Reserva de otro usuario para demostración.
        disponibleDesde: "17:00",
        usuarioActual: "Usuario de demostración",
      },
    ],
  },
];
