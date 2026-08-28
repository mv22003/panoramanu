'use client'

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { Photo } from "@/lib/photos";

type PhotoMapProps = {
  photos: Photo[];
  selectedPhotoId: string;
  onSelectPhoto: (photoId: string) => void;
};

function MapViewport({ photo }: { photo: Photo | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (!photo) {
      return;
    }

    map.flyTo([photo.lat, photo.lng], 13, {
      duration: 1.2,
    });
  }, [map, photo]);

  return null;
}

export default function PhotoMap({
  photos,
  selectedPhotoId,
  onSelectPhoto,
}: PhotoMapProps) {
  const selectedPhoto =
    photos.find((photo) => photo.id === selectedPhotoId) ?? photos[0];

  return (
    <MapContainer
      center={[selectedPhoto?.lat ?? 51.5074, selectedPhoto?.lng ?? -0.1278]}
      zoom={12}
      scrollWheelZoom={false}
      className="h-[420px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewport photo={selectedPhoto} />

      {photos.map((photo) => {
        const isSelected = photo.id === selectedPhotoId;

        return (
          <CircleMarker
            key={photo.id}
            center={[photo.lat, photo.lng]}
            radius={isSelected ? 11 : 8}
            pathOptions={{
              color: isSelected ? "#3e5c47" : "#5b4a3e",
              fillColor: isSelected ? "#d6a663" : "#f2ede4",
              fillOpacity: 0.95,
              weight: isSelected ? 2 : 1,
            }}
            eventHandlers={{
              click: () => onSelectPhoto(photo.id),
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-stone-900">{photo.title}</p>
                <p className="text-xs text-stone-600">{photo.locationName}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
