import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { cuentaFirebase, datosPerfil, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  if (!cuentaFirebase) {
    return null;
  }

  const salirDeCuenta = async () => {
    await cerrarSesion();
    navegar('/acceso');
  };

  const textoRol = datosPerfil?.rol === 'tecnico' ? 'Técnico' : 'Usuario';

  return (
    <header className="barra-superior">
      <div className="marca-sitio">
        <Link to="/solicitudes">RepairLoop</Link>
        <span className="etiqueta-rol">{textoRol}</span>
      </div>

      <nav className="enlaces-menu">
        <Link to="/perfil">Mi Perfil</Link>
        {datosPerfil?.rol === 'usuario' && (
          <Link to="/dispositivos">Mis Dispositivos</Link>
        )}
        <Link to="/solicitudes">Solicitudes</Link>
      </nav>

      <div className="zona-usuario">
        <span>{datosPerfil?.nombre || cuentaFirebase.email}</span>
        <button type="button" onClick={salirDeCuenta}>
          Salir
        </button>
      </div>
    </header>
  );
}
