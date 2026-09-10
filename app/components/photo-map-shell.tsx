'use client'

import dynamic from "next/dynamic";

import type { Photo } from "@/lib/photos";

type PhotoMapShellProps = {
  photos: Photo[];
  selectedPhotoId: string;
  onSelectPhoto: (photoId: string) => void;
  resetViewKey: number;
};

const PhotoMap = dynamic(() => import("@/app/components/photo-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center text-sm text-stone-400">
      Loading map...
    </div>
  ),
});

export default function PhotoMapShell(props: PhotoMapShellProps) {
  return <PhotoMap {...props} />;
}
