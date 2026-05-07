import { TEMPLATE_COMPONENTS, type TemplateKey } from "./templateRegistry";

export interface PublicPreviewProps {
  templateKey: TemplateKey;
}

export default function PublicPreview({ templateKey }: PublicPreviewProps) {
  const Template = TEMPLATE_COMPONENTS[templateKey];
  return <Template />;
}
