import React, { useState } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import BotonOrden from "../ordenamiento/BotonOrden";
import Paginacion from "../ordenamiento/Paginacion";

const TablaCategorias = ({
  categorias,
  cargando,
  abrirModalEdicion,
  abrirModalEliminacion,
  totalElementos,
  elementosPorPagina,
  paginaActual,
  establecerPaginaActual,
}) => {
  const [orden, setOrden] = useState({
    campo: "id_categoria",
    direccion: "asc",
  });

  const manejarOrden = (campo) => {
    setOrden((prev) => ({
      campo,
      direccion:
        prev.campo === campo && prev.direccion === "asc" ? "desc" : "asc",
    }));
  };

  const categoriasOrdenadas = [...categorias].sort((a, b) => {
    const valorA = a[orden.campo];
    const valorB = b[orden.campo];

    if (typeof valorA === "number" && typeof valorB === "number") {
      return orden.direccion === "asc" ? valorA - valorB : valorB - valorA;
    }

    const comparacion = String(valorA).localeCompare(String(valorB));
    return orden.direccion === "asc" ? comparacion : -comparacion;
  });

  if (cargando) {
    return (
      <Spinner animation="border">
        <span className="visually-hidden">Cargando...</span>
      </Spinner>
    );
  }

  return (
    <>
      {/* ESTILOS MODO OSCURO */}
      <style>{`
        .tabla-cat-dark {
          background: #1a1d21;
          color: #e2e2e2;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #2c3136;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }

        .tabla-cat-dark thead {
          background: #0d6efd;
          color: white;
        }

        .tabla-cat-dark thead th {
          padding: 14px;
          font-size: 15px;
          text-align: center;
          letter-spacing: .4px;
        }

        .tabla-cat-dark tbody tr {
          background-color: #212529;
          transition: background 0.25s ease;
        }

        .tabla-cat-dark tbody tr:nth-child(even) {
          background-color: #2a2f34;
        }

        .tabla-cat-dark tbody tr:hover {
          background-color: #334155;
        }

        .tabla-cat-dark td {
          padding: 12px 10px !important;
        }

        /* Botones */
        .btn-accion {
          border-radius: 10px !important;
          padding: 5px 10px;
        }

        .btn-outline-warning {
          color: #ffce3a !important;
          border-color: #ffce3a !important;
        }
        .btn-outline-warning:hover {
          background: #ffce3a !important;
          color: #000 !important;
        }

        .btn-outline-danger {
          color: #ff5c5c !important;
          border-color: #ff5c5c !important;
        }
        .btn-outline-danger:hover {
          background: #ff5c5c !important;
          color: #000 !important;
        }
      `}</style>

      <Table className="tabla-cat-dark" bordered hover>
        <thead>
  <tr>

    <BotonOrden campo="id_categoria" orden={orden} manejarOrden={manejarOrden}>
      ID
    </BotonOrden>

    <BotonOrden campo="nombre_categoria" orden={orden} manejarOrden={manejarOrden}>
      Nombre Categoría
    </BotonOrden>

    <BotonOrden campo="descripcion_categoria" orden={orden} manejarOrden={manejarOrden}>
      Descripción Categoría
    </BotonOrden>

    <th>Acciones</th>

  </tr>
</thead>

        <tbody>
          {categoriasOrdenadas.map((categoria) => (
            <tr key={categoria.id_categoria}>
              <td>{categoria.id_categoria}</td>
              <td>{categoria.nombre_categoria}</td>
              <td>{categoria.descripcion_categoria}</td>

              <td>
                <Button
                  variant="outline-warning"
                  size="sm"
                  className="btn-accion me-2"
                  onClick={() => abrirModalEdicion(categoria)}
                >
                  <i className="bi bi-pencil"></i>
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  className="btn-accion"
                  onClick={() => abrirModalEliminacion(categoria)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Paginacion
        elementosPorPagina={elementosPorPagina}
        totalElementos={totalElementos}
        paginaActual={paginaActual}
        establecerPaginaActual={establecerPaginaActual}
      />
    </>
  );
};

export default TablaCategorias;
