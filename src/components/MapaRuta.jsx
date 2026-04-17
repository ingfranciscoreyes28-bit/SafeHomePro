/**
 * MapaRuta
 *
 * Componente reutilizable de mapa para rutas.
 *
 * modo="editable"  → Admin: búsqueda de dirección con autocompletado,
 *                    pins arrastrables, llama a onChange con coordenadas.
 * modo="readonly"  → Conductor/Apoderado: muestra los puntos y la línea dorada.
 *
 * Props:
 *   modo        "editable" | "readonly"
 *   coordenadas { lat_inicio, lng_inicio, punto_inicio,
 *                 lat_final,  lng_final,  punto_final }
 *   onChange    fn({ lat_inicio, lng_inicio, punto_inicio,
 *                    lat_final,  lng_final,  punto_final })
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { OpenStreetMapProvider } from 'leaflet-geosearch'
import '../styles/MapaRuta.css'

// ── Centro por defecto: Santiago de Chile ──
const CENTRO_CHILE = [-33.4489, -70.6693]
const ZOOM_INICIAL = 12

// ── Iconos SVG personalizados ──
function crearIcono(color, letra) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px;height:44px;position:relative;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      ">
        <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z"
                fill="${color}" />
          <circle cx="18" cy="18" r="9" fill="white" opacity="0.9"/>
          <text x="18" y="23" text-anchor="middle"
                font-size="11" font-weight="700"
                font-family="system-ui,sans-serif"
                fill="${color}">${letra}</text>
        </svg>
      </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  })
}

const ICONO_INICIO  = crearIcono('#22c55e', 'A')
const ICONO_DESTINO = crearIcono('#ef4444', 'B')

const provider = new OpenStreetMapProvider({
  params: { countrycodes: 'cl', addressdetails: 1 },
})

// ── Componente ────────────────────────────────────────────────

export default function MapaRuta({ modo = 'readonly', coordenadas = {}, onChange }) {
  const mapaRef      = useRef(null)
  const mapaInst     = useRef(null)
  const markerInicio = useRef(null)
  const markerFinal  = useRef(null)
  const lineaRef     = useRef(null)

  const [busqInicio, setBusqInicio]   = useState(coordenadas.punto_inicio || '')
  const [busqFinal, setBusqFinal]     = useState(coordenadas.punto_final  || '')
  const [sugsInicio, setSugsInicio]   = useState([])
  const [sugsFinal, setSugsFinal]     = useState([])
  const [buscandoI, setBuscandoI]     = useState(false)
  const [buscandoF, setBuscandoF]     = useState(false)

  const [coords, setCoords] = useState({
    lat_inicio:   coordenadas.lat_inicio   ?? null,
    lng_inicio:   coordenadas.lng_inicio   ?? null,
    punto_inicio: coordenadas.punto_inicio ?? '',
    lat_final:    coordenadas.lat_final    ?? null,
    lng_final:    coordenadas.lng_final    ?? null,
    punto_final:  coordenadas.punto_final  ?? '',
  })

  // ── Inicializar mapa ────────────────────────────────────────

  useEffect(() => {
    if (mapaInst.current) return
    if (!mapaRef.current) return

    const mapa = L.map(mapaRef.current, {
      center: CENTRO_CHILE,
      zoom: ZOOM_INICIAL,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CartoDB',
      maxZoom: 19,
    }).addTo(mapa)

    mapaInst.current = mapa

    return () => {
      mapa.remove()
      mapaInst.current = null
    }
  }, [])

  // ── Dibujar / actualizar marcadores y línea ─────────────────

  const actualizarMapa = useCallback((c) => {
    const mapa = mapaInst.current
    if (!mapa) return

    // Marcador inicio
    if (c.lat_inicio != null && c.lng_inicio != null) {
      const pos = [c.lat_inicio, c.lng_inicio]
      if (markerInicio.current) {
        markerInicio.current.setLatLng(pos)
      } else {
        markerInicio.current = L.marker(pos, {
          icon: ICONO_INICIO,
          draggable: modo === 'editable',
        }).addTo(mapa)

        if (modo === 'editable') {
          markerInicio.current.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng()
            setCoords(prev => {
              const next = { ...prev, lat_inicio: lat, lng_inicio: lng }
              onChange?.(next)
              actualizarLinea(next)
              return next
            })
          })
        }
      }
    }

    // Marcador final
    if (c.lat_final != null && c.lng_final != null) {
      const pos = [c.lat_final, c.lng_final]
      if (markerFinal.current) {
        markerFinal.current.setLatLng(pos)
      } else {
        markerFinal.current = L.marker(pos, {
          icon: ICONO_DESTINO,
          draggable: modo === 'editable',
        }).addTo(mapa)

        if (modo === 'editable') {
          markerFinal.current.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng()
            setCoords(prev => {
              const next = { ...prev, lat_final: lat, lng_final: lng }
              onChange?.(next)
              actualizarLinea(next)
              return next
            })
          })
        }
      }
    }

    actualizarLinea(c)

    // Ajustar vista si hay los 2 puntos
    if (c.lat_inicio && c.lng_inicio && c.lat_final && c.lng_final) {
      mapa.fitBounds([
        [c.lat_inicio, c.lng_inicio],
        [c.lat_final,  c.lng_final],
      ], { padding: [48, 48] })
    } else if (c.lat_inicio && c.lng_inicio) {
      mapa.setView([c.lat_inicio, c.lng_inicio], 14)
    } else if (c.lat_final && c.lng_final) {
      mapa.setView([c.lat_final, c.lng_final], 14)
    }
  }, [modo, onChange])

  function actualizarLinea(c) {
    const mapa = mapaInst.current
    if (!mapa) return

    if (lineaRef.current) {
      mapa.removeLayer(lineaRef.current)
      lineaRef.current = null
    }

    if (c.lat_inicio && c.lng_inicio && c.lat_final && c.lng_final) {
      lineaRef.current = L.polyline(
        [[c.lat_inicio, c.lng_inicio], [c.lat_final, c.lng_final]],
        { color: '#F5C518', weight: 3, opacity: 0.85, dashArray: '8 6' }
      ).addTo(mapa)
    }
  }

  // Cuando coordenadas (prop) cambian desde afuera (modo readonly)
  useEffect(() => {
    if (!mapaInst.current) return
    const c = {
      lat_inicio:   coordenadas.lat_inicio   ?? null,
      lng_inicio:   coordenadas.lng_inicio   ?? null,
      punto_inicio: coordenadas.punto_inicio ?? '',
      lat_final:    coordenadas.lat_final    ?? null,
      lng_final:    coordenadas.lng_final    ?? null,
      punto_final:  coordenadas.punto_final  ?? '',
    }
    setCoords(c)
    actualizarMapa(c)
  }, [
    coordenadas.lat_inicio,
    coordenadas.lng_inicio,
    coordenadas.lat_final,
    coordenadas.lng_final,
    actualizarMapa,
  ])

  // ── Búsqueda de direcciones ─────────────────────────────────

  const buscarDireccion = useCallback(async (texto, setSugs, setCargando) => {
    if (texto.length < 3) { setSugs([]); return }
    setCargando(true)
    try {
      const resultados = await provider.search({ query: texto })
      setSugs(resultados.slice(0, 5))
    } catch {
      setSugs([])
    } finally {
      setCargando(false)
    }
  }, [])

  // Debounce para no spamear Nominatim
  const timerI = useRef(null)
  const timerF = useRef(null)

  function handleCambioInicio(val) {
    setBusqInicio(val)
    clearTimeout(timerI.current)
    timerI.current = setTimeout(() => buscarDireccion(val, setSugsInicio, setBuscandoI), 400)
  }

  function handleCambioFinal(val) {
    setBusqFinal(val)
    clearTimeout(timerF.current)
    timerF.current = setTimeout(() => buscarDireccion(val, setSugsFinal, setBuscandoF), 400)
  }

  function seleccionarInicio(sug) {
    const next = {
      ...coords,
      lat_inicio:   sug.y,
      lng_inicio:   sug.x,
      punto_inicio: sug.label,
    }
    setBusqInicio(sug.label)
    setSugsInicio([])
    setCoords(next)
    actualizarMapa(next)
    onChange?.(next)
  }

  function seleccionarFinal(sug) {
    const next = {
      ...coords,
      lat_final:   sug.y,
      lng_final:   sug.x,
      punto_final: sug.label,
    }
    setBusqFinal(sug.label)
    setSugsFinal([])
    setCoords(next)
    actualizarMapa(next)
    onChange?.(next)
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="mapa-ruta">

      {/* Buscadores (solo modo editable) */}
      {modo === 'editable' && (
        <div className="mapa-ruta__buscadores">

          {/* Desde */}
          <div className="mapa-ruta__campo">
            <label className="mapa-ruta__label">
              <span className="mapa-ruta__pin mapa-ruta__pin--inicio">A</span>
              Punto de inicio
            </label>
            <div className="mapa-ruta__input-wrap">
              <input
                type="text"
                className="sh-input"
                placeholder="Escribe una dirección..."
                value={busqInicio}
                onChange={e => handleCambioInicio(e.target.value)}
                autoComplete="off"
              />
              {buscandoI && <span className="mapa-ruta__spinner" />}
              {sugsInicio.length > 0 && (
                <ul className="mapa-ruta__sugerencias">
                  {sugsInicio.map((s, i) => (
                    <li key={i} onMouseDown={() => seleccionarInicio(s)}>
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Hasta */}
          <div className="mapa-ruta__campo">
            <label className="mapa-ruta__label">
              <span className="mapa-ruta__pin mapa-ruta__pin--final">B</span>
              Punto de destino
            </label>
            <div className="mapa-ruta__input-wrap">
              <input
                type="text"
                className="sh-input"
                placeholder="Escribe una dirección..."
                value={busqFinal}
                onChange={e => handleCambioFinal(e.target.value)}
                autoComplete="off"
              />
              {buscandoF && <span className="mapa-ruta__spinner" />}
              {sugsFinal.length > 0 && (
                <ul className="mapa-ruta__sugerencias">
                  {sugsFinal.map((s, i) => (
                    <li key={i} onMouseDown={() => seleccionarFinal(s)}>
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Labels de solo lectura */}
      {modo === 'readonly' && coords.punto_inicio && coords.punto_final && (
        <div className="mapa-ruta__labels-readonly">
          <div className="mapa-ruta__label-readonly">
            <span className="mapa-ruta__pin mapa-ruta__pin--inicio">A</span>
            <span>{coords.punto_inicio}</span>
          </div>
          <div className="mapa-ruta__label-readonly mapa-ruta__label-readonly--sep">→</div>
          <div className="mapa-ruta__label-readonly">
            <span className="mapa-ruta__pin mapa-ruta__pin--final">B</span>
            <span>{coords.punto_final}</span>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div ref={mapaRef} className="mapa-ruta__canvas" />

      {/* Ayuda editable */}
      {modo === 'editable' && (
        <p className="mapa-ruta__ayuda">
          💡 Busca las direcciones arriba. Los pins se pueden arrastrar para ajustar la posición exacta.
        </p>
      )}

    </div>
  )
}
