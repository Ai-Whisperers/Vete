interface ApiKey {
  id: number;
  key: string;
  scope: string;
}

interface Scope {
  id: number;
  name: string;
}

export { ApiKey, Scope };