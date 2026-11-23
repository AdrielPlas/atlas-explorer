import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  Polygon,
  Polyline,
  CircleMarker,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { Pencil, Trash2 } from 'lucide-react';

const iconFor = (color = '#397f91') =>
  L.divIcon({
    className: 'custom-marker-wrap',
    html: `<span class="custom-marker" style="--marker:${color}"><i></i></span>`,
    iconSize: [26, 34],
    iconAnchor: [13, 30]
  });

/**
 * Coloca el mapa en el centro indicado, pero SOLO cuando ese centro cambia
 * de verdad.
 *
 * El error anterior: center llega como valor por omision, asi que React creaba
 * un arreglo nuevo en cada render. El useEffect veia una dependencia distinta
 * cada vez y volvia a llamar a setView, de modo que cualquier cambio de estado
 * (marcar un vertice, abrir un popup, seleccionar una ubicacion) devolvia el
 * mapa a su posicion y a su zoom iniciales.
 *
 * Por eso se compara por VALOR y no por referencia: se guarda el ultimo centro
 * aplicado y, si es el mismo, no se toca la vista. Asi el encuadre que el
 * usuario dejo con el raton se respeta.
 */
function Fit({ center }) {
  const map = useMap();
  const centroAplicado = useRef(null);

  useEffect(() => {
    if (!center) return;

    const clave = `${center[0]},${center[1]}`;
    if (centroAplicado.current === clave) return;

    centroAplicado.current = clave;
    map.setView(center, 13);
  }, [center, map]);

  return null;
}

/**
 * Encuadra la zona que el usuario selecciona en la lista.
 *
 * Mismo cuidado que arriba: se guarda cual fue la ultima zona encuadrada. Sin
 * eso, al recargar la lista de zonas el objeto zonesGeo cambia de referencia y
 * el mapa volvia a encuadrar aunque el usuario no hubiera seleccionado nada
 * nuevo, moviendole la vista mientras trabajaba.
 */
function FitSelectedZone({ zonesGeo, selectedZoneId }) {
  const map = useMap();
  const zonaEncuadrada = useRef(null);

  useEffect(() => {
    if (!zonesGeo?.features || !selectedZoneId) return;
    if (zonaEncuadrada.current === String(selectedZoneId)) return;

    const feature = zonesGeo.features.find((f) => {
      const props = f.properties || {};
      const id = props.id ?? props._id ?? props.zoneId;
      return String(id) === String(selectedZoneId);
    });

    if (!feature) return;

    const bounds = L.geoJSON(feature).getBounds();
    if (bounds.isValid()) {
      zonaEncuadrada.current = String(selectedZoneId);
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 15,
        animate: true,
        duration: 0.8
      });
    }
  }, [zonesGeo, selectedZoneId, map]);

  return null;
}

function ClickCapture({ onMapClick }) {
  useMapEvents({
    click: (event) => onMapClick?.(event.latlng)
  });
  return null;
}

export default function MapView({
  locations = [],
  zonesGeo = null,
  onSelect,
  onViewDetails,
  center = [41.9028, 12.4964],
  interactive = false,
  onMapClick,
  selectedZoneId = '',
  draftPoints = [],
  // Editar y eliminar se hacen desde el propio popup del marcador.
  // canModifyLocation es una funcion y no un booleano porque el permiso
  // depende de CADA ubicacion: solo su autor, o el administrador.
  onEditLocation,
  onDeleteLocation,
  canModifyLocation = () => false
}) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="leaflet-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Fit center={center} />
      <FitSelectedZone zonesGeo={zonesGeo} selectedZoneId={selectedZoneId} />

      {interactive && <ClickCapture onMapClick={onMapClick} />}

      {draftPoints.length > 1 && (
        <Polyline
          positions={draftPoints}
          pathOptions={{ color: '#397f91', weight: 3, dashArray: '7 7' }}
        />
      )}

      {draftPoints.length >= 3 && (
        <Polygon
          positions={draftPoints}
          pathOptions={{
            color: '#397f91',
            weight: 2,
            fillColor: '#a9d3d0',
            fillOpacity: 0.22
          }}
        />
      )}

      {draftPoints.map((point, index) => (
        <CircleMarker
          key={index}
          center={point}
          radius={5}
          pathOptions={{
            color: '#fff',
            weight: 2,
            fillColor: '#397f91',
            fillOpacity: 1
          }}
        />
      ))}

      {zonesGeo && (
        <GeoJSON
          key={JSON.stringify(zonesGeo)}
          data={zonesGeo}
          style={(feature) => {
            const props = feature.properties || {};
            const featureId = props.id ?? props._id ?? props.zoneId;
            const active =
              selectedZoneId && String(featureId) === String(selectedZoneId);

            return {
              color: props.color || '#4d9275',
              weight: active ? 4 : 2,
              fillColor: props.color || '#4d9275',
              fillOpacity: active ? 0.24 : 0.08,
              dashArray: active ? '' : '5 5'
            };
          }}
        />
      )}

      {locations.map((loc) => {
        const coordinates = loc.location?.coordinates;
        const position = coordinates
          ? [Number(coordinates[1]), Number(coordinates[0])]
          : [Number(loc.latitude), Number(loc.longitude)];

        if (!Number.isFinite(position[0]) || !Number.isFinite(position[1])) {
          return null;
        }

        return (
          <Marker
            key={loc.id || loc._id}
            position={position}
            icon={iconFor(loc.category?.color)}
            eventHandlers={{ click: () => onSelect?.(loc) }}
          >
            {/* autoPan en false: al abrir el popup el mapa se queda
                exactamente donde el usuario lo dejo */}
            <Popup autoPan={false}>
              <div className="map-popup">
                <b>{loc.name}</b>

                <span
                  className="popup-category"
                  style={{ '--popup-color': loc.category?.color || '#397f91' }}
                >
                  {loc.category?.name || 'Lugar turístico'}
                </span>

                {loc.description && <p>{loc.description}</p>}

                <span className="popup-coords">
                  {Number(position[0]).toFixed(5)}, {Number(position[1]).toFixed(5)}
                </span>

                <div className="popup-actions">
                  <button
                    type="button"
                    className="popup-action"
                    onClick={() => {
                      if (onViewDetails) onViewDetails(loc);
                      else onSelect?.(loc);
                    }}
                  >
                    Ver ficha
                  </button>

                  {/* La rubrica pide editar y eliminar desde el popup.
                      Solo se dibujan si esta sesion puede hacerlo: asi la
                      interfaz nunca ofrece algo que la API rechaza con 403. */}
                  {canModifyLocation(loc) && (
                    <>
                      <button
                        type="button"
                        className="popup-action ghost"
                        aria-label={`Editar ${loc.name}`}
                        onClick={() => onEditLocation?.(loc)}
                      >
                        <Pencil size={13} /> Editar
                      </button>

                      <button
                        type="button"
                        className="popup-action danger"
                        aria-label={`Eliminar ${loc.name}`}
                        onClick={() => onDeleteLocation?.(loc)}
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
