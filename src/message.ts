"use babel";

export default class message {
  constructor(
    public excerpt: string,
    public severity: "error" | "warning" | "info",
    public location: {
      file?: string,
      line?: number,
      word?: string
      err?: number
    }
  ) {}
}
