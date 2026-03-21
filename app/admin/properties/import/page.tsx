'use client'

import { useState } from 'react'
import { importPropertiesFromCSV } from '@/app/actions/import-properties'
import { useRouter } from 'next/navigation'

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Por favor, selecciona un archivo CSV primero.')
      return
    }

    setLoading(true)
    setMessage('Leyendo archivo y obteniendo coordenadas...')

    try {
      // Leer el contenido del archivo como texto
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        
        // Llamar al server action
        const result = await importPropertiesFromCSV(text)

        if (result.success) {
          setMessage(`¡Éxito! Se importaron ${result.count} propiedades correctamente.`)
          {/*setTimeout(() => {
            router.push('/admin/properties') // Redirigir al panel
          }, 2000)*/}
        } else {
          setMessage(`Error: ${result.error}`)
        }
        setLoading(false)
      }
      reader.readAsText(file)
    } catch (error) {
      console.error(error)
      setMessage('Ocurrió un error inesperado al leer el archivo.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Importar Propiedades</h1>
      <p className="text-sm text-gray-600 mb-6">
        Sube el archivo CSV maestro. El sistema extraerá los datos, calculará las coordenadas mediante Google Maps y llenará los campos obligatorios del esquema.
      </p>

      <div className="flex flex-col gap-4">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange}
          className="border p-2 rounded"
          disabled={loading}
        />

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Procesando importación...' : 'Subir e Importar'}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}