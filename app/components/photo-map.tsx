'use client'

import { useEffect, useMemo, useState } from "react";
import { divIcon, latLngBounds } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import type { Photo } from "@/lib/photos";

type PhotoMapProps = {
  photos: Photo[];
  selectedPhotoId: string;
  onSelectPhoto: (photoId: string) => void;
};

function MapViewport({
  photo,
  photos,
}: {
  photo: Photo | undefined;
  photos: Photo[];
}) {
  const map = useMap();

  useEffect(() => {
    if (photo) {
      map.flyTo([photo.lat, photo.lng], 13, {
        duration: 1.2,
      });
      return;
    }

    if (photos.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    if (photos.length === 1) {
      map.flyTo([photos[0].lat, photos[0].lng], 13, {
        duration: 1.2,
      });
      return;
    }

    const bounds = latLngBounds(photos.map((item) => [item.lat, item.lng] as [number, number]));
    map.flyToBounds(bounds, {
      duration: 1.2,
      maxZoom: 5,
      padding: [48, 48],
    });
  }, [map, photo, photos]);

  return null;
}

function PhotoMarkers({
  photos,
  selectedPhotoId,
  onSelectPhoto,
}: PhotoMapProps) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  const photoGroups = useMemo(() => {
    const groups = new Map<string, Photo[]>();

    for (const photo of photos) {
      const key = `${photo.lat},${photo.lng}`;
      const group = groups.get(key);
      if (group) group.push(photo);
      else groups.set(key, [photo]);
    }

    const clusters: { key: string; photos: Photo[]; point: ReturnType<typeof map.project> }[] = [];
    const worldWidth = map.getPixelWorldBounds(zoom).getSize().x;
    for (const [key, group] of groups) {
      const point = map.project([group[0].lat, group[0].lng], zoom);
      const cluster = clusters.find((candidate) => {
        const dx = Math.abs(candidate.point.x - point.x) % worldWidth;
        return Math.hypot(Math.min(dx, worldWidth - dx), candidate.point.y - point.y) < 48;
      });
      if (cluster) cluster.photos.push(...group);
      else clusters.push({ key, photos: [...group], point });
    }
    return clusters;
  }, [map, photos, zoom]);

  return (
    <>
      {photoGroups.map(({ key, photos: group }) => {
        const photo = group[0];
        const isSelected = group.some((item) => item.id === selectedPhotoId);
        const sameCoordinates = group.every((item) => item.lat === photo.lat && item.lng === photo.lng);
        const showPicker = sameCoordinates || zoom >= map.getMaxZoom();
        const bounds = latLngBounds(group.map((item) => [item.lat, item.lng > photo.lng + 180 ? item.lng - 360 : item.lng < photo.lng - 180 ? item.lng + 360 : item.lng] as [number, number]));

        if (group.length > 1) {
          return (
            <Marker
              key={`${key}-${showPicker ? "picker" : "cluster"}`}
              position={bounds.getCenter()}
              title={`${group.length} frames — ${showPicker ? "choose a frame" : "zoom in"}`}
              alt={`${group.length} frames`}
              eventHandlers={showPicker ? undefined : {
                click: () => map.flyToBounds(bounds, {
                  padding: [48, 48],
                  maxZoom: Math.min(map.getMaxZoom(), zoom + 3),
                  duration: 0.8,
                }),
              }}
              icon={divIcon({
                className: `photo-map-group${isSelected ? " photo-map-group-selected" : ""}`,
                html: `<span>${group.length}</span>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -18],
              })}
            >
              {showPicker ? <Popup minWidth={220} maxWidth={280} autoPan={false}>
                <div className="text-[10px] uppercase tracking-[0.16em] text-stone-400">
                  {group.length} frames {sameCoordinates ? "at this location" : "nearby"}
                </div>
                <div className="mt-3 max-h-56 overflow-y-auto" role="group" aria-label="Choose a frame">
                  {group.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={item.id === selectedPhotoId}
                      onClick={() => onSelectPhoto(item.id)}
                      className={`flex w-full items-baseline gap-3 rounded px-2 py-3 text-left transition hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-amber-200 ${
                        item.id === selectedPhotoId ? "bg-stone-800 text-amber-200" : "text-stone-200"
                      }`}
                    >
                      <span className="text-xs text-stone-500">{index + 1}</span>
                      <span>{item.title || `Frame ${index + 1}`}</span>
                    </button>
                  ))}
                </div>
              </Popup> : null}
            </Marker>
          );
        }

        return (
          <CircleMarker
            key={photo.id}
            center={[photo.lat, photo.lng]}
            radius={isSelected ? 11 : 10}
            pathOptions={{
              color: isSelected ? "#f3d39a" : "#15110d",
              fillColor: isSelected ? "#e7b86e" : "#c69352",
              fillOpacity: isSelected ? 1 : 0.92,
              weight: isSelected ? 3 : 2,
            }}
            eventHandlers={{
              click: () => onSelectPhoto(photo.id === selectedPhotoId ? "" : photo.id),
            }}
          />
        );
      })}
    </>
  );
}

export default function PhotoMap(props: PhotoMapProps) {
  const selectedPhoto = props.photos.find((photo) => photo.id === props.selectedPhotoId);
  const cartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY?.trim();
  const cartoTileUrl = `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${
    cartoApiKey ? `?key=${encodeURIComponent(cartoApiKey)}` : ""
  }`;

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      attributionControl
      className="h-[min(58vh,520px)] min-h-[360px] w-full"
      scrollWheelZoom={false}
      worldCopyJump
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={cartoTileUrl}
      />
      <MapViewport photo={selectedPhoto} photos={props.photos} />
      <PhotoMarkers {...props} />
    </MapContainer>
  );
}
