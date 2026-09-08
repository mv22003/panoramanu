'use client'

import { useEffect } from "react";
import { latLngBounds } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
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

export default function PhotoMap({
  photos,
  selectedPhotoId,
  onSelectPhoto,
}: PhotoMapProps) {
  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId);
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

      <MapViewport photo={selectedPhoto} photos={photos} />

      {photos.map((photo) => {
        const isSelected = photo.id === selectedPhotoId;

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
    </MapContainer>
  );
}
