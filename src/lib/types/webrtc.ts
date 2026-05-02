export interface WebRTCFilePayload {
  file: ArrayBuffer;
  fileName: string;
  fileType: string;
}

export type TransferStatus =
  | "connecting"
  | "ready"
  | "sending"
  | "done"
  | "error";
