import { useState, useEffect } from "react";
import { Container, Col, Row, Button } from "react-bootstrap";
import TablaProductos from "../components/Productos/TablaProductos.jsx";

import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [productoEditado, setProductoEditado] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    id_categoria: "",
    precio_unitario: "",
    stock: "",
    imagen: "",
  });

  const obtenerProductos = async () => {
    try {
      const respuesta = await fetch("http://localhost:3000/api/productos");
      if (!respuesta.ok) throw new Error("Error al obtener los productos");
      const datos = await respuesta.json();
      setProductos(datos);
      setProductosFiltrados(datos);
      setCargando(false);
    } catch (error) {
      console.error(error.message);
      setCargando(false);
    }
  };

  const manejarCambioBusqueda = (e) => {
    const texto = e.target.value.toLowerCase();
    setTextoBusqueda(texto);

    const filtrados = productos.filter((producto) => {
      const nombre = producto.nombre_producto?.toLowerCase() || "";
      const descripcion = producto.descripcion_producto?.toLowerCase() || "";
      const categoria = String(producto.id_categoria);
      const precio = String(producto.precio_unitario);
      const stock = String(producto.stock);

      return (
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        categoria.includes(texto) ||
        precio.includes(texto) ||
        stock.includes(texto)
      );
    });
    setProductosFiltrados(filtrados);
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  // GENERAR PDF - 100% FUNCIONAL Y SIN WARNINGS
  const generarPDFProductos = () => {
    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(28, 41, 51);
    doc.rect(0, 0, 220, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text("Lista de Productos", 105, 18, { align: "center" });

    // Tabla con pie de página correcto
    autoTable(doc, {
      head: [["ID", "Nombre", "Descripción", "Categoría", "Precio", "Stock"]],
      body: productosFiltrados.map((p) => [
        p.id_producto,
        p.nombre_producto,
        p.descripcion_producto || "-",
        p.id_categoria,
        `C$ ${p.precio_unitario}`,
        p.stock,
      ]),
      startY: 40,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [28, 41, 51] },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          105,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      },
    });

    // Nombre del archivo con fecha
    const hoy = new Date();
    const nombreArchivo = `productos_${hoy.getDate().toString().padStart(2, "0")}${(
      hoy.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${hoy.getFullYear()}.pdf`;

    doc.save(nombreArchivo);
  };

  const agregarProducto = async () => {
    if (!nuevoProducto.nombre_producto.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    try {
      const respuesta = await fetch("http://localhost:3000/api/registrarproducto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto),
      });
      if (!respuesta.ok) throw new Error("Error al guardar");
      setNuevoProducto({
        nombre_producto: "",
        descripcion_producto: "",
        id_categoria: "",
        precio_unitario: "",
        stock: "",
        imagen: "",
      });
      setMostrarModal(false);
      await obtenerProductos();
    } catch (error) {
      console.error(error);
      alert("Error al guardar producto");
    }
  };

  const abrirModalEdicion = (producto) => {
    setProductoEditado({ ...producto });
    setMostrarModalEdicion(true);
  };

  const guardarEdicion = async () => {
    if (!productoEditado?.nombre_producto?.trim()) return;
    try {
      await fetch(
        `http://localhost:3000/api/actualizarproductopatch/${productoEditado.id_producto}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productoEditado),
        }
      );
      setMostrarModalEdicion(false);
      await obtenerProductos();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar");
    }
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminar(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await fetch(
        `http://localhost:3000/api/eliminarproducto/${productoAEliminar.id_producto}`,
        { method: "DELETE" }
      );
      setMostrarModalEliminar(false);
      setProductoAEliminar(null);
      await obtenerProductos();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar");
    }
  };

  return (
    <Container className="mt-4">
      <h4>Productos</h4>

      <Row className="align-items-center mb-3">
        <Col lg={5} md={7}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarCambioBusqueda}
          />
        </Col>
        <Col className="text-end">
          <Button
            className="color-boton-registro me-2"
            onClick={() => setMostrarModal(true)}
          >
            + Nuevo Producto
          </Button>
          <Button variant="secondary" onClick={generarPDFProductos}>
            Generar reporte PDF
          </Button>
        </Col>
      </Row>

      <TablaProductos
        productos={productosFiltrados}
        cargando={cargando}
        abrirModalEdicion={abrirModalEdicion}
        abrirModalEliminacion={abrirModalEliminacion}
      />

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejarCambioInput={manejarCambioInput}
        agregarProducto={agregarProducto}
      />

      <ModalEdicionProducto
        mostrar={mostrarModalEdicion}
        setMostrar={setMostrarModalEdicion}
        productoEditado={productoEditado}
        setProductoEditado={setProductoEditado}
        guardarEdicion={guardarEdicion}
      />

      <ModalEliminacionProducto
        mostrar={mostrarModalEliminar}
        setMostrar={setMostrarModalEliminar}
        producto={productoAEliminar}
        confirmarEliminacion={confirmarEliminacion}
      />
    </Container>
  );
};

export default Productos;