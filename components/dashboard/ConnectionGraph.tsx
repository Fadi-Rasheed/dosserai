import { Link2 } from "lucide-react";

import type { DocumentConnection } from "@/lib/types";
import { formatSimilarity } from "@/lib/format";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ConnectionGraphProps = {
  documentFilename: string;
  connections: DocumentConnection[];
};

export const ConnectionGraph = ({
  documentFilename,
  connections,
}: ConnectionGraphProps) => {
  if (connections.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lift">
      <CardHeader className="gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-foreground">
          <Link2 className="size-5" aria-hidden="true" />
        </span>
        <CardTitle className="text-lg font-semibold">
          Related to {documentFilename}
        </CardTitle>
        <CardDescription className="text-base leading-6">
          Cross-document links computed at upload time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {connections.map((connection) => (
            <li
              key={connection.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3"
            >
              <span className="min-w-0 truncate text-sm font-medium text-foreground">
                {connection.filename}
              </span>
              <Badge variant="outline" className="shrink-0 rounded-full">
                {formatSimilarity(connection.similarity)} match
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
