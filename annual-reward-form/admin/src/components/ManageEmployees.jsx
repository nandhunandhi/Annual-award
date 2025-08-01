import React, { useEffect, useState, useRef } from 'react';
import './ManageEmployees.css';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    email: '',
    department: '',
    designation: '',
    division: '', // ✅ new field
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const API_URL = 'http://localhost:5000/api/employees';
  const formRef = useRef(null);

  const loadEmployees = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Load error:', err);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name' && editingId) {
      const selectedEmp = employees.find(emp => emp.name === value);
      if (selectedEmp) {
        setFormData({
          name: selectedEmp.name,
          empId: selectedEmp.empId || selectedEmp.id || '',
          email: selectedEmp.email || '',
          department: selectedEmp.department,
          designation: selectedEmp.designation,
          division: selectedEmp.division || '', // ✅ include division here too
        });
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      empId: '',
      email: '',
      department: '',
      designation: '',
      division: '', // ✅ reset division
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmpId = String(formData.empId).trim();
    const normalizedEditingId = String(editingId || '').trim();

    const isDuplicate = employees.some(emp => {
      const currentEmpId = String(emp.empId || emp.id).trim();
      const currentRecordId = String(emp._id || emp.id).trim();
      return currentEmpId === trimmedEmpId && currentRecordId !== normalizedEditingId;
    });

    if (isDuplicate) {
      alert('⚠️ This Employee ID is already assigned to another employee.');
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadEmployees();
        resetForm();
        setMessage(editingId ? 'Employee updated successfully!' : 'Employee added successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert('❌ Failed to save employee.');
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleRowClick = (emp) => {
    setFormData({
      name: emp.name,
      empId: emp.empId || emp.id || '',
      email: emp.email || '',
      department: emp.department,
      designation: emp.designation,
      division: emp.division || '', // ✅ pre-fill division
    });
    setEditingId(emp._id || emp.id);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) loadEmployees();
      else alert('Delete failed');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="admin-emp-wrapper">
      <h1>👥 Manage Employees</h1>

      <form className="emp-form" onSubmit={handleSubmit} ref={formRef}>
        {editingId ? (
          <select name="name" value={formData.name} onChange={handleChange} required>
            <option value="">Select employee name</option>
            {employees.map(emp => (
              <option key={emp._id || emp.id} value={emp.name}>
                {emp.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Employee Name"
            required
          />
        )}

        <input
          name="empId"
          value={formData.empId}
          onChange={handleChange}
          placeholder="Employee ID"
          required
        />

        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          required
        />

        <input
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Department"
          required
        />

        <input
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          placeholder="Designation"
          required
        />

        <input
          name="division"
          value={formData.division}
          onChange={handleChange}
          placeholder="Division"
          required
        />

        <button type="submit">{editingId ? 'Update' : 'Add'} Employee</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {message && <div className="success-message">{message}</div>}

      <table className="emp-table">
        <thead>
          <tr>
            <th>Division</th> 
            <th>Name</th>
            <th>Emp ID</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            {/* ✅ display division */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr><td colSpan="7">No employees found.</td></tr>
          ) : (
            employees.map(emp => (
              <tr
                key={emp._id || emp.id}
                className={editingId === (emp._id || emp.id) ? 'editing-row' : ''}
                onClick={() => handleRowClick(emp)}
                style={{ cursor: 'pointer' }}
              >
                <td>{emp.division || '—'}</td> 
                <td>{emp.name}</td>
                <td>{emp.empId || emp.id}</td>
                <td>{emp.email || '—'}</td>
                <td>{emp.department}</td>
                <td>{emp.designation}</td>
                {/* ✅ division display */}
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(emp._id || emp.id);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageEmployees;
