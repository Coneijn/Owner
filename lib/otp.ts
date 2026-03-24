// lib/otp.ts
import { authenticator } from '@otplib/preset-default';
import QRCode from 'qrcode';

// Configura opciones si es necesario (opcional)
authenticator.options = { window: 1 }; // Ventana de 1 para tolerar ligeros desajustes de tiempo

/**
 * Genera un secreto único para el usuario y la URL para el QR.
 * @param email Email del usuario para mostrar en la app Authy/Google Auth
 * @param role Rol del usuario para identificar la cuenta (ej. ADMIN, SELLER)
 */
export const generateTwoFactorSecret = async (email: string, role: string = 'USER') => {
  const secret = authenticator.generateSecret();
  
  // 👇 Construimos el nombre de la app dinámicamente usando el rol
  const appName = `d2d ${role}`; 
  
  const otpauth = authenticator.keyuri(email, appName, secret);
  
  // Generar imagen QR en base64
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return {
    secret,
    qrCodeUrl
  };
};

/**
 * Genera un nuevo QR a partir de un secreto ya existente.
 */
export const generateQrFromSecret = async (email: string, secret: string, role: string = 'USER') => {
    // 👇 Aplicamos el mismo cambio aquí
    const appName = `d2d ${role}`; 
    const otpauth = authenticator.keyuri(email, appName, secret);
    
    return await QRCode.toDataURL(otpauth);
};

/**
 * Verifica el token ingresado por el usuario contra su secreto guardado.
 */
export const verifyTwoFactorToken = (token: string, secret: string) => {
    try {
      // Imprime esto en tu terminal del servidor
      console.log(`--- DEBUG 2FA ---`);
      console.log(`Token recibido: ${token}`);
      console.log(`Secreto usado: ${secret}`);
      
      // Verifica manualmente si el token es válido
      const isValid = authenticator.verify({ token, secret });
      console.log(`Es valido?: ${isValid}`);
      
      // Muestra el token que el servidor ESPERA en este momento
      console.log(`Token esperado por servidor: ${authenticator.generate(secret)}`);
      console.log(`-----------------`);
  
      return isValid;
    } catch (error) {
      console.error("Error verificando OTP:", error);
      return false;
    }
};