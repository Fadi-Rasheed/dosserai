import type { SourceCitation as SourceCitationType } from "@/lib/types";

import { Badge } from "@/components/ui/badge";

type SourceCitationProps = {
  source: SourceCitationType;
};

export const SourceCitation = ({ source }: SourceCitationProps) => {
  return (
    <Badge
      variant="secondary"
      className="h-7 rounded-full px-3 font-medium"
    >
      {source.filename} · chunk {source.chunkIndex}
    </Badge>
  );
};
