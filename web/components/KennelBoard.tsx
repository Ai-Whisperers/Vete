import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Kennel, Patient } from '../types';

interface KennelBoardProps {
  kennels: Kennel[];
  patients: Patient[];
}

const KennelBoard: React.FC<KennelBoardProps> = ({ kennels, patients }) => {
  const [occupancyStatus, setOccupancyStatus] = useState({});
  const [patientAssignments, setPatientAssignments] = useState({});

  useEffect(() => {
    const fetchOccupancyStatus = async () => {
      const { data, error } = await supabase
        .from('kennels')
        .select('id, occupancy_status');
      if (error) {
        console.error(error);
      } else {
        const occupancyStatus = data.reduce((acc, kennel) => {
          acc[kennel.id] = kennel.occupancy_status;
          return acc;
        }, {});
        setOccupancyStatus(occupancyStatus);
      }
    };

    const fetchPatientAssignments = async () => {
      const { data, error } = await supabase
        .from('patient_assignments')
        .select('kennel_id, patient_id');
      if (error) {
        console.error(error);
      } else {
        const patientAssignments = data.reduce((acc, assignment) => {
          acc[assignment.kennel_id] = assignment.patient_id;
          return acc;
        }, {});
        setPatientAssignments(patientAssignments);
      }
    };

    fetchOccupancyStatus();
    fetchPatientAssignments();
  }, [kennels, patients]);

  const handlePatientAssignment = async (kennelId: number, patientId: number) => {
    const { data, error } = await supabase
      .from('patient_assignments')
      .insert({ kennel_id: kennelId, patient_id: patientId });
    if (error) {
      console.error(error);
    } else {
      setPatientAssignments((prevAssignments) => ({ ...prevAssignments, [kennelId]: patientId }));
    }
  };

  const handleCleaningSchedule = async (kennelId: number) => {
    // TO DO: implement cleaning schedule logic
  };

  return (
    <div>
      <h1>Kennel Board</h1>
      <table>
        <thead>
          <tr>
            <th>Kennel ID</th>
            <th>Occupancy Status</th>
            <th>Patient Assignment</th>
            <th>Cleaning Schedule</th>
          </tr>
        </thead>
        <tbody>
          {kennels.map((kennel) => (
            <tr key={kennel.id}>
              <td>{kennel.id}</td>
              <td>{occupancyStatus[kennel.id]}</td>
              <td>
                <select
                  value={patientAssignments[kennel.id]}
                  onChange={(e) => handlePatientAssignment(kennel.id, parseInt(e.target.value))}
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => handleCleaningSchedule(kennel.id)}>Schedule Cleaning</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KennelBoard;