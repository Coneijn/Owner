// lib/otp.ts
import { authenticator } from '@otplib/preset-default';
import QRCode from 'qrcode';

// Configura opciones si es necesario (opcional)
authenticator.options = { window: 1 }; // Ventana de 1 para tolerar ligeros desajustes de tiempo

/**
 * Genera un secreto único para el usuario y la URL para el QR.
 * @param email Email del usuario para mostrar en la app Authy/Google Auth
 */
export const generateTwoFactorSecret = async (email: string) => {
  const secret = authenticator.generateSecret();
  
  // El nombre de la app que aparecerá en Google Authenticator
  const appName = 'Dueño a Dueño Admin'; 
  
  const otpauth = authenticator.keyuri(email, appName, secret);
  
  // Generar imagen QR en base64
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return {
    secret,
    qrCodeUrl
  };
};

/**
 * Verifica el token ingresado por el usuario contra su secreto guardado.
 */
// lib/otp.ts
export const generateQrFromSecret = async (email: string, secret: string) => {
    const appName = 'Dueño a Dueño Admin'; 
    const otpauth = authenticator.keyuri(email, appName, secret);
    return await QRCode.toDataURL(otpauth);
  };
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