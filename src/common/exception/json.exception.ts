export class JsonException extends Error {
  constructor(
    public message: string,
    public status: number,
    public json: Record<string, any>,
  ) {
    super();
  }
}
