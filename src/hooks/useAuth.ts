import { useContext } from "react";

import { AuthContext } from "../context/AuthContextBase";

// Hook para acceder a la sesión del usuario.
function useAuth() {
  const context = useContext(AuthContext);

  // Evita utilizar el hook fuera de AuthProvider.
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}

export default useAuth;
