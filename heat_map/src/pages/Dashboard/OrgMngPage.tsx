import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const OrgMangPage: React.FC = () => {
  const { id } = useParams();  // Get the organizer ID from the URL
  const navigate = useNavigate(); // To redirect after saving
  const [organizer, setOrganizer] = useState<any>({
    organizer_name: '',
    fname: '',
    lname: '',
    email: '',
    contact_no: '',
    password: ''
  });
  const [organizers, setOrganizers] = useState<any[]>([]);

  useEffect(() => {
    if (!id) {
      console.error('Organizer ID is missing');
      return;
    }

    // Fetch the organizer details by ID
    const fetchOrganizer = async () => {
      try {
        console.log('Fetching organizer with ID:', id);  // Log the ID being used for the fetch
        const response = await fetch(`http://localhost:5000/organizers/${id}`);
        const data = await response.json();
        
        // If no data is found, handle the case
        if (!data) {
          console.error('No organizer found with this ID');
          return;
        }

        setOrganizer(data);
      } catch (error) {
        console.error('Error fetching organizer:', error);
      }
    };

    fetchOrganizer();
  }, [id]);

  useEffect(() => {
    // Fetch all organizers for the table
    const fetchOrganizers = async () => {
      try {
        const response = await fetch('http://localhost:5000/organizers');
        const data = await response.json();
        setOrganizers(data);
      } catch (error) {
        console.error('Error fetching organizers:', error);
      }
    };

    fetchOrganizers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrganizer({ ...organizer, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/organizers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(organizer),
      });
      
      const result = await response.json();
      alert(result.message);
      navigate('/organizers');  // Redirect to the organizer list after update
    } catch (error) {
      console.error('Error updating organizer:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Edit Organizer</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Organizer Name</label>
            <input
              type="text"
              name="organizer_name"
              value={organizer.organizer_name}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="fname"
              value={organizer.fname}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lname"
              value={organizer.lname}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={organizer.email}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact No</label>
            <input
              type="text"
              name="contact_no"
              value={organizer.contact_no}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={organizer.password}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border rounded-md"
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md">Update Organizer</button>
        </div>
      </form>

      <h2 className="text-xl font-bold mb-4 mt-8">Organizers List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Organizer Name</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizers.map((org) => (
              <tr key={org.organizer_id}>
                <td>{org.organizer_name}</td>
                <td className="py-2 px-4 border-b">
                  <button className="text-blue-600 hover:underline">Edit</button>
                  <button className="text-red-600 hover:underline ml-4">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrgMangPage;
