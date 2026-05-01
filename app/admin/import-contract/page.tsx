"use client";

import { useState } from "react";
import Papa from "papaparse";
import { processContractImport, simulatePaymentsForContract, simulatePaymentsForLease } from "@/app/actions/import-contract";

export default function ImportContractPage() {
  const [propertyId, setPropertyId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Nuevos estados para pagos simulados en contratos nuevos
  const [simulatedPaymentsNew, setSimulatedPaymentsNew] = useState(0);

  // Nuevos estados para la sección de contratos existentes
  const [existingContractId, setExistingContractId] = useState("");
  const [existingContractType, setExistingContractType] = useState<"LOAN" | "LEASE">("LOAN");
  const [simulatedPaymentsExisting, setSimulatedPaymentsExisting] = useState(1);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [messageExisting, setMessageExisting] = useState("");

  // Manejador temporal para contratos existentes
  const handleSimulateExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingContractId || simulatedPaymentsExisting <= 0) return;
    
    setLoadingExisting(true);
    setMessageExisting("");
    try {
      let response;
      
      // Ejecutamos la simulación mes a mes en un bucle
      for (let i = 0; i < simulatedPaymentsExisting; i++) {
        if (existingContractType === "LOAN") {
          // Mandamos a simular de 1 en 1. El backend solo debe:
          // 1. Cambiar el estatus del pago actual a PAID
          // 2. Crear el del mes siguiente en PENDING
          response = await simulatePaymentsForContract(existingContractId, 1);
        } else {
          response = await simulatePaymentsForLease(existingContractId, 1);
        }
        
        if (!response || !response.success) {
          setMessageExisting(`Error en el avance del mes ${i + 1}: ${response?.error}`);
          setLoadingExisting(false);
          return; // Detenemos el bucle si falla un mes
        }
      }
      
      setMessageExisting(`Se procesaron ${simulatedPaymentsExisting} meses correctamente.`);
    } catch (error) {
      setMessageExisting("Error al intentar simular los pagos.");
    }
    setLoadingExisting(false);
  };

  
  // Función auxiliar para limpiar monedas: "$ 260,000 " -> 260000
  const cleanNumber = (str: string) => {
    if (!str) return 0;
    return parseFloat(str.replace(/[^0-9.-]+/g, ""));
  };
const formatPhoneE164 = (phoneStr: string) => {
    if (!phoneStr) return "";
    const cleaned = phoneStr.replace(/\D/g, ""); // Quita puntos, guiones, espacios
    if (cleaned.length === 11 && cleaned.startsWith("1")) return `+${cleaned}`;
    if (cleaned.length === 10) return `+1${cleaned}`;
    return `+${cleaned}`; // Fallback genérico
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !propertyId) {
      setMessage("Por favor selecciona una propiedad y un archivo CSV.");
      return;
    }

    setLoading(true);
    setMessage("");

    Papa.parse(file, {
      complete: async (results) => {
        const data = results.data as string[][];

        try {
          // Extracción de datos basada en las celdas exactas del CSV
          const fullName = data[2][3] || "";
          const nameParts = fullName.split(" ");
          
          const payload = {
            propertyId,
            clientInfo: {
              name: fullName,
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
            phone: formatPhoneE164(data[2][4]),
            email: data[2][5] || "",
            },
            loanInfo: {
              totalAmount: cleanNumber(data[2][1]),
              downPayment: cleanNumber(data[3][1]),
              principalAmount: cleanNumber(data[4][1]),
              termInYears: parseInt(data[5][1] || "30"),
              interestRate: cleanNumber(data[6][1]),
              startDate: data[13][1], // "1/2/2026"
              monthlyTaxes: cleanNumber(data[9][1]),
              monthlyInsurance: cleanNumber(data[10][1]),
              monthlyServFee: cleanNumber(data[11][1]),
            },
            payments: data.slice(16).map((row, index) => {
              const paymentDateObj = new Date(row[0]);
              
              // Verificamos si es pasado o si entra en la cantidad de simulados solicitados
              const isPastPayment = paymentDateObj < new Date();
              const isSimulated = index < simulatedPaymentsNew;
              const isPaid = isPastPayment || isSimulated;
              
              return {
                paymentDate: paymentDateObj.toISOString(), 
                totalDue: cleanNumber(row[1]),
                interest: cleanNumber(row[2]),
                principal: cleanNumber(row[3]),
                remainingBalance: cleanNumber(row[4]),
                status: isPaid ? 'PAID' : 'PENDING',
                paidAt: isPaid ? new Date(row[0]).toISOString() : null,
              };
            }),
          };
          
          const response = await processContractImport(payload);
          
          if (response.success) {
            setMessage("¡Contrato importado exitosamente!");
            setFile(null);
          } else {
            setMessage(`Error: ${response.error}`);
          }
        } catch (error) {
          setMessage("Error al procesar el formato del CSV. Asegúrate de que es el formato correcto.");
        }
        setLoading(false);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Importar Contrato y Tabla de Amortización</h1>
      
      <form onSubmit={handleImport} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID de la Propiedad (Property ID)
          </label>
          <input
            type="text"
            required
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. clr123..."
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          />
          {/* Opcional: Reemplazar este input por un <select> que cargue tus propiedades */}
        </div>
<div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo CSV (Rental Tracking)
          </label>
          <input
            type="file"
            accept=".csv"
            required
            className="w-full border border-gray-300 p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        
        {/* NUEVO CAMPO: Pagos simulados para el nuevo contrato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Simular Pagos Iniciales (Opcional)
          </label>
          <input
            type="number"
            min="0"
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. 3 para marcar los primeros 3 meses como PAID"
            value={simulatedPaymentsNew || ""}
            onChange={(e) => setSimulatedPaymentsNew(Number(e.target.value))}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Procesando e Importando..." : "Crear Usuario y Cargar Contrato"}
        </button>
        {message && (
          <div className={`p-4 rounded ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message}
          </div>
        )}
      </form>

      <hr className="my-10 border-gray-300" />

      {/* SECCIÓN NUEVA: Para contratos ya existentes */}
      <h2 className="text-xl font-bold mb-6 text-gray-800">Simular Pagos en Contrato Existente</h2>
      <form onSubmit={handleSimulateExisting} className="space-y-6">
        <div className="flex gap-6 mb-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              value="LOAN" 
              checked={existingContractType === "LOAN"} 
              onChange={() => setExistingContractType("LOAN")}
              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-gray-700 font-medium">Venta (Loan)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="radio" 
              value="LEASE" 
              checked={existingContractType === "LEASE"} 
              onChange={() => setExistingContractType("LEASE")}
              className="text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-gray-700 font-medium">Renta (Lease)</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID del Contrato / Lease
          </label>
          <input
            type="text"
            required
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. clr456..."
            value={existingContractId}
            onChange={(e) => setExistingContractId(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de Pagos a Simular
          </label>
          <input
            type="number"
            min="1"
            required
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
            value={simulatedPaymentsExisting}
            onChange={(e) => setSimulatedPaymentsExisting(Number(e.target.value))}
          />
        </div>
        <button
          type="submit"
          disabled={loadingExisting}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loadingExisting ? "Simulando pagos..." : "Simular Pagos"}
        </button>
        {messageExisting && (
          <div className={`p-4 rounded ${messageExisting.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {messageExisting}
          </div>
        )}
      </form>
    </div>
  );
}