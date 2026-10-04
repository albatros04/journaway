import { TripDocumentEditor } from "@/components/trip-document-editor";
export default async function TripDocumentPage({ params }: { params: Promise<{ packageId: string }> }) {
  return <TripDocumentEditor tripId={(await params).packageId} />;
}
