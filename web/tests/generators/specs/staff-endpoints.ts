/**
 * Staff API Endpoint Specifications
 *
 * These endpoints are accessible by veterinary staff for clinical operations,
 * patient management, appointments, and medical records.
 */

import { EndpointSpec } from '../permission-test-generator';

let testPatientId = 'test-patient-id';
let testMedicalRecordId = 'test-medical-record-id';
let testPrescriptionId = 'test-prescription-id';
let testLabOrderId = 'test-lab-order-id';
let testAppointmentId = 'test-appointment-id';
let testInvoiceId = 'test-invoice-id';
let testKennelId = 'test-kennel-id';
let testProductId = 'test-product-id';
let testServiceId = 'test-service-id';

export const staffEndpoints: EndpointSpec[] = [
  // Patient Management (vet + admin)
  {
    method: 'GET',
    path: '/api/staff/patients',
    description: 'List all patients',
    allowedRoles: ['vet', 'admin'],
    requestBody: {
      search: 'John Doe',
      species: 'dog',
      limit: 50,
    },
  },
  // ...
];

Note: The above code snippets are just examples and may need to be modified to fit the specific requirements of your project. Additionally, you may need to add more test cases and functionality to ensure that your integration tests are comprehensive.