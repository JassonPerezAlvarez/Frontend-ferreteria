import { Modal, Table, Button } from 'react-bootstrap';

const ModalDetallesCompra = ({ mostrarModal, setMostrarModal, detalles }) => {
  // Si por algún motivo detalles viene vacío o undefined
  if (!detalles || detalles.length === 0) {
    detalles = [];
  }

  const totalCompra = detalles
    .reduce((suma, d) => suma + (d.cantidad * d.precio_unitario), 0)
    .toFixed(2);

  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="xl" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Detalles de la Compra</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Table striped bordered hover responsive className="table-sm">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th className="text-center">Cantidad</th>
              <th className="text-end">Precio Unitario</th>
              <th className="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detalles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  No hay productos registrados en esta compra.
                </td>
              </tr>
            ) : (
              detalles.map((detalle, index) => (
                <tr key={detalle.id_detalle_compra}>
                  <td>{index + 1}</td>
                  <td>{detalle.nombre_producto || 'Producto sin nombre'}</td>
                  <td className="text-center">{detalle.cantidad}</td>
                  <td className="text-end">
                    C$ {parseFloat(detalle.precio_unitario).toFixed(2)}
                  </td>
                  <td className="text-end">
                    C$ {(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>

            {/* Total general */}
            {detalles.length > 0 && (
              <tfoot className="table-success fw-bold">
                <tr>
                  <td colSpan={4} className="text-end">TOTAL COMPRA:</td>
                  <td className="text-end">C$ {totalCompra}</td>
                </tr>
              </tfoot>
            )}
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalDetallesCompra;