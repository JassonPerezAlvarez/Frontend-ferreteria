import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import CuadroBusquedas from '../components/busquedas/CuadroBusquedas';

/* eslint-disable no-empty */

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);

  const [ventaAEditar, setVentaAEditar] = useState(null);
  const [ventaAEliminar, setVentaAEliminar] = useState(null);
  const [detallesVenta, setDetallesVenta] = useState([]);

  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [productos, setProductos] = useState([]);

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;
  const hoy = new Date().toISOString().split('T')[0];

  const [nuevaVenta, setNuevaVenta] = useState({
    id_cliente: '',
    id_empleado: '',
    fecha_venta: hoy,
    total_venta: 0
  });

  const [ventaEnEdicion, setVentaEnEdicion] = useState(null);
  const [detallesNuevos, setDetallesNuevos] = useState([]);

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  const obtenerNombreCliente = async (id) => {
    if (!id) return '—';
    try {
      const res = await fetch(`http://localhost:3000/api/clientes/${id}`);
      if (!res.ok) return '—';
      const data = await res.json();
      return `${data.primer_nombre} ${data.primer_apellido}`;
    } catch { return '—'; }
  };

  const obtenerNombreEmpleado = async (id) => {
    if (!id) return '—';
    try {
      const res = await fetch(`http://localhost:3000/api/empleado/${id}`);
      if (!res.ok) return '—';
      const data = await res.json();
      return `${data.primer_nombre} ${data.primer_apellido}`;
    } catch { return '—'; }
  };

  const obtenerNombreProducto = async (id) => {
    if (!id) return '—';
    try {
      const res = await fetch(`http://localhost:3000/api/productos/${id}`);
      if (!res.ok) return '—';
      const data = await res.json();
      return data.nombre_producto || '—';
    } catch { return '—'; }
  };

  const obtenerVentas = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/ventas');
      if (!res.ok) throw new Error();
      const ventasRaw = await res.json();
      const ventasConNombres = await Promise.all(
        ventasRaw.map(async (v) => ({
          ...v,
          nombre_cliente: await obtenerNombreCliente(v.id_cliente),
          nombre_empleado: await obtenerNombreEmpleado(v.id_empleado)
        }))
      );
      setVentas(ventasConNombres);
      setVentasFiltradas(ventasConNombres);
      setCargando(false);
    } catch {
      alert('Error al cargar ventas');
      setCargando(false);
    }
  };

  const obtenerDetallesVenta = async (id_venta) => {
    try {
      const res = await fetch('http://localhost:3000/api/detalles_ventas');
      if (!res.ok) throw new Error();
      const todos = await res.json();
      const filtrados = todos.filter(d => d.id_venta === parseInt(id_venta));
      const detalles = await Promise.all(
        filtrados

.map(async (d) => ({
          ...d,
          nombre_producto: await obtenerNombreProducto(d.id_producto)
        }))
      );
      setDetallesVenta(detalles);
      setMostrarModalDetalles(true);
    } catch {
      alert('No se pudieron cargar los detalles');
    }
  };

  const cargarCatalogos = async () => {
    try { const r = await fetch('http://localhost:3000/api/clientes'); const d = await r.json(); setClientes(d); } catch {}
    try { const r = await fetch('http://localhost:3000/api/empleado'); const d = await r.json(); setEmpleados(d); } catch {}
    try { const r = await fetch('http://localhost:3000/api/productos'); const d = await r.json(); setProductos(d); } catch {}
  };

  const manejarCambioBusqueda = (e) => {
    const texto = e.target.value.toLowerCase();
    setTextoBusqueda(texto);
    const filtrados = ventas.filter(v =>
      v.id_venta.toString().includes(texto) ||
      v.nombre_cliente?.toLowerCase().includes(texto) ||
      v.nombre_empleado?.toLowerCase().includes(texto)
    );
    setVentasFiltradas(filtrados);
    setPaginaActual(1);
  };

  const agregarVenta = async () => {
    if (!nuevaVenta.id_cliente || !nuevaVenta.id_empleado || detallesNuevos.length === 0) {
      alert('Completa cliente, empleado y al menos un producto');
      return;
    }
    const total = detallesNuevos.reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0);
    try {
      const res = await fetch('http://localhost:3000/api/registrarventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nuevaVenta, total_venta: total })
      });
      if (!res.ok) throw new Error();
      const { id_venta } = await res.json();
      for (const d of detallesNuevos) {
        await fetch('http://localhost:3000/api/registrardetalle_venta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...d, id_venta })
        });
      }
      await obtenerVentas();
      setMostrarModalRegistro(false);
      setNuevaVenta({ id_cliente: '', id_empleado: '', fecha_venta: hoy, total_venta: 0 });
      setDetallesNuevos([]);
    } catch {
      alert('Error al registrar la venta');
    }
  };

  const abrirModalEdicion = async (venta) => {
    setVentaAEditar(venta);
    setVentaEnEdicion({
      id_cliente: venta.id_cliente,
      id_empleado: venta.id_empleado,
      fecha_venta: new Date(venta.fecha_venta).toISOString().split('T')[0]
    });
    const res = await fetch('http://localhost:3000/api/detalles_ventas');
    const todos = await res.json();
    const detallesRaw = todos.filter(d => d.id_venta === venta.id_venta);
    const detalles = await Promise.all(
      detallesRaw.map(async (d) => ({
        id_producto: d.id_producto,
        nombre_producto: await obtenerNombreProducto(d.id_producto),
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario
      }))
    );
    setDetallesNuevos(detalles);
    setMostrarModalEdicion(true);
  };

  const actualizarVenta = async () => {
    const total = detallesNuevos.reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0);
    try {
      await fetch(`http://localhost:3000/api/actualizarventapatch/${ventaAEditar.id_venta}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ventaEnEdicion, total_venta: total })
      });
      const res = await fetch('http://localhost:3000/api/detalles_ventas');
      const todos = await res.json();
      const actuales = todos.filter(d => d.id_venta === ventaAEditar.id_venta);
      for (const d of actuales) {
        await fetch(`http://localhost:3000/api/eliminardetalles_ventas/${d.id_detalle_venta}`, { method: 'DELETE' });
      }
      for (const d of detallesNuevos) {
        await fetch('http://localhost:3000/api/registrardetalle_venta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...d, id_venta: ventaAEditar.id_venta })
        });
      }
      await obtenerVentas();
      setMostrarModalEdicion(false);
      setVentaAEditar(null);
      setVentaEnEdicion(null);
      setDetallesNuevos([]);
    } catch {
      alert('No se pudo actualizar la venta');
    }
  };

  const abrirModalEliminacion = (venta) => {
    setVentaAEliminar(venta);
    setMostrarModalEliminar(true);
  };

  const eliminarVenta = async () => {
    try {
      await fetch(`http://localhost:3000/api/eliminarventa/${ventaAEliminar.id_venta}`, { method: 'DELETE' });
      await obtenerVentas();
      setMostrarModalEliminar(false);
    } catch {
      alert('No se pudo eliminar la venta');
    }
  };

  useEffect(() => {
    obtenerVentas();
    cargarCatalogos();
  }, []);

  return (
    <Container className="mt-4">
      <h4>Ventas</h4>

      <Row className="align-items-center mb-3">
        <Col lg={5} md={6}>
          <CuadroBusquedas textoBusqueda={textoBusqueda} manejarCambioBusqueda={manejarCambioBusqueda} />
        </Col>
        <Col className="text-end">
          <Button className="color-boton-registro" onClick={() => setMostrarModalRegistro(true)}>
            + Nueva Venta
          </Button>
        </Col>
      </Row>

      <TablaVentas
        ventas={ventasPaginadas}
        cargando={cargando}
        obtenerDetalles={obtenerDetallesVenta}
        abrirModalEdicion={abrirModalEdicion}
        abrirModalEliminacion={abrirModalEliminacion}
        totalElementos={ventasFiltradas.length}
        elementosPorPagina={elementosPorPagina}
        paginaActual={paginaActual}
        establecerPaginaActual={setPaginaActual}
      />

      <ModalRegistroVenta
        mostrar={mostrarModalRegistro}
        setMostrar={setMostrarModalRegistro}
        nuevaVenta={nuevaVenta}
        setNuevaVenta={setNuevaVenta}
        detalles={detallesNuevos}
        setDetalles={setDetallesNuevos}
        clientes={clientes}
        empleados={empleados}
        productos={productos}
        agregarVenta={agregarVenta}
        hoy={hoy}
      />

      <ModalEdicionVenta
        mostrar={mostrarModalEdicion}
        setMostrar={setMostrarModalEdicion}
        venta={ventaAEditar}
        ventaEnEdicion={ventaEnEdicion}
        setVentaEnEdicion={setVentaEnEdicion}
        detalles={detallesNuevos}
        setDetalles={setDetallesNuevos}
        clientes={clientes}
        empleados={empleados}
        productos={productos}
        actualizarVenta={actualizarVenta}
      />

      <ModalEliminacionVenta
        mostrar={mostrarModalEliminar}
        setMostrar={setMostrarModalEliminar}
        venta={ventaAEliminar}
        confirmarEliminacion={eliminarVenta}
      />

      <ModalDetallesVenta
        mostrarModal={mostrarModalDetalles}
        setMostrarModal={() => setMostrarModalDetalles(false)}
        detalles={detallesVenta}
      />
    </Container>
  );
};

export default Ventas;