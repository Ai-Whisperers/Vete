import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TreatmentTemplate, Task, Staff } from '../types';

interface TreatmentSheetProps {
  petId: number;
}

const TreatmentSheet: React.FC<TreatmentSheetProps> = ({ petId }) => {
  const [treatmentTemplates, setTreatmentTemplates] = useState<TreatmentTemplate[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TreatmentTemplate | null>(null);

  useEffect(() => {
    const fetchTreatmentTemplates = async () => {
      const { data, error } = await supabase
        .from('treatment_templates')
        .select('*');
      if (error) {
        console.error(error);
      } else {
        setTreatmentTemplates(data);
      }
    };
    fetchTreatmentTemplates();
  }, []);

  const handleTemplateSelect = (template: TreatmentTemplate) => {
    setSelectedTemplate(template);
  };

  const handleTaskCreate = async (task: Task) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task]);
    if (error) {
      console.error(error);
    } else {
      setTasks([...tasks, data[0]]);
    }
  };

  const handleStaffAssign = async (staffId: number, taskId: number) => {
    const { data, error } = await supabase
      .from('task_assignments')
      .insert([{ staff_id: staffId, task_id: taskId }]);
    if (error) {
      console.error(error);
    }
  };

  const handleTaskComplete = async (taskId: number) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ id: taskId }, { completed: true });
    if (error) {
      console.error(error);
    } else {
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: true } : task)));
    }
  };

  return (
    <div>
      <h1>Treatment Sheet</h1>
      <select value={selectedTemplate?.id} onChange={(e) => handleTemplateSelect(treatmentTemplates.find((template) => template.id === parseInt(e.target.value, 10)))}>
        {treatmentTemplates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input type="checkbox" checked={task.completed} onChange={() => handleTaskComplete(task.id)} />
            <span>{task.name}</span>
            <select value={task.staff_id} onChange={(e) => handleStaffAssign(parseInt(e.target.value, 10), task.id)}>
              {staff.map((staffMember) => (
                <option key={staffMember.id} value={staffMember.id}>
                  {staffMember.name}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
      <button onClick={() => handleTaskCreate({ name: 'New Task', pet_id: petId })}>Create Task</button>
    </div>
  );
};

export default TreatmentSheet;