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

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={false}
      className="h-[420px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
              color: isSelected ? "#3e5c47" : "#2f241b",
              fillColor: isSelected ? "#d6a663" : "#c69352",
              fillOpacity: isSelected ? 0.95 : 1,
              weight: isSelected ? 2 : 2,
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
