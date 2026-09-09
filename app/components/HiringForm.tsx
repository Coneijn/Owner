"use client";

import { useState } from "react";
import { getPresignedUrl } from "@/lib/s3-actions"; // Importamos tu accion de S3

export default function HiringForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const file = formData.get("resume") as File;
    let resumeUrl = "Sin archivo";

    try {
      // 1. Subir el archivo a AWS S3 si el usuario selecciono uno
      if (file && file.size > 0) {
        // Pedimos la URL firmada a tu backend (guardandolo en una carpeta llamada "resumes")
        const { signedUrl, publicUrl } = await getPresignedUrl(file.type, "resumes");
        
        // Subimos el archivo fisicamente a S3 usando la URL firmada
        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Fallo la subida del curriculum a S3.");
        }
        
        // Si se subio bien, guardamos la URL publica
        resumeUrl = publicUrl;
      }

      // 2. Armamos un objeto JSON con el texto y la URL publica del CV
      const payload = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        resume_url: resumeUrl, // Mandamos la liga al CRM en vez del archivo
      };

      // 3. Enviar los datos a LeadConnector en formato JSON
      const webhookUrl = "https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/4b3c88c1-7d78-479e-9958-60ff418658a6";
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorText = await response.text();
        console.error("Detalles del servidor GHL:", response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (err) {
      setError("Hubo un problema al enviar tus datos. Intentalo de nuevo.");
      console.error("Error capturado:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-brand-dark text-white p-8 rounded-xl text-center shadow-lg border border-white/10">
        <h2 className="text-2xl font-bold text-brand-accent mb-2">Thanks for applying!</h2>
        <p>We got your info y tu resume. We will be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-brand-dark p-6 sm:p-8 rounded-xl shadow-lg border border-white/10 flex flex-col gap-4 text-white">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name / Nombre completo</label>
        <input type="text" id="name" name="name" required
          className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:border-brand-accent"
          placeholder="Ej. John Doe"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone number / Telefono</label>
        <input type="tel" id="phone" name="phone" required
          className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:border-brand-accent"
          placeholder="Ej. 555 123 4567"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email address / Correo electronico</label>
        <input type="email" id="email" name="email" required
          className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-2 focus:outline-none focus:border-brand-accent"
          placeholder="you@email.com"
        />
      </div>

      <div>
        <label htmlFor="resume" className="block text-sm font-medium mb-1">Resume (PDF, Word)</label>
        <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" required
          className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
        />
      </div>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <button type="submit" disabled={isSubmitting}
        className="mt-4 w-full bg-brand-accent text-brand-dark font-bold text-lg py-3 px-4 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
        {isSubmitting ? "Submitting..." : "Apply now / Enviar postulacion"}
      </button>
    </form>
  );
}