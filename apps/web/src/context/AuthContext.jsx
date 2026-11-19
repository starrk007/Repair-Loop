import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { mandarPeticion } from '../services/api';

const ContextoSesion = createContext(null);

export function AuthProvider({ children }) {
  const [cuentaFirebase, setCuentaFirebase] = useState(null);
  const [datosPerfil, setDatosPerfil] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const traerPerfil = async (usuario) => {
    try {
      const perfilServidor = await mandarPeticion('/users/me');
      setDatosPerfil(perfilServidor);
    } catch {
      setDatosPerfil({
        uid: usuario.uid,
        name: usuario.displayName || 'Usuario',
        email: usuario.email,
        role: 'usuario',
      });
    }
  };

  useEffect(() => {
    const escucharCambio = onAuthStateChanged(auth, async (usuario) => {
      setCuentaFirebase(usuario);
      if (usuario) {
        await traerPerfil(usuario);
      } else {
        setDatosPerfil(null);
      }
      setCargandoSesion(false);
    });

    return () => escucharCambio();
  }, []);

  const crearCuenta = async ({ nombre, correo, clave, rol }) => {
    const credencial = await createUserWithEmailAndPassword(auth, correo, clave);
    await updateProfile(credencial.user, { displayName: nombre });

    const perfilCreado = await mandarPeticion('/users/me', {
      method: 'POST',
      body: JSON.stringify({
        name: nombre,
        role: rol,
      }),
    });

    setDatosPerfil(perfilCreado);
    return credencial.user;
  };

  const iniciarSesion = async ({ correo, clave }) => {
    const credencial = await signInWithEmailAndPassword(auth, correo, clave);
    await traerPerfil(credencial.user);
    return credencial.user;
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    setDatosPerfil(null);
  };

  return (
    <ContextoSesion.Provider
      value={{
        cuentaFirebase,
        datosPerfil,
        cargandoSesion,
        crearCuenta,
        iniciarSesion,
        cerrarSesion,
        recargarPerfil: () => cuentaFirebase && traerPerfil(cuentaFirebase),
      }}
    >
      {!cargandoSesion && children}
    </ContextoSesion.Provider>
  );
}

export function useAuth() {
  const sesion = useContext(ContextoSesion);
  if (!sesion) {
    throw new Error('Falta envolver la app en AuthProvider');
  }
  return sesion;
}