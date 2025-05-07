import {
      generateUploadButton,
      generateUploadDropzone,
    } from "@uploadthing/react";
    
    import type { OurFileRouter } from "../app/api/uploadingthing/core";
    
    export const UploadButton = generateUploadButton<OurFileRouter>();
    export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
    