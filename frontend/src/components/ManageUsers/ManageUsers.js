import React, { useEffect, useState } from 'react';
import './ManageUsers.css'; // Make sure to include your styles

const ManageUsers = () => {
    const [users, setActivities] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserActivities = async () => {
            try {
                const response = await fetch('http://localhost:8087/viewUsers', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user activities');
                }

                const data = await response.json();
                setActivities(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUserActivities();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }


    return (
        <div className='view_user'>
        <main className="table" id="customers_table">
            <section className="table__header">
                <h1>User Management</h1>
                <div className="input-group">
                    <input
                        type="search"
                        placeholder="Search Data..."
                        value={""}
                        onChange={""}
                    />
                    <img src="images/search.png" alt="search" />
                </div>
            </section>
            <section className="table__body">
                <table>
                    <thead>
                        <tr>
                            <th>Id </th>
                            <th>Name </th>
                            <th>Email</th>
                            <th>Created Date </th>
                            <th>User Type </th>
                            <th>Delete </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(data => (
                            <tr key={data.id}>
                                <td>{data.id}</td>
                                <td>{data.name}</td>
                                <td>{data.email}</td>
                                <td>{data.created_at}</td>
                                <td>
                                    <p >{data.userType}</p>
                                </td>
                                <td>
                                    <button className="logout-btn">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
        </div>
    );
};

export default ManageUsers;
