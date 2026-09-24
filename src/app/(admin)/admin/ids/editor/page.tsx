import { getIDTemplateById } from "@/features/ids/id.actions";
import { IDEditorClient } from "@/components/ids/id-card-editor";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function IDEditorPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  let initialTemplate = null;

  if (id) {
    const res = await getIDTemplateById(id);
    initialTemplate = res.data;
  }

  return <IDEditorClient initialTemplate={initialTemplate} />;
}
