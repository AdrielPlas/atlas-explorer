import React, { useEffect } from 'react';
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

function Fit({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);

  return null;
}

function FitSelectedZone({ zonesGeo, selectedZoneId }) {
  const map = useMap();

  useEffect(() => {
    if (!zonesGeo?.features || !selectedZoneId) return;

    const feature = zonesGeo.features.find((f) => {
      const props = f.properties || {};
      const id = props.id ?? props._id ?? props.zoneId;
      return String(id) === String(selectedZoneId);
    });

    if (!feature) return;

    const bounds = L.geoJSON(feature).getBounds();
    if (bounds.isValid()) {
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
  // Editar y eliminar se hacen desde el propio popup del marcador
  onEditLocation,
  onDeleteLocation,
  canModify = false
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
            <Popup>
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

                  {/* La rubrica pide editar y eliminar desde el popup */}
                  {canModify && (
                    <>
                      <button
                        type="button"
                        className="popup-action ghost"
                        onClick={() => onEditLocation?.(loc)}
                      >
                        <Pencil size={13} /> Editar
                      </button>

                      <button
                        type="button"
                        className="popup-action danger"
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
