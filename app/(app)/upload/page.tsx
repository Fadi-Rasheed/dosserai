import type { Metadata } from "next";

import { UploadPage } from "./UploadPage";

export const metadata: Metadata = {
  title: "Upload",
};

const Upload = () => {
  return <UploadPage />;
};

export default Upload;
