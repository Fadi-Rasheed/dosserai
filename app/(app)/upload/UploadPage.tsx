import { PageHeader } from "@/components/shared";
import { UploadDropzone, UploadFormatBadges } from "@/components/upload";
import { MAX_UPLOAD_BYTES } from "@/lib/config";
import { formatFileSize } from "@/lib/format";

export const UploadPage = () => {
  return (
    <main className="flex min-h-0 flex-1 flex-col px-6 py-8 sm:px-10">
      <PageHeader
        title="Upload"
        description={`Extract, chunk, and embed in one step. We discard the original file as soon as processing finishes. Max ${formatFileSize(MAX_UPLOAD_BYTES)} per file.`}
      />

      <div className="mt-10 flex flex-1 flex-col items-center gap-10">
        <UploadDropzone />
        <UploadFormatBadges />
      </div>
    </main>
  );
};
