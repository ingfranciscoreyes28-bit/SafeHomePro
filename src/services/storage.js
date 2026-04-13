import { supabase } from './supabase'

/**
 * Sube una imagen a un bucket publico de Supabase Storage.
 * Valida tipo MIME y tamaño antes de subir.
 *
 * @param {string} bucket - Nombre del bucket ('fotos-conductores' | 'fotos-furgones')
 * @param {File}   archivo - Objeto File seleccionado por el usuario
 * @param {string} idRegistro - ID del conductor o furgon (para generar nombre unico)
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function subirFoto(bucket, archivo, idRegistro) {
  // 1. Validar tipo MIME
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']
  if (!tiposPermitidos.includes(archivo.type)) {
    throw new Error('Formato no permitido. Usa JPG, PNG o WEBP.')
  }

  // 2. Validar tamaño (2 MB maximo)
  if (archivo.size > 2 * 1024 * 1024) {
    throw new Error('La imagen no puede superar 2 MB.')
  }

  // 3. Generar nombre unico
  const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
  const extension = extMap[archivo.type]
  const nombreArchivo = `${idRegistro}-${Date.now()}.${extension}`

  // 4. Subir a Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(nombreArchivo, archivo, { upsert: true, cacheControl: '3600' })

  if (uploadError) throw uploadError

  // 5. Obtener URL publica
  const { data } = supabase.storage.from(bucket).getPublicUrl(nombreArchivo)

  return { url: data.publicUrl, path: nombreArchivo }
}

/**
 * Elimina una imagen de un bucket de Supabase Storage.
 * Si path es null o vacio, no hace nada.
 *
 * @param {string} bucket - Nombre del bucket
 * @param {string|null} path - Nombre del archivo en el bucket
 */
export async function eliminarFoto(bucket, path) {
  if (!path) return
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
