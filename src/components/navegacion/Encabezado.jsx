import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";

const Encabezado = () => {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();

  // Alternar visibilidad del menú
  const manejarToggle = () => setMostrarMenu(!mostrarMenu);

 const manejarNavegacion = (ruta) => {
    navigate(ruta);
    setMostrarMenu(false);
  };

  return (
    <Navbar expand="md" fixed="top" className="bg-primary">
      <Container>
        <Navbar.Brand
          onClick={() => manejarNavegacion("/inicio")}
          className="text-white fw-bold"
          style={{ cursor: "pointer" }}
        >
          Ferretería
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="menu-offcanvas"
          onClick={manejarToggle}
          className="bg-primary"
        />
        <Navbar.Offcanvas
          id="menu-offcanvas"
          placement="end"
          show={mostrarMenu}
          onHide={() => setMostrarMenu(false)}
          >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menú principal</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-grow-1 pe-3">

              <Nav.Link
               className={mostrarMenu ? "text-dark " : "text-white"}
                onClick={() => manejarNavegacion("/inicio")}
                
                >
                    {mostrarMenu ? <i classname= "bi-house-fill me-2" ></i> : null }Inicio

                </Nav.Link>

              <Nav.Link
               className={mostrarMenu ? "text-dark " : "text-white"}
               onClick={() => manejarNavegacion("/categorias")}
               >
                {mostrarMenu ? <i classname= "bi-bookmark-plus -fill me-2" ></i> : null }Categorías
                </Nav.Link>

              <Nav.Link 
              className={mostrarMenu ? "text-dark " : "text-white"} 
              onClick={() => manejarNavegacion("/productos")}
              >
                {mostrarMenu ? <i classname= "bi-box -fill me-2" ></i> : null }Productos
                </Nav.Link>

              <Nav.Link
              className={mostrarMenu ? "text-dark " : "text-white"}
               onClick={() => manejarNavegacion("/catalogo")}
               >
                {mostrarMenu ? <i classname= "bi-images me-2" ></i> : null }Catalogo
                </Nav.Link>

               <Nav.Link  
               className={mostrarMenu ? "text-dark " : "text-white"}
                 onClick={() => manejarNavegacion("/Clientes")}
                >
                    {mostrarMenu ? <i classname= "bi-person-circle-fill me-2" ></i> : null }Clientes
                    </Nav.Link>

               <Nav.Link 
                 className={mostrarMenu ? "text-dark " : "text-white"}
                  onClick={() => manejarNavegacion("/Empleados")}
                 >
                   {mostrarMenu ? <i classname= "bi-person-badget -fill me-2" ></i> : null } Empleados
                    </Nav.Link>

               <Nav.Link  
               className={mostrarMenu ? "text-dark " : "text-white"}
                onClick={() => manejarNavegacion("/Ventas")}
                >
                   {mostrarMenu ? <i classname= "bi-cash-coin-fill me-2" ></i> : null } Ventas
                    </Nav.Link>

               <Nav.Link  
                className={mostrarMenu ? "text-dark " : "text-white"}
                 onClick={() => manejarNavegacion("/Usuarios")}
                >
                    {mostrarMenu ? <i classname= "bi-person-vcar -fill me-2" ></i> : null }Usuarios
                    </Nav.Link>

             <Nav.Link   
            className={mostrarMenu ? "text-dark " : "text-white"}
             onClick={() => manejarNavegacion("/Compras")}
             >
            {mostrarMenu ? <i classname= "bi-car-puls-fill me-2" ></i> : null }Compras
                </Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;



