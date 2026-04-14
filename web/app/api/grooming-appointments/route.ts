import { NextApiRequest, NextApiResponse } from 'next';
import { createGroomingAppointment, updateGroomingAppointment } from './actions';

const groomingAppointmentsRoute = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case 'POST':
      return createGroomingAppointment(req, res);
    case 'PATCH':
      return updateGroomingAppointment(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};

export default groomingAppointmentsRoute;