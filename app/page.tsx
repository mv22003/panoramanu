import PortfolioShell from "@/app/components/portfolio-shell";
import { getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

export default async function Home() {
  const photos = await getPhotos();

  return (
    <PortfolioShell initialPhotos={photos} />
  );
}
