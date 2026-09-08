import PortfolioShell from "@/app/components/portfolio-shell";
import VisitTracker from "@/app/components/visit-tracker";
import { getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

export default async function Home() {
  const photos = await getPhotos();

  return (
    <>
      <VisitTracker />
      <PortfolioShell initialPhotos={photos} />
    </>
  );
}
