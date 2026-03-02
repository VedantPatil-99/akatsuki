export type AuthMode = "login" | "signup";

export interface AuthMessage {
  type: "success" | "error";
  text: string;
}
