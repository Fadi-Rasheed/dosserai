import {
  File,
  FileCode2,
  FileText,
  FileType,
  ScanText,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

type UploadFormat = {
  label: string;
  icon: LucideIcon;
};

const formats: UploadFormat[] = [
  { label: "PDF", icon: FileText },
  { label: "DOCX", icon: File },
  { label: "TXT", icon: FileType },
  { label: "Markdown", icon: FileCode2 },
  { label: "Scans", icon: ScanText },
];

export const UploadFormatBadges = () => {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-3">
      {formats.map((format) => (
        <li key={format.label}>
          <Badge
            variant="secondary"
            className="h-8 gap-2 rounded-full px-3 font-medium"
          >
            <format.icon className="size-4" aria-hidden="true" />
            {format.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
};
