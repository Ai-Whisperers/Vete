interface Prescription {
  id: string;
  file: string;
  status: string;
  expiryDate: Date | null;
}

export { Prescription };