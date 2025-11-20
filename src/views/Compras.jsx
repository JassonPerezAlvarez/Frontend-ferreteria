import { useState, useEffect } from "react";
import { Container, Col, Row, Button } from "react-bootstrap";

import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import ModalRegistroCompra from "../components/Compras/ModalRegistroCompra.jsx";
import ModalEdicionCompra from "../components/Compras/ModalEdicionCompra.jsx";
import ModalEliminacionCompra from "../components/Compras/ModalEliminacionCompra.jsx";
import TablaCompras from "../components/Compras/TablaCompras.jsx";
import { Zoom, Fade } from "react-awesome-reveal";

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [paginaActual, establecerPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  const [comprasFiltradas, setComprasFiltradas] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const comprasPaginadas = comprasFiltradas.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);

  const [nuevaCompra, setNuevaCompra] = useState({
    id_empleado: "",
    fecha_compra: new Date().toISOString().split("T")[0],
    total_compra: 0,
  });
  const [compraEnEdicion, setCompraEnEdicion] = useState(null);
  const [compraAEliminar, setCompraAEliminar] = useState(null);

  const [detallesNuevos, setDetallesNuevos] = useState([]);
  const [detallesParaModal, setDetallesParaModal] = useState([]);

  const [productos, setProductos] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const obtenerCompras = async () => {
    try {
      const respuesta = await fetch("http://localhost:3000/api/compra");
      if (!respuesta.ok) throw new Error("Error al obtener las compras");
      const datos = await respuesta.json();
      setCompras(datos);
      setComprasFiltradas(datos);
      setCargando(false);
    } catch (error) {
      console.log(error.message);
      setCargando(false);
    }
  };

  const obtenerProductos = async () => {
    try {
      const resp = await fetch("http://localhost:3000/api/productos");
      if (!resp.ok) throw new Error("Error al cargar productos");
      const datos = await resp.json();
      setProductos(datos);
    } catch (error) {
      console.error(error);
    }
  };

  const obtenerEmpleados = async () => {
    try {
      const resp = await fetch("http://localhost:3000/api/empleado");
      if (!resp.ok) throw new Error("Error al cargar empleados");
      const datos = await resp.json();
      setEmpleados(datos);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    obtenerCompras();
    obtenerProductos();
    obtenerEmpleados();
  }, []);

  const manejarCambioBusqueda = (e) => {
    const texto = e.target.value.toLowerCase();
    setTextoBusqueda(texto);
  };

  useEffect(() => {
    if (textoBusqueda.trim() === "") {
      setComprasFiltradas(compras);
      return;
    }
    const filtradas = compras.filter((compra) => {
      return (
        String(compra.id_compra).includes(textoBusqueda) ||
        String(compra.id_empleado).toLowerCase().includes(textoBusqueda) ||
        compra.fecha_compra.toLowerCase().includes(textoBusqueda) ||
        String(compra.total_compra).toLowerCase().includes(textoBusqueda)
      );
    });
    setComprasFiltradas(filtradas);
  }, [textoBusqueda, compras]);

  const agregarCompra = async () => {
    if (!nuevaCompra.id_empleado || detallesNuevos.length === 0) {
      alert("Completa empleado y al menos un detalle.");
      return;
    }

    const total = detallesNuevos.reduce(
      (sum, d) => sum + d.cantidad * d.precio_unitario,
      0
    );

    try {
      const resp = await fetch("http://localhost:3000/api/registrarcompra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nuevaCompra, total_compra: total }),
      });
      if (!resp.ok) throw new Error("Error al crear compra");
      const { id_compra } = await resp.json();

      for (const d of detallesNuevos) {
        await fetch("http://localhost:3000/api/registrardetalles_compra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...d, id_compra }),
        });
      }

      await obtenerCompras();
      setMostrarModalRegistro(false);
      setNuevaCompra({
        id_empleado: "",
        fecha_compra: new Date().toISOString().split("T")[0],
        total_compra: 0,
      });
      setDetallesNuevos([]);
    } catch (error) {
      console.error(error);
      alert("Error al registrar compra.");
    }
  };

  const obtenerDetallesCompra = async (id_compra) => {
    try {
      const resp = await fetch("http://localhost:3000/api/Detalles_compras");
      if (!resp.ok) throw new Error("Error al cargar detalles");
      const todos = await resp.json();
      const filtrados = todos.filter((d) => d.id_compra === parseInt(id_compra));

      const detalles = await Promise.all(
        filtrados.map(async (d) => {
          try {
            const r = await fetch(`http://localhost:3000/api/productos/${d.id_producto}`);
            if (r.ok) {
              const x = await r.json();
              return { ...d, nombre_producto: x.nombre_producto || "N/D" };
            }
          } catch (error) {
            console.log("Error cargando producto:", error);
          }
          return { ...d, nombre_producto: "N/D" };
        })
      );

      setDetallesParaModal(detalles);
      setMostrarModalDetalles(true);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar los detalles.");
    }
  };

  const abrirModalEdicion = async (compra) => {
    setCompraEnEdicion({
      ...compra,
      fecha_compra: new Date(compra.fecha_compra).toISOString().split("T")[0],
    });

    const resp = await fetch("http://localhost:3000/api/Detalles_compras");
    const todos = await resp.json();
    const detallesRaw = todos.filter((d) => d.id_compra === compra.id_compra);

    const detalles = await Promise.all(
      detallesRaw.map(async (d) => {
        try {
          const r = await fetch(`http://localhost:3000/api/productos/${d.id_producto}`);
          if (r.ok) {
            const x = await r.json();
            return {
              id_producto: d.id_producto,
              nombre_producto: x.nombre_producto || "N/D",
              cantidad: d.cantidad,
              precio_unitario: d.precio_unitario,
            };
          }
        } catch (error) {
          console.log("Error cargando producto en edición:", error);
        }
        return {
          id_producto: d.id_producto,
          nombre_producto: "N/D",
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
        };
      })
    );

    setDetallesNuevos(detalles);
    setMostrarModalEdicion(true);
  };

  const actualizarCompra = async () => {
    const total = detallesNuevos.reduce(
      (sum, d) => sum + d.cantidad * d.precio_unitario,
      0
    );
    try {
      await fetch(
        `http://localhost:3000/api/actualizarCompraPatch/${compraEnEdicion.id_compra}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...compraEnEdicion, total_compra: total }),
        }
      );

      const resp = await fetch("http://localhost:3000/api/Detalles_compras");
      const todos = await resp.json();
      const actuales = todos.filter((d) => d.id_compra === compraEnEdicion.id_compra);
      for (const d of actuales) {
        await fetch(`http://localhost:3000/api/eliminardetalle_compra/${d.id_detalle_compra}`, {
          method: "DELETE",
        });
      }

      for (const d of detallesNuevos) {
        await fetch("http://localhost:3000/api/registrardetalles_compra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...d, id_compra: compraEnEdicion.id_compra }),
        });
      }

      await obtenerCompras();
      setMostrarModalEdicion(false);
      setCompraEnEdicion(null);
      setDetallesNuevos([]);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar.");
    }
  };

  const abrirModalEliminacion = (compra) => {
    setCompraAEliminar(compra);
    setMostrarModalEliminar(true);
  };

  const eliminarCompra = async () => {
    try {
      await fetch(`http://localhost:3000/api/eliminarcompra/${compraAEliminar.id_compra}`, {
        method: "DELETE",
      });
      await obtenerCompras();
      setMostrarModalEliminar(false);
      setCompraAEliminar(null);
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar.");
    }
  };

  return (
    <Container className="mt-4">
      <h4>Compras</h4>
      <Row className="align-items-center mb-3">
        <Col lg={5} md={8} sm={8} xs={7}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarCambioBusqueda}
          />
        </Col>
        <Col className="text-end">
          <Button className="color-boton-registro" onClick={() => setMostrarModalRegistro(true)}>
            + Nueva Compra
          </Button>
        </Col>
      </Row>

      <Fade cascade triggerOnce delay={10} duration={600}>
        <TablaCompras
          compras={comprasPaginadas}
          cargando={cargando}
          obtenerDetalles={obtenerDetallesCompra}
          abrirModalEdicion={abrirModalEdicion}
          abrirModalEliminacion={abrirModalEliminacion}
          totalElementos={comprasFiltradas.length}
          elementosPorPagina={elementosPorPagina}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
        />
      </Fade>

      <ModalRegistroCompra
        mostrar={mostrarModalRegistro}
        setMostrar={() => setMostrarModalRegistro(false)}
        nuevaCompra={nuevaCompra}
        setNuevaCompra={setNuevaCompra}
        detalles={detallesNuevos}
        setDetalles={setDetallesNuevos}
        productos={productos}
        empleados={empleados}
        agregarCompra={agregarCompra}
        hoy={new Date().toISOString().split("T")[0]}
      />

      <ModalEdicionCompra
        mostrar={mostrarModalEdicion}
        setMostrar={() => setMostrarModalEdicion(false)}
        compraEnEdicion={compraEnEdicion}
        setCompraEnEdicion={setCompraEnEdicion}
        detalles={detallesNuevos}
        setDetalles={setDetallesNuevos}
        productos={productos}
        empleados={empleados}
        actualizarCompra={actualizarCompra}
        hoy={new Date().toISOString().split("T")[0]}
      />

      <ModalDetallesCompra
        mostrarModal={mostrarModalDetalles}
        setMostrarModal={() => setMostrarModalDetalles(false)}
        detalles={detallesParaModal}
      />

      <ModalEliminacionCompra
        mostrar={mostrarModalEliminar}
        setMostrar={() => setMostrarModalEliminar(false)}
        compra={compraAEliminar}
        confirmarEliminacion={eliminarCompra}
      />
    </Container>
  );
};

export default Compras;